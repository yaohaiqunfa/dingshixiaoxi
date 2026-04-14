import crypto from 'node:crypto'

export function stripHtml(input) {
	if (!input) return ''
	return input.replaceAll(/<[^>]*>/g, '').replaceAll(/\s+/g, ' ').trim()
}

export function toNumber(input) {
	if (input === null || input === undefined) return null
	if (typeof input === 'number' && Number.isFinite(input)) return input
	const normalized = String(input).replaceAll(/[,￥¥\s]/g, '').trim()
	if (!normalized) return null
	const n = Number.parseFloat(normalized)
	return Number.isFinite(n) ? n : null
}

export function parseCnCount(input) {
	if (input === null || input === undefined) return null
	if (typeof input === 'number' && Number.isFinite(input)) return Math.max(0, Math.trunc(input))
	const s = String(input).replaceAll(/\s+/g, '').trim()
	if (!s) return null
	const match = s.match(/^(\d+(?:\.\d+)?)(万|千)?\+?$/)
	if (match) {
		const base = Number.parseFloat(match[1])
		const unit = match[2]
		const mul = unit === '万' ? 10_000 : unit === '千' ? 1000 : 1
		return Number.isFinite(base) ? Math.max(0, Math.trunc(base * mul)) : null
	}
	const n = Number.parseInt(s.replaceAll(/[^\d]/g, ''), 10)
	return Number.isFinite(n) ? Math.max(0, n) : null
}

export function stableId(parts) {
	const h = crypto.createHash('sha256')
	h.update(parts.filter(Boolean).join('|'))
	return h.digest('hex').slice(0, 16)
}

