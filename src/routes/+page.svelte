<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import PathBadge from '$lib/PathBadge.svelte';

	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>(
		page.url.searchParams.get('rsvp') === 'success' ? 'success' : 'idle'
	);
	let errorMsg = $state('');
	let count = $state(0);
	const demoPrizes = [
		{ name: 'Raspberry Pi Zero', price: 20, img: 'https://assets.raspberrypi.com/static/4c1ac79e7c60c2e14e385c6e851de0c6/44af7/zero2-close-up.webp' },
		{ name: 'Yubikey', price: 55, img: 'https://www.yubico.com/wp-content/uploads/2022/12/YubiKey-5C-NFC-Front-Hanging.png' },
		{ name: 'ESP32 Kit', price: 20, img: 'https://cdn.sparkfun.com/assets/parts/2/3/4/8/3/23824-ESP32-S3-DevKitC-1-Feature.jpg' },
		{ name: 'Pinecil', price: 30, img: 'https://pine64.com/wp-content/uploads/2024/04/Pinecil-V2.2.png' },
		{ name: 'Flipper Zero', price: 170, img: 'https://shop.flipperzero.one/cdn/shop/files/top_800x.png' },
		{ name: 'Steam Deck', price: 550, img: 'https://cdn.cloudflare.steamstatic.com/steamdeck/images/decksd-oled.png' },
		{ name: 'iPad + Pencil', price: 450, img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-card-40-background-202405?wid=400&hei=500&fmt=p-jpg' },
		{ name: 'MacBook Air', price: 1100, img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-m4-midnight-select-202502?wid=400&hei=400&fmt=png-alpha' },
		{ name: 'Framework', price: 1000, img: 'https://frame.work/media/Framework_Laptop_13_DIY_AMD_front_1.png' },
		{ name: '3D Printer', price: 300, img: 'https://img.staticdj.com/bbde18a02d4f50b4fd9e9d01fe3d7e0c_1080.jpg' },
		{ name: 'Raspberry Pi 5', price: 60, img: 'https://assets.raspberrypi.com/static/e239a2d5e2af05e9c5bdd30c0e1e5674/3b52a/Raspberry-Pi-5-front.webp' },
		{ name: 'AirPods Pro', price: 250, img: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=400&hei=400&fmt=png-alpha' },
	];

	function minHrsPerWeek(price: number) {
		return Math.ceil(price / 5 / 17);
	}

	const demoSteps = [
		{ state: 'gold', label: 'Wk 1' },
		{ state: 'gold', label: 'Wk 2' },
		{ state: 'gold', label: 'Wk 3' },
		{ state: 'red', label: 'Wk 4' },
		{ state: 'gray', label: 'Wk 5' },
		{ state: 'gray', label: 'Wk 6' }
	] as const;

	const faqs = [
		{
			q: 'what do i do first?',
			a: "Pick the prize you want and tell us how many hours you'll ship each week. Every hour = $5 toward your goal. Then RSVP to get on a path!"
		},
		{
			q: 'what does the ai do?',
			a: 'You fill out a quick form and our AI designs a personalized path — up to 17 weeks of weekly themes tailored just for you.'
		},
		{
			q: 'what do i win?',
			a: ' Each week your prize levels up until you hit your goal. The longer you go, the bigger the reward until u hit ur reward!!'
		},
		{
			q: 'what if i miss a week?',
			a: "Your path ends there — but you still keep whatever prize you earned up to that point. Paths are designed so you always win something."
		},
		{
			q: 'how long is a path?',
			a: 'Up to 17 weeks max. The length depends on the prize you pick and how many hours per week you commit to shipping.'
		}
	] as const;

	let faqVisible = $state(false);
	let openIndex = $state(-1);

	function toggleFaq(i: number) {
		openIndex = openIndex === i ? -1 : i;
	}

	onMount(() => {
		const el = document.querySelector('.faq');
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) faqVisible = true;
				});
			},
			{ threshold: 0.15 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (typeof localStorage === 'undefined') return;
		if (localStorage.getItem('paths_rsvped') === '1') {
			status = 'success';
		}
	});

	$effect(() => {
		if (status === 'success' && typeof localStorage !== 'undefined') {
			localStorage.setItem('paths_rsvped', '1');
		}
	});

	$effect(() => {
		fetch('/api/count')
			.then((r) => r.json())
			.then((d) => (count = d.count))
			.catch(() => {});
	});

	async function handleRsvp(e: Event) {
		e.preventDefault();
		if (!email) return;

		status = 'loading';
		try {
			if (typeof localStorage !== 'undefined' && localStorage.getItem('paths_rsvped') === '1') {
				status = 'success';
				return;
			}

			const res = await fetch('/api/rsvp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			if (!res.ok) throw new Error('Failed to RSVP');
			status = 'success';
			email = '';
		} catch {
			status = 'error';
			errorMsg = 'Something went wrong. Try again!';
		}
	}
</script>

<svelte:head>
	<title>Paths</title>
	<meta property="og:title" content="Paths" />
	<meta property="og:description" content="Set a goal. Follow the path. Earn the reward" />
	<meta property="og:image" content="https://cdn.hackclub.com/019d8344-fef2-7d4d-a4e7-c7d2808d9e81/paths_card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Floating ambient blobs -->
<div class="bg-blobs" aria-hidden="true">
	<div class="blob blob-1"></div>
	<div class="blob blob-2"></div>
	<div class="blob blob-3"></div>
</div>

<main>
	<div class="hero">
		<div class="hero-inner">
			<a href="/" class="logo-link">
				<img src="/paths.svg" alt="Paths logo" class="logo" />
			</a>

			<p class="slogan">Set a goal. Follow the path. Earn the reward.</p>

			{#if count > 0}
				<div class="count-pill">
					<span class="count-dot"></span>
					{count} already rsvped!
				</div>
			{/if}

			{#if status === 'success'}
				<div class="success-card">
					<span class="success-emoji">🎉</span>
					<p class="success-msg">you have rsvped !</p>
				</div>
			{:else}
				<form class="rsvp-form" onsubmit={handleRsvp}>
					<input
						type="email"
						placeholder="you@email.com"
						bind:value={email}
						required
						disabled={status === 'loading'}
					/>
					<button type="submit" disabled={status === 'loading'}>
						{status === 'loading' ? '...' : 'rsvp'}
					</button>
				</form>

				{#if status === 'error'}
					<p class="error-msg">{errorMsg}</p>
				{/if}

				<div class="divider">
					<span class="divider-line"></span>
					<span class="divider-text">or</span>
					<span class="divider-line"></span>
				</div>

				<a href="/auth/hackclub" class="hack-club-btn">
					<img src="/hackclub.svg" alt="Hack Club" class="hc-icon" />
					rsvp with hack club
				</a>
			{/if}
		</div>
	</div>

	<div class="scroll-hint">
		<span class="scroll-hint-text">scroll for more</span>
		<span class="scroll-arrow">↓</span>
	</div>

	<section class="prizes">
		<h2 class="prizes-title">prizes you could earn 🎁</h2>
		<p class="prizes-sub">1 hour = $5 · up to 17 weeks</p>
		<div class="ticker-wrap">
			<div class="ticker">
				{#each [...demoPrizes, ...demoPrizes] as prize}
					<div class="prize-card">
						<img src={prize.img} alt={prize.name} class="prize-img" />
						<div class="prize-info">
							<span class="prize-name">{prize.name}</span>
							<span class="prize-meta">
								<span class="prize-hours">~{prize.price / 5} hours</span>
								<span class="prize-sep">·</span>
								<span class="prize-weekly">min {minHrsPerWeek(prize.price)} hrs/wk</span>
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="ticker-wrap ticker-reverse">
			<div class="ticker">
				{#each [...demoPrizes.slice().reverse(), ...demoPrizes.slice().reverse()] as prize}
					<div class="prize-card">
						<img src={prize.img} alt={prize.name} class="prize-img" />
						<div class="prize-info">
							<span class="prize-name">{prize.name}</span>
							<span class="prize-meta">
								<span class="prize-hours">~{prize.price / 5} hours</span>
								<span class="prize-sep">·</span>
								<span class="prize-weekly">min {minHrsPerWeek(prize.price)} hrs/wk</span>
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="faq" class:faqVisible>
		<div class="faq-inner">
			<div class="faq-left">
				<h2 class="faq-heading">
					<span>Set a goal.</span>
					<span class="red">Get the prize.</span>
				</h2>
				<div class="faq-badges">
					{#each demoSteps as step, i}
						<div class="badge-wrapper" style="animation-delay: {i * 0.08}s">
							<PathBadge state={step.state} size={46} label={step.label} />
							<span class="badge-label">{step.label}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="faq-right">
				{#each faqs as faq, i}
					<button
						class="faq-item"
						class:open={openIndex === i}
						style="--i: {i}"
						onclick={() => toggleFaq(i)}
					>
						<div class="faq-q">
							<span class="faq-q-text">{faq.q}</span>
							<span class="faq-toggle">{openIndex === i ? '−' : '+'}</span>
						</div>
						<div class="faq-a">
							<p>{faq.a}</p>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Quicksand', sans-serif;
		background: linear-gradient(160deg, #b8423f 0%, #c96f6f 40%, #d4827a 70%, #c96f6f 100%);
		min-height: 100vh;
		overflow-x: hidden;
	}

	/* ── Ambient blobs ── */
	.bg-blobs {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		opacity: 0.25;
	}

	.blob-1 {
		width: 600px;
		height: 600px;
		background: #f0a500;
		top: -200px;
		right: -150px;
		animation: float1 18s ease-in-out infinite;
	}

	.blob-2 {
		width: 500px;
		height: 500px;
		background: #ec3750;
		bottom: -100px;
		left: -200px;
		animation: float2 22s ease-in-out infinite;
	}

	.blob-3 {
		width: 350px;
		height: 350px;
		background: #ff7eb3;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation: float3 15s ease-in-out infinite;
	}

	@keyframes float1 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(-60px, 80px) scale(1.15); }
	}
	@keyframes float2 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(80px, -60px) scale(1.1); }
	}
	@keyframes float3 {
		0%, 100% { transform: translate(-50%, -50%) scale(1); }
		50% { transform: translate(-40%, -60%) scale(1.2); }
	}

	/* ── Layout ── */
	main {
		position: relative;
		z-index: 1;
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 1.25rem 5rem;
		box-sizing: border-box;
	}

	/* ── Hero ── */
	.hero {
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 0;
	}

	.hero-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		max-width: 480px;
		width: 100%;
		animation: fadeUp 0.8s ease-out;
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.logo-link {
		transition: transform 0.2s ease;
	}
	.logo-link:hover {
		transform: scale(1.03);
	}
	.logo-link:active {
		transform: scale(0.97);
	}

	.logo {
		width: 380px;
		max-width: 100%;
		display: block;
		filter: drop-shadow(0 8px 32px rgba(94, 13, 14, 0.35));
	}

	.slogan {
		color: rgba(255, 255, 255, 0.92);
		font-weight: 600;
		font-size: 1.15rem;
		text-align: center;
		margin: 0;
		letter-spacing: 0.01em;
	}

	/* ── Count pill ── */
	.count-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 1rem;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 999px;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.85rem;
		font-weight: 600;
		backdrop-filter: blur(8px);
	}

	.count-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #4ade80;
		box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
		animation: pulse-dot 2s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* ── RSVP form ── */
	.rsvp-form {
		display: flex;
		gap: 0.5rem;
		width: 100%;
	}

	.rsvp-form input {
		flex: 3;
		padding: 0.85rem 1.1rem;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-radius: 14px;
		font-family: 'Quicksand', sans-serif;
		font-size: 1rem;
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
		outline: none;
		backdrop-filter: blur(8px);
		transition: border-color 0.2s, background 0.2s;
	}

	.rsvp-form input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.rsvp-form input:focus {
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.18);
	}

	.rsvp-form button {
		flex: 1;
		padding: 0.85rem 1.5rem;
		border: none;
		border-radius: 14px;
		font-family: 'Quicksand', sans-serif;
		font-size: 1rem;
		font-weight: 700;
		background: #fff;
		color: #b8423f;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.2s;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	}

	.rsvp-form button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
	}

	.rsvp-form button:active {
		transform: translateY(1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.rsvp-form button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	/* ── Divider ── */
	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.divider-line {
		flex: 1;
		height: 1px;
		background: rgba(255, 255, 255, 0.2);
	}

	.divider-text {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	/* ── Hack Club button ── */
	.hack-club-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.8rem 1.6rem;
		background: #ec3750;
		color: white;
		font-family: 'Quicksand', sans-serif;
		font-size: 0.95rem;
		font-weight: 700;
		border: none;
		border-radius: 14px;
		text-decoration: none;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
		box-shadow: 0 4px 16px rgba(236, 55, 80, 0.3);
	}

	.hack-club-btn:hover {
		background: #d42f46;
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(236, 55, 80, 0.4);
	}

	.hack-club-btn:active {
		transform: translateY(1px);
	}

	.hc-icon {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: white;
	}

	/* ── Success card ── */
	.success-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 2rem;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		backdrop-filter: blur(12px);
		animation: fadeUp 0.5s ease-out;
	}

	.success-emoji {
		font-size: 2.5rem;
	}

	.success-msg {
		color: white;
		font-weight: 700;
		font-size: 1.3rem;
		margin: 0;
	}

	.error-msg {
		color: #ffc9c9;
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0;
	}

	/* ── Scroll hint ── */
	.scroll-hint {
		margin-top: -2rem;
		margin-bottom: 1rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
		font-weight: 600;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		animation: fadeUp 1.2s ease-out;
	}

	.scroll-arrow {
		font-size: 1rem;
		animation: bounce 1.6s ease-in-out infinite;
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(-3px); }
		50% { transform: translateY(6px); }
	}

	/* ── Prizes ticker ── */
	.prizes {
		width: 100%;
		padding: 3rem 0 2rem;
		overflow: hidden;
	}

	.prizes-title {
		text-align: center;
		color: #fff;
		font-size: clamp(1.4rem, 3.5vw, 2rem);
		font-weight: 800;
		margin: 0 0 0.4rem;
		letter-spacing: -0.01em;
	}

	.prizes-sub {
		text-align: center;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0 0 1.5rem;
	}

	.ticker-wrap {
		width: 100%;
		overflow: hidden;
		padding: 0.5rem 0;
		mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
	}

	.ticker {
		display: flex;
		gap: 0.75rem;
		width: max-content;
		animation: scroll-left 30s linear infinite;
	}

	.ticker-reverse .ticker {
		animation: scroll-right 35s linear infinite;
	}

	@keyframes scroll-left {
		0% { transform: translateX(0); }
		100% { transform: translateX(-50%); }
	}

	@keyframes scroll-right {
		0% { transform: translateX(-50%); }
		100% { transform: translateX(0); }
	}

	.prize-card {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 1rem 0.55rem 0.55rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		backdrop-filter: blur(6px);
		transition: transform 0.2s, background 0.2s;
		cursor: default;
	}

	.prize-card:hover {
		transform: translateY(-3px) scale(1.03);
		background: rgba(255, 255, 255, 0.16);
	}

	.prize-img {
		width: 48px;
		height: 48px;
		border-radius: 10px;
		object-fit: cover;
		background: rgba(255, 255, 255, 0.85);
		flex-shrink: 0;
	}

	.prize-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.prize-name {
		color: #fff;
		font-size: 0.85rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.prize-meta {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.prize-hours {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.prize-sep {
		color: rgba(255, 255, 255, 0.2);
		font-size: 0.6rem;
	}

	.prize-weekly {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
	}

	/* ── FAQ section (shipathon-style) ── */
	.faq {
		padding: 5rem 2rem 4rem;
		width: 100%;
		box-sizing: border-box;
	}

	.faq-inner {
		max-width: 760px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: 3.5rem;
		align-items: start;
	}

	.faq-left {
		position: sticky;
		top: 6rem;
		opacity: 0;
		transform: translateY(24px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.faqVisible .faq-left {
		opacity: 1;
		transform: none;
	}

	.faq-heading {
		font-size: clamp(2rem, 5vw, 2.8rem);
		font-weight: 900;
		line-height: 1.1;
		letter-spacing: -0.02em;
		margin: 0;
		color: #fff;
	}

	.faq-heading span {
		display: block;
	}

	.faq-heading .red {
		color: #fbbf24;
	}

	.faq-badges {
		display: flex;
		gap: 0.5rem;
		margin-top: 2rem;
		flex-wrap: wrap;
		opacity: 0;
		transform: translateY(16px);
		transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
	}

	.faqVisible .faq-badges {
		opacity: 1;
		transform: none;
	}

	.badge-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		transition: transform 0.2s;
	}

	.badge-wrapper:hover {
		transform: translateY(-3px);
	}

	.badge-label {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.55rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.faq-right {
		display: flex;
		flex-direction: column;
	}

	.faq-item {
		all: unset;
		display: block;
		cursor: pointer;
		width: 100%;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		opacity: 0;
		transform: translateY(12px);
		transition:
			opacity 0.4s ease calc(var(--i) * 0.07s),
			transform 0.4s ease calc(var(--i) * 0.07s);
	}

	.faq-item:last-child {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.faqVisible .faq-item {
		opacity: 1;
		transform: none;
	}

	.faq-q {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.15rem 0;
		gap: 1rem;
	}

	.faq-q-text {
		font-size: clamp(0.9rem, 2vw, 1.05rem);
		font-weight: 600;
		color: rgba(255, 255, 255, 0.75);
		text-align: left;
	}

	.faq-toggle {
		font-size: 1.25rem;
		font-weight: 300;
		color: rgba(255, 255, 255, 0.25);
		flex-shrink: 0;
		width: 24px;
		text-align: center;
		transition: color 0.2s ease;
	}

	.faq-item:hover .faq-q-text {
		color: #fff;
	}

	.faq-item:hover .faq-toggle {
		color: rgba(255, 255, 255, 0.5);
	}

	.faq-item.open .faq-toggle {
		color: #fbbf24;
	}

	.faq-a {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.3s ease;
	}

	.faq-item.open .faq-a {
		grid-template-rows: 1fr;
	}

	.faq-a p {
		overflow: hidden;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.45);
		line-height: 1.65;
		margin: 0;
		padding-bottom: 0;
		transition: padding-bottom 0.3s ease;
	}

	.faq-item.open .faq-a p {
		padding-bottom: 1.15rem;
	}

	/* ── Responsive ── */
	@media (max-width: 600px) {
		.card {
			padding: 1.75rem 1.25rem;
			border-radius: 24px;
		}

		.card-title {
			font-size: 1.2rem;
		}

		.card-header {
			margin-bottom: 1.5rem;
		}

		.badges {
			gap: 0.4rem;
		}

		.step-card {
			padding: 1rem 1.1rem;
			border-radius: 16px;
		}

		.step-emoji {
			font-size: 1.3rem;
		}

		.logo {
			width: 300px;
		}

		.rsvp-form {
			flex-direction: column;
		}

		.rsvp-form button {
			width: 100%;
		}

		.faq {
			padding: 3rem 1.25rem;
		}

		.faq-inner {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.faq-left {
			position: static;
			text-align: center;
		}

		.faq-heading {
			font-size: 2rem;
		}

		.faq-q {
			padding: 0.9rem 0;
		}

		.faq-q-text {
			font-size: 0.88rem;
		}

		.faq-a p {
			font-size: 0.82rem;
			line-height: 1.6;
		}

		.faq-item.open .faq-a p {
			padding-bottom: 0.9rem;
		}
	}
</style>
