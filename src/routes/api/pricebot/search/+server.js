import {json} from '@sveltejs/kit'
import {runPriceCompare} from '$lib/pricebot/index.js'

export async function GET({url}) {
	const keyword = (url.searchParams.get('keyword') || '').trim()
	const platforms = url.searchParams.get('platforms') || 'jd,taobao,pdd'
	const limit = Number.parseInt(url.searchParams.get('limit') || '30', 10)
	const mode = url.searchParams.get('mode') || 'sample'
	if (!keyword) return json({error: 'missing_keyword'}, {status: 400})
	const data = await runPriceCompare({
		keyword,
		platforms,
		limit: Number.isFinite(limit) ? limit : 30,
		mode
	})
	return json(data)
}

