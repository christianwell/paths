import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { email } = await request.json();

	if (!email || typeof email !== 'string') {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME = 'rsvps paths' } = env;

	if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
		return json({ error: 'Airtable not configured' }, { status: 500 });
	}

	// Check if this email already RSVPed
	try {
		const url = new URL(
			`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`
		);
		url.searchParams.set('maxRecords', '1');
		url.searchParams.set('filterByFormula', `({Email} = '${email.replace(/'/g, "\\'")}')`);

		const existsRes = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
		});
		if (existsRes.ok) {
			const data = await existsRes.json();
			if (data.records?.length) {
				return json({ success: true, already: true });
			}
		}
	} catch (e) {
		console.error('Airtable duplicate check error (email form):', e);
	}

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
				if (allowed.has('Name')) fieldsToSend.Name = '';
				if (allowed.has('source')) (fieldsToSend as any).source = 'email-form';
			}
		}
	} catch (e) {
		console.error('Airtable meta error (email form):', e);
	}

	const res = await fetch(
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

	if (!res.ok) {
		const err = await res.text();
		console.error('Airtable error:', err);
		return json({ error: 'Failed to save RSVP' }, { status: 500 });
	}

	return json({ success: true });
};
