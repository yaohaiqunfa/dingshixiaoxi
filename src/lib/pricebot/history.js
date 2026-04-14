import fs from 'node:fs/promises'
import path from 'node:path'

function historyPath() {
	return path.resolve(process.cwd(), '.pricebot/history.jsonl')
}

function seedPath() {
	return path.resolve(process.cwd(), 'static/pricebot/sample-history.jsonl')
}

async function ensureDir() {
	await fs.mkdir(path.dirname(historyPath()), {recursive: true})
}

async function ensureSeed() {
	try {
		await fs.stat(historyPath())
	} catch {
		try {
			const seed = await fs.readFile(seedPath(), 'utf8')
			if (seed.trim()) await fs.writeFile(historyPath(), `${seed.trim()}\n`, 'utf8')
		} catch {
			await fs.writeFile(historyPath(), '', 'utf8')
		}
	}
}

export async function appendHistory({keyword, items}) {
	await ensureDir()
	await ensureSeed()
	const ts = new Date().toISOString()
	const lines = items
		.filter((x) => x.price !== null && x.id)
		.map((x) =>
			JSON.stringify({
				ts,
				keyword,
				platform: x.platform,
				id: x.id,
				name: x.name,
				price: x.price
			}),
		)
		.join('\n')
	if (!lines) return
	await fs.appendFile(historyPath(), `${lines}\n`, 'utf8')
}

export async function readHistory({keyword, platform, id, limit = 180} = {}) {
	try {
		await ensureSeed()
		const raw = await fs.readFile(historyPath(), 'utf8')
		const lines = raw.trim().split('\n').filter(Boolean)
		const rows = []
		for (let i = Math.max(0, lines.length - 5000); i < lines.length; i++) {
			try {
				const r = JSON.parse(lines[i])
				if (keyword && r.keyword !== keyword) continue
				if (platform && r.platform !== platform) continue
				if (id && r.id !== id) continue
				if (typeof r.price !== 'number') continue
				rows.push(r)
			} catch {}
		}
		rows.sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
		return rows.slice(-limit)
	} catch {
		return []
	}
}

export function buildDailySeries(rows) {
	const map = new Map()
	for (const r of rows) {
		const day = String(r.ts).slice(0, 10)
		const key = `${day}`
		const prev = map.get(key)
		if (!prev) map.set(key, {...r, day})
		else if (r.price < prev.price) map.set(key, {...r, day})
	}
	return [...map.values()].sort((a, b) => a.day.localeCompare(b.day))
}
