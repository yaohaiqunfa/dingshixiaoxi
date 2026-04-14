<script>
import {onMount} from 'svelte'

let keyword = $state('蓝牙耳机')
let mode = $state('sample')
let platforms = $state({jd: true, taobao: true, pdd: true})
let limit = $state(30)

let loading = $state(false)
let error = $state('')
let items = $state([])
let series = $state([])

const selectedPlatforms = $derived.by(() =>
	Object.entries(platforms)
		.filter(([, v]) => v)
		.map(([k]) => k)
		.join(','),
)

const recommended = $derived.by(() => items.filter((x) => x.recommended))

const cheapest = $derived.by(() => items.slice(0, 12))

async function runSearch() {
	error = ''
	loading = true
	try {
		const url = new URL('/api/pricebot/search', location.origin)
		url.searchParams.set('keyword', keyword.trim())
		url.searchParams.set('platforms', selectedPlatforms)
		url.searchParams.set('limit', String(limit))
		url.searchParams.set('mode', mode)
		const res = await fetch(url)
		const data = await res.json()
		if (!res.ok) throw new Error(data?.error || 'request_failed')
		items = data.items || []
		series = data.series || []
	} catch (e) {
		error = e?.message || String(e)
	} finally {
		loading = false
	}
}

function fmtPrice(v) {
	const n = Number(v)
	return Number.isFinite(n) ? n.toFixed(2) : ''
}

function fmtScore(v) {
	const n = Number(v)
	return Number.isFinite(n) ? n.toFixed(3) : ''
}

function linePath(points) {
	return points.length ? `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}` : ''
}

function buildTrendPoints() {
	const w = 680
	const h = 220
	const pad = 18
	const xs = series.map((x, i) => i)
	const ys = series.map((x) => x.price)
	const minX = Math.min(...xs, 0)
	const maxX = Math.max(...xs, 1)
	const minY = Math.min(...ys, 0)
	const maxY = Math.max(...ys, 1)
	const scaleX = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (w - pad * 2)
	const scaleY = (y) => h - pad - ((y - minY) / (maxY - minY || 1)) * (h - pad * 2)
	const points = series.map((x, i) => ({...x, x: scaleX(i), y: scaleY(x.price)}))
	return {w, h, pad, minY, maxY, points}
}

function buildDistPoints() {
	const top = cheapest
	const w = 680
	const h = 220
	const pad = 18
	const values = top.map((x) => x.price)
	const max = Math.max(...values, 0.01)
	const barW = (w - pad * 2) / Math.max(1, top.length)
	const bars = top.map((x, i) => {
		const bh = ((x.price || 0) / max) * (h - pad * 2)
		return {
			...x,
			x: pad + i * barW + 2,
			y: h - pad - bh,
			w: Math.max(4, barW - 4),
			h: bh
		}
	})
	return {w, h, pad, max, bars}
}

onMount(runSearch)
</script>

