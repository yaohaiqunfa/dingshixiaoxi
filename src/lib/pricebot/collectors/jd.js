import {stripHtml, parseCnCount, toNumber} from '../utils.js'

const JD_UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function normalizeUrl(href) {
	if (!href) return null
	if (href.startsWith('//')) return `https:${href}`
	if (href.startsWith('http://') || href.startsWith('https://')) return href
	return `https://${href}`
}

function extractBlocks(html) {
	const blocks = []
	const re = /<li[^>]*class="[^"]*\bgl-item\b[^"]*"[^>]*data-sku="(\d+)"[^>]*>([\s\S]*?)<\/li>/g
	let m
	while ((m = re.exec(html))) {
		blocks.push({sku: m[1], block: m[2]})
	}
	return blocks
}

function extractMeta({sku, block}) {
	const em = block.match(/<div[^>]*class="[^"]*\bp-name\b[^"]*"[^>]*>[\s\S]*?<em>([\s\S]*?)<\/em>/)
	const name = stripHtml(em?.[1] || '')
	const href =
		block.match(new RegExp(`href="(//item\\.jd\\.com/${sku}\\.html[^"]*)"`, 'i'))?.[1] ||
		block.match(/href="(\/\/item\.jd\.com\/\d+\.html[^"]*)"/i)?.[1]
	const url = normalizeUrl(href)
	const shop =
		stripHtml(
			block.match(/<a[^>]*class="[^"]*\bcurr-shop\b[^"]*"[^>]*>([\s\S]*?)<\/a>/)?.[1] ||
				block.match(/<a[^>]*class="[^"]*\bshopname\b[^"]*"[^>]*>([\s\S]*?)<\/a>/)?.[1] ||
				'',
		) || null
	const commitText =
		stripHtml(
			block.match(/<strong[^>]*class="[^"]*\bJ_commit\b[^"]*"[^>]*>([\s\S]*?)<\/strong>/)?.[1] ||
				block.match(/<a[^>]*class="[^"]*\bJ_comment\b[^"]*"[^>]*>([\s\S]*?)<\/a>/)?.[1] ||
				'',
		) || null
	const sales = parseCnCount(commitText)
	return {platform: 'jd', id: sku, name: name || null, url, shopName: shop, sales}
}

async function fetchPrices(skus) {
	const out = new Map()
	const batches = []
	const chunkSize = 50
	for (let i = 0; i < skus.length; i += chunkSize) batches.push(skus.slice(i, i + chunkSize))
	for (const batch of batches) {
		const url = `https://p.3.cn/prices/mgets?skuIds=${batch.map((x) => `J_${x}`).join(',')}`
		const res = await fetch(url, {
			headers: {
				'user-agent': JD_UA,
				accept: 'application/json,text/plain,*/*',
				referer: 'https://search.jd.com/'
			}
		})
		if (!res.ok) continue
		const json = await res.json()
		for (const row of Array.isArray(json) ? json : []) {
			const sku = String(row?.id || '').replace(/^J_/, '')
			const price = toNumber(row?.p)
			if (sku && price !== null) out.set(sku, price)
		}
	}
	return out
}

export async function collectJd({keyword, limit}) {
	const q = (keyword || '').trim()
	if (!q) return []
	const url = `https://search.jd.com/Search?keyword=${encodeURIComponent(q)}&enc=utf-8&page=1`
	const res = await fetch(url, {
		headers: {
			'user-agent': JD_UA,
			accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
		}
	})
	if (!res.ok) return []
	const html = await res.text()
	const blocks = extractBlocks(html).slice(0, limit || 50)
	const metas = blocks.map(extractMeta).filter((x) => x.id && x.url)
	const prices = await fetchPrices(metas.map((x) => x.id))
	const now = new Date().toISOString()
	return metas
		.map((m) => ({
			...m,
			price: prices.get(m.id) ?? null,
			shopRating: null,
			scrapedAt: now
		}))
		.filter((x) => x.price !== null)
}

