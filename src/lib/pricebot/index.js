import {cleanAndRank} from './clean.js'
import {appendHistory, buildDailySeries, readHistory} from './history.js'
import {collectJd} from './collectors/jd.js'
import {collectPdd} from './collectors/pdd.js'
import {collectSample} from './collectors/sample.js'
import {collectTaobao} from './collectors/taobao.js'

const PLATFORM_COLLECTORS = {
	jd: collectJd,
	taobao: collectTaobao,
	pdd: collectPdd,
	sample: collectSample
}

export function parsePlatforms(input) {
	if (!input) return ['jd', 'taobao', 'pdd']
	if (Array.isArray(input)) return input.map((x) => String(x).trim()).filter(Boolean)
	return String(input)
		.split(',')
		.map((x) => x.trim())
		.filter(Boolean)
}

async function collectForPlatform({platform, keyword, limit, mode, fallbackSample}) {
	if (mode === 'sample') {
		const items = await collectSample({keyword, limit})
		return items.filter((x) => x.platform === platform).slice(0, limit)
	}
	const collector = PLATFORM_COLLECTORS[platform]
	const items = collector ? await collector({keyword, limit}) : []
	if (items.length) return items
	if (!fallbackSample) return []
	const sample = await collectSample({keyword, limit})
	return sample.filter((x) => x.platform === platform).slice(0, limit)
}

export async function runPriceCompare({
	keyword,
	platforms = ['jd', 'taobao', 'pdd'],
	limit = 30,
	mode = 'live',
	fallbackSample = true,
	writeHistory = true,
	recommendTop = 5
}) {
	const ps = parsePlatforms(platforms)
	const results = await Promise.all(
		ps.map(async (platform) => ({
			platform,
			items: await collectForPlatform({platform, keyword, limit, mode, fallbackSample})
		})),
	)
	const rawItems = results.flatMap((x) => x.items)
	const items = cleanAndRank(rawItems, {recommendTop})
	if (writeHistory) await appendHistory({keyword, items})
	const best = items.find((x) => x.recommended) || items[0]
	let series = []
	if (best) {
		const rows = await readHistory({keyword, platform: best.platform, id: best.id})
		series = buildDailySeries(rows).map((x) => ({day: x.day, price: x.price}))
	}
	return {keyword, items: items.map((x) => ({...x, keyword})), series}
}
