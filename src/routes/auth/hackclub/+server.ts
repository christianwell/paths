import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const { HACKCLUB_CLIENT_ID, HACKCLUB_REDIRECT_URI } = env;

	if (!HACKCLUB_CLIENT_ID || !HACKCLUB_REDIRECT_URI) {
		return new Response('Hack Club auth not configured', { status: 500 });
	}

	const authUrl = new URL('https://auth.hackclub.com/oauth/authorize');
	authUrl.searchParams.set('client_id', HACKCLUB_CLIENT_ID);
	authUrl.searchParams.set('redirect_uri', HACKCLUB_REDIRECT_URI);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', 'openid profile email');

	redirect(302, authUrl.toString());
};
