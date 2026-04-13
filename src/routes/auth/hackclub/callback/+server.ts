import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const code = url.searchParams.get('code');
	if (!code) {
		console.error('Hack Club callback missing code param');
		return new Response('Missing authorization code', { status: 400 });
	}

	console.log('Hack Club callback received code (length):', code.length);

	const {
		HACKCLUB_CLIENT_ID,
		HACKCLUB_CLIENT_SECRET,
		HACKCLUB_REDIRECT_URI,
		AIRTABLE_API_KEY,
		AIRTABLE_BASE_ID,
		AIRTABLE_TABLE_NAME = 'rsvps paths'
	} = env;

	if (!HACKCLUB_CLIENT_ID || !HACKCLUB_CLIENT_SECRET || !HACKCLUB_REDIRECT_URI) {
		console.error('Hack Club env missing', {
			hasClientId: !!HACKCLUB_CLIENT_ID,
			hasSecret: !!HACKCLUB_CLIENT_SECRET,
			hasRedirect: !!HACKCLUB_REDIRECT_URI
		});
		return new Response('Hack Club auth not configured', { status: 500 });
	}

	console.log('Hack Club env OK, exchanging code for token');

	// Exchange code for access token
	const tokenRes = await fetch('https://auth.hackclub.com/oauth/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: HACKCLUB_CLIENT_ID,
			client_secret: HACKCLUB_CLIENT_SECRET,
			redirect_uri: HACKCLUB_REDIRECT_URI,
			code,
			grant_type: 'authorization_code'
		})
	});

	const tokenData = await tokenRes.json().catch(() => null);

	if (!tokenRes.ok || !tokenData?.access_token) {
		console.error('Token exchange failed:', tokenRes.status, tokenData);
		return new Response('Authentication failed: ' + JSON.stringify(tokenData), { status: 500 });
	}

	console.log('Hack Club token OK');

	const { access_token } = tokenData;

	// Get user info
	const meRes = await fetch('https://auth.hackclub.com/api/v1/me', {
		headers: { Authorization: `Bearer ${access_token}` }
	});

	if (!meRes.ok) {
		console.error('Failed to get user info:', await meRes.text());
		return new Response('Failed to get user info', { status: 500 });
	}

	const user = await meRes.json();

	const email =
		user.email ||
		user.email_address ||
		user.emailAddress ||
		user.profile?.email ||
		user.profile?.email_address ||
		user.identity?.primary_email ||
		'user@unknown';

	const name =
		// Prefer Slack ID when available
		user.slack_id ||
		user.slack?.id ||
		// fallbacks if Hack Club later adds real name fields
		user.name ||
		user.profile?.name ||
		[user.first_name, user.last_name].filter(Boolean).join(' ') ||
		user.identity?.id ||
		(email && typeof email === 'string' ? email.split('@')[0] : '') ||
		'';


	// Save RSVP to Airtable
	if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {

		let already = false;

		// Check if this email already RSVPed
		try {
			const url = new URL(
				`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`
			);
			url.searchParams.set('maxRecords', '1');
			url.searchParams.set('filterByFormula', `({Email} = '${String(email).replace(/'/g, "\\'")}')`);

			const existsRes = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
			});
			if (existsRes.ok) {
				const data = await existsRes.json();
				if (data.records?.length) {
					already = true;
				}
			}
		} catch (e) {
			console.error('Airtable duplicate check error (hackclub):', e);
		}

		if (!already) {
			// Build fields based on actual Airtable columns
			let fieldsToSend: Record<string, unknown> = { Email: email };

			try {
				const metaRes = await fetch(
					`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
					{
						headers: {
							Authorization: `Bearer ${AIRTABLE_API_KEY}`
						}
					}
				);

				if (metaRes.ok) {
					const meta = await metaRes.json();
					const table = meta.tables?.find(
						(t: any) => t.name === AIRTABLE_TABLE_NAME || t.id === AIRTABLE_TABLE_NAME
					);

					if (table?.fields) {
						const fieldNames = table.fields.map((f: any) => f.name);
						const allowed = new Set(fieldNames);
						if (allowed.has('Name')) fieldsToSend.Name = user.name || '';
						if (allowed.has('source')) (fieldsToSend as any).source = 'hackclub-auth';
					}
				}
			} catch (e) {
				console.error('Airtable meta error (hackclub):', e);
			}

			const airtableRes = await fetch(
				`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${AIRTABLE_API_KEY}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						records: [
							{
								fields: fieldsToSend
							}
						]
					})
				}
			);

			if (!airtableRes.ok) {
				console.error('Airtable error:', await airtableRes.text());
			} else {
				console.log('Hack Club RSVP stored in Airtable');
			}
		}
	} else {
		console.warn('Skipping Airtable save, missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
	}

	// Redirect back to home with success
	redirect(302, '/?rsvp=success');
};
