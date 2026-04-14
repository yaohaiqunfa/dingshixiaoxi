import {parseCnCount, stableId, toNumber} from './utils.js'

function normalizeItem(x) {
	const price = toNumber(x.price)
	const sales = parseCnCount(x.sales)
	const shopRating = toNumber(x.shopRating)
	const name = x.name ? String(x.name).replaceAll(/\s+/g, ' ').trim() : null
	const shopName = x.shopName ? String(x.shopName).replaceAll(/\s+/g, ' ').trim() : null
	const url = x.url ? String(x.url).trim() : null
	const id = x.id ? String(x.id).trim() : null
	return {
		platform: String(x.platform || '').trim() || 'unknown',
		id: id || (url ? stableId([url]) : stableId([name || '', shopName || '', String(price ?? '')])),
		name,
		price,
		sales,
		shopRating,
		shopName,
		url,
		scrapedAt: x.scrapedAt || new Date().toISOString()
	}
}

function dedupe(items) {
	const seen = new Map()
	for (const item of items) {
		const key = `${item.platform}:${item.id}`
		if (!seen.has(key)) seen.set(key, item)
		else {
			const prev = seen.get(key)
			if ((prev.price ?? Infinity) > (item.price ?? Infinity)) seen.set(key, item)
		}
	}
	return [...seen.values()]
}

function minMax(values) {
	const valid = values.filter((v) => v !== null && v !== undefined && Number.isFinite(v))
	if (!valid.length) return {min: 0, max: 0}
	return {min: Math.min(...valid), max: Math.max(...valid)}
}

function normalize01(v, {min, max}, fallback = 0) {
	if (v === null || v === undefined || !Number.isFinite(v)) return fallback
	if (max === min) return 0.5
	return (v - min) / (max - min)
}

export function cleanAndRank(rawItems, {recommendTop = 5} = {}) {
	const normalized = rawItems.map(normalizeItem).filter((x) => x.price !== null && x.url && x.name)
	const unique = dedupe(normalized)
	const priceRange = minMax(unique.map((x) => x.price))
	const salesRange = minMax(unique.map((x) => x.sales ?? 0))
	const ratingRange = minMax(unique.map((x) => x.shopRating ?? 0))
	const scored = unique.map((x) => {
		const p = normalize01(x.price, priceRange, 0.5)
		const s = normalize01(x.sales ?? 0, salesRange, 0)
		const r = normalize01(x.shopRating ?? 0, ratingRange, 0.5)
		const valueScore = 0.55 * (1 - p) + 0.25 * s + 0.2 * r
		return {...x, valueScore}
	})
	scored.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
	const byScore = [...scored].sort((a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0))
	const recommendedIds = new Set(byScore.slice(0, recommendTop).map((x) => `${x.platform}:${x.id}`))
	return scored.map((x) => ({
		...x,
		recommended: recommendedIds.has(`${x.platform}:${x.id}`)
	}))
}

