<script lang="ts">
	type BadgeState = 'gold' | 'green' | 'red' | 'gray';

	let { state = 'gray', size = 56, label = '' }: { state?: BadgeState; size?: number; label?: string } = $props();

	const fills: Record<BadgeState, { bg1: string; bg2: string; ring: string; glow: string }> = {
		gold: { bg1: '#fde047', bg2: '#f59e0b', ring: '#fbbf24', glow: 'rgba(245,158,11,0.5)' },
		green: { bg1: '#34d399', bg2: '#10b981', ring: '#6ee7b7', glow: 'rgba(16,185,129,0.5)' },
		red: { bg1: '#fb7185', bg2: '#ef4444', ring: '#fca5a5', glow: 'rgba(239,68,68,0.5)' },
		gray: { bg1: '#6b7280', bg2: '#4b5563', ring: '#9ca3af', glow: 'transparent' }
	};

	const f = $derived(fills[state]);
	const isGray = $derived(state === 'gray');
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 80 80"
	xmlns="http://www.w3.org/2000/svg"
	role="img"
	aria-label={label || `${state} badge`}
>
	<title>{label || `${state} badge`}</title>
	<defs>
		<linearGradient id="bg-{state}-{size}" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color={f.bg1} />
			<stop offset="100%" stop-color={f.bg2} />
		</linearGradient>
		{#if !isGray}
			<filter id="glow-{state}-{size}">
				<feDropShadow dx="0" dy="2" stdDeviation="4" flood-color={f.glow} flood-opacity="0.6" />
			</filter>
		{/if}
	</defs>

	<!-- Outer ring -->
	<circle
		cx="40"
		cy="40"
		r="37"
		fill="none"
		stroke={isGray ? 'rgba(255,255,255,0.15)' : f.ring}
		stroke-width={isGray ? 2 : 2.5}
		stroke-dasharray={isGray ? '5 4' : 'none'}
		opacity={isGray ? 0.6 : 0.5}
	/>

	<!-- Main circle -->
	<circle
		cx="40"
		cy="40"
		r="32"
		fill="url(#bg-{state}-{size})"
		filter={isGray ? 'none' : `url(#glow-${state}-${size})`}
		opacity={isGray ? 0.35 : 1}
	/>

	<!-- Ship icon -->
	<image
		x="14"
		y="14"
		width="52"
		height="52"
		href="/ship.png"
		opacity={isGray ? 0.4 : 1}
	/>

	<!-- Checkmark for completed -->
	{#if state === 'gold' || state === 'green'}
		<circle cx="62" cy="62" r="10" fill="white" />
		<circle cx="62" cy="62" r="8" fill={f.bg2} />
		<path
			d="M57.5 62 60.5 65 66.5 59"
			fill="none"
			stroke="white"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{/if}

	<!-- X mark for failed -->
	{#if state === 'red'}
		<circle cx="62" cy="62" r="10" fill="white" />
		<circle cx="62" cy="62" r="8" fill={f.bg2} />
		<path
			d="M59 59 65 65M65 59 59 65"
			fill="none"
			stroke="white"
			stroke-width="2"
			stroke-linecap="round"
		/>
	{/if}
</svg>
