<script lang="ts">
	import catalog from '$lib/catalog.json';
</script>

<svelte:head>
	<title>Catalog · Paths</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<main>
	<a href="/" class="back">← back</a>
	<h1>catalog</h1>
	<p class="sub">items the ai could pick for your path</p>

	<div class="items">
		{#each catalog as item}
			<div class="item">
				<img src={item.img} alt={item.name} />
				<div class="details">
					<span class="name">{item.name}</span>
					<span class="price">${item.price}</span>
				</div>
				<a href={item.url} target="_blank" rel="noopener noreferrer" class="shop">↗</a>
			</div>
		{/each}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Quicksand', sans-serif;
		background: #0d1117;
		min-height: 100vh;
		color: #fff;
	}

	main {
		max-width: 520px;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
	}

	.back {
		color: rgba(255, 255, 255, 0.4);
		text-decoration: none;
		font-weight: 700;
		font-size: 0.85rem;
		transition: color 0.2s;
	}

	.back:hover {
		color: #fff;
	}

	h1 {
		font-size: 2rem;
		font-weight: 900;
		margin: 1.5rem 0 0.25rem;
		letter-spacing: -0.02em;
	}

	.sub {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0 0 2rem;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.65rem 0.85rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
		transition: background 0.2s;
	}

	.item:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.item img {
		width: 44px;
		height: 44px;
		object-fit: contain;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.9);
		padding: 4px;
		flex-shrink: 0;
	}

	.details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.name {
		font-size: 0.9rem;
		font-weight: 700;
		color: #fff;
	}

	.price {
		font-size: 0.78rem;
		font-weight: 600;
		color: #fbbf24;
	}

	.shop {
		color: rgba(255, 255, 255, 0.3);
		font-size: 1rem;
		font-weight: 700;
		text-decoration: none;
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.shop:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.1);
	}
</style>