<div class="mx-auto w-full max-w-6xl px-4">
	<div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
		<div>
			<div class="text-xl font-semibold tracking-wide text-primary">PriceBot</div>
			<div class="text-sm opacity-70">电商价格自动化采集与对比（演示版）</div>
		</div>
		<div class="flex flex-wrap items-end gap-2">
			<label class="form-control">
				<div class="label pb-1">
					<span class="label-text text-xs opacity-70">关键词</span>
				</div>
				<input
					class="input input-sm input-bordered input-primary w-72"
					placeholder="输入关键词，如：蓝牙耳机"
					bind:value={keyword}
					onkeydown={(e) => e.key === 'Enter' && runSearch()}
				/>
			</label>
			<label class="form-control">
				<div class="label pb-1">
					<span class="label-text text-xs opacity-70">模式</span>
				</div>
				<select class="select select-sm select-bordered select-primary w-36" bind:value={mode}>
					<option value="sample">示例</option>
					<option value="live">现场</option>
				</select>
			</label>
			<label class="form-control">
				<div class="label pb-1">
					<span class="label-text text-xs opacity-70">数量</span>
				</div>
				<input class="input input-sm input-bordered w-24" type="number" min="5" max="80" bind:value={limit} />
			</label>
			<button class="btn btn-sm btn-primary" onclick={runSearch} disabled={loading || !keyword.trim()}>
				{loading ? '采集中…' : '开始采集'}
			</button>
		</div>
	</div>

	<div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
		<div class="card bg-base-100 border border-base-300">
			<div class="card-body gap-3 p-4">
				<div class="flex items-center justify-between">
					<div class="text-sm opacity-70">平台选择</div>
					<div class="badge badge-outline">{selectedPlatforms || '—'}</div>
				</div>
				<div class="flex flex-wrap gap-2">
					<label class="btn btn-sm btn-ghost border border-base-300">
						<input class="checkbox checkbox-xs checkbox-primary mr-2" type="checkbox" bind:checked={platforms.jd} />
						京东
					</label>
					<label class="btn btn-sm btn-ghost border border-base-300">
						<input
							class="checkbox checkbox-xs checkbox-primary mr-2"
							type="checkbox"
							bind:checked={platforms.taobao}
						/>
						淘宝
					</label>
					<label class="btn btn-sm btn-ghost border border-base-300">
						<input class="checkbox checkbox-xs checkbox-primary mr-2" type="checkbox" bind:checked={platforms.pdd} />
						拼多多
					</label>
				</div>
				<div class="text-xs opacity-60">
					现场模式下，京东尝试公开搜索页+价格接口；淘宝/拼多多默认示例数据，可按适配器扩展。
				</div>
			</div>
		</div>
		<div class="card bg-base-100 border border-base-300">
			<div class="card-body p-4">
				<div class="text-sm opacity-70">结果概览</div>
				<div class="mt-1 flex flex-wrap gap-2">
					<div class="badge badge-primary badge-lg">商品 {items.length}</div>
					<div class="badge badge-success badge-lg">推荐 {recommended.length}</div>
					<div class="badge badge-outline badge-lg">最低 ¥ {items[0] ? fmtPrice(items[0].price) : '—'}</div>
				</div>
				{#if error}
					<div class="alert alert-error mt-3 py-2 text-sm">
						<span>{error}</span>
					</div>
				{/if}
			</div>
		</div>
		<div class="card bg-base-100 border border-base-300">
			<div class="card-body p-4">
				<div class="text-sm opacity-70">性价比推荐</div>
				<div class="mt-2 flex flex-col gap-2">
					{#each recommended.slice(0, 3) as r (r.platform + r.id)}
						<a
							class="group flex items-start justify-between gap-3 rounded-xl border border-base-300 p-3 hover:border-primary hover:bg-base-200"
							href={r.url}
							target="_blank"
							rel="noreferrer"
						>
							<div class="min-w-0">
								<div class="truncate text-sm font-medium group-hover:text-primary">{r.name}</div>
								<div class="mt-1 flex flex-wrap items-center gap-2 text-xs opacity-70">
									<span class="badge badge-outline">{r.platform}</span>
									<span>销量/评价 {r.sales ?? '—'}</span>
									<span>评分 {r.shopRating ?? '—'}</span>
								</div>
							</div>
							<div class="shrink-0 text-right">
								<div class="text-sm font-semibold text-primary">¥ {fmtPrice(r.price)}</div>
								<div class="text-[11px] opacity-60">score {fmtScore(r.valueScore)}</div>
							</div>
						</a>
					{/each}
					{#if recommended.length === 0}
						<div class="text-xs opacity-60">暂无推荐（请先运行采集）</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
		<div class="card bg-base-100 border border-base-300">
			<div class="card-body p-4">
				<div class="flex items-end justify-between">
					<div>
						<div class="text-sm font-medium">价格趋势</div>
						<div class="text-xs opacity-60">基于本地历史（多次运行累积）</div>
					</div>
					<div class="text-xs opacity-60">{series.length ? `${series[0]?.day} → ${series.at(-1)?.day}` : '—'}</div>
				</div>
				{#if series.length}
					{@const t = buildTrendPoints()}
					<svg class="mt-3 w-full" viewBox={`0 0 ${t.w} ${t.h}`} role="img" aria-label="trend">
						<defs>
							<linearGradient id="gLine" x1="0" x2="1">
								<stop offset="0" stop-color="oklch(var(--p))" stop-opacity="0.2" />
								<stop offset="1" stop-color="oklch(var(--s))" stop-opacity="0.3" />
							</linearGradient>
						</defs>
						<path d={linePath(t.points)} fill="none" stroke="url(#gLine)" stroke-width="5" stroke-linecap="round" />
						<path d={linePath(t.points)} fill="none" stroke="oklch(var(--p))" stroke-width="2.5" stroke-linecap="round" />
						{#each t.points as p (p.day)}
							<circle cx={p.x} cy={p.y} r="4" fill="oklch(var(--s))" />
						{/each}
					</svg>
				{:else}
					<div class="mt-3 rounded-xl border border-dashed border-base-300 p-6 text-xs opacity-60">
						暂无趋势数据。运行采集后会写入本地历史，再次运行即可形成折线。
					</div>
				{/if}
			</div>
		</div>
		<div class="card bg-base-100 border border-base-300">
			<div class="card-body p-4">
				<div class="flex items-end justify-between">
					<div>
						<div class="text-sm font-medium">低价分布</div>
						<div class="text-xs opacity-60">Top 12（价格从低到高）</div>
					</div>
					<div class="text-xs opacity-60">{cheapest.length ? `¥ ${fmtPrice(cheapest[0].price)} 起` : '—'}</div>
				</div>
				{#if cheapest.length}
					{@const d = buildDistPoints()}
					<svg class="mt-3 w-full" viewBox={`0 0 ${d.w} ${d.h}`} role="img" aria-label="dist">
						{#each d.bars as b (b.platform + b.id)}
							<rect
								x={b.x}
								y={b.y}
								width={b.w}
								height={b.h}
								rx="9"
								fill={b.recommended ? 'oklch(var(--s))' : 'oklch(var(--p))'}
								opacity={b.recommended ? 0.9 : 0.35}
							/>
						{/each}
					</svg>
				{:else}
					<div class="mt-3 rounded-xl border border-dashed border-base-300 p-6 text-xs opacity-60">暂无数据</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="card mt-3 bg-base-100 border border-base-300">
		<div class="card-body p-0">
			<div class="flex flex-wrap items-end justify-between gap-2 p-4">
				<div>
					<div class="text-sm font-medium">商品横向对比</div>
					<div class="text-xs opacity-60">已清洗去重并按价格升序排序</div>
				</div>
				<div class="text-xs opacity-60">点击商品打开链接</div>
			</div>
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th>推荐</th>
							<th>平台</th>
							<th>商品</th>
							<th class="text-right">价格</th>
							<th class="text-right">销量/评价</th>
							<th>店铺</th>
							<th class="text-right">评分</th>
							<th class="text-right">Score</th>
						</tr>
					</thead>
					<tbody>
						{#each items as x (x.platform + x.id)}
							<tr class={x.recommended ? 'bg-success/10' : ''}>
								<td>{#if x.recommended}<span class="badge badge-success badge-sm">推荐</span>{/if}</td>
								<td><span class="badge badge-outline badge-sm">{x.platform}</span></td>
								<td class="max-w-[560px]">
									<a class="link link-hover" href={x.url} target="_blank" rel="noreferrer">{x.name}</a>
								</td>
								<td class="text-right font-semibold text-primary">¥ {fmtPrice(x.price)}</td>
								<td class="text-right">{x.sales ?? '—'}</td>
								<td>{x.shopName ?? '—'}</td>
								<td class="text-right">{x.shopRating ?? '—'}</td>
								<td class="text-right">{fmtScore(x.valueScore)}</td>
							</tr>
						{/each}
						{#if items.length === 0}
							<tr>
								<td colspan="8" class="py-8 text-center text-xs opacity-60">暂无数据</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

