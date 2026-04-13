import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME = 'rsvps paths' } = env;

	if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
		return json({ count: 0 });
	}

	let count = 0;
	let offset: string | undefined;

	do {
		const url = new URL(
			`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`
		);
		url.searchParams.set('pageSize', '100');
		url.searchParams.set('fields[]', 'Email');
		if (offset) url.searchParams.set('offset', offset);

		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
		});

		if (!res.ok) {
			console.error('Airtable count error:', res.status, await res.text());
			break;
		}

		const data = await res.json();
		count += data.records.length;
		offset = data.offset;
	} while (offset);

	return json({ count });
};
