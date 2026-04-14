import fs from 'node:fs/promises'
import path from 'node:path'

function samplePath() {
	return path.resolve(process.cwd(), 'static/pricebot/sample-data.json')
}

export async function collectSample({keyword, limit}) {
	const raw = await fs.readFile(samplePath(), 'utf8')
	const data = JSON.parse(raw)
	const q = (keyword || '').trim()
	let items = data.items || []
	if (q) {
		const lower = q.toLowerCase()
		items = items.filter((x) => String(x.name || '').toLowerCase().includes(lower))
	}
	return items.slice(0, limit || 50).map((x) => ({
		...x,
		scrapedAt: new Date().toISOString()
	}))
}

