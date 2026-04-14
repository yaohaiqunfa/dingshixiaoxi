#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

import {runPriceCompare} from '../src/lib/pricebot/index.js'
import {writeHtmlReport, writeOutputs} from '../src/lib/pricebot/report.js'

function parseArgs(argv) {
	const out = {_: []}
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i]
		if (!a.startsWith('-')) {
			out._.push(a)
			continue
		}
		const key = a.replaceAll(/^-+/g, '')
		const next = argv[i + 1]
		if (!next || next.startsWith('-')) {
			out[key] = true
			continue
		}
		out[key] = next
		i++
	}
	return out
}

function usage() {
	process.stdout.write(`PriceBot

用法:
  pricebot search -k "关键词" -p jd,taobao,pdd -n 30 --mode live|sample --json out.json --csv out.csv --report report.html
  pricebot batch  -f keywords.txt -p jd,taobao,pdd -n 30 --mode live|sample --json out.json --csv out.csv

示例:
  pricebot search -k "蓝牙耳机" --mode sample --report ./out/report.html
`)
}

async function main() {
	const argv = process.argv.slice(2)
	const args = parseArgs(argv)
	const cmd = args._[0]
	if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
		usage()
		process.exit(cmd ? 0 : 1)
	}
	const platforms = args.p || args.platforms || 'jd,taobao,pdd'
	const limit = Number.parseInt(args.n || args.limit || '30', 10)
	const mode = String(args.mode || 'live')
	const outJson = args.json ? path.resolve(process.cwd(), args.json) : null
	const outCsv = args.csv ? path.resolve(process.cwd(), args.csv) : null
	const report = args.report ? path.resolve(process.cwd(), args.report) : null
	const noHistory = Boolean(args['no-history'])
	if (cmd === 'search') {
		const keyword = args.k || args.keyword || ''
		if (!keyword) {
			process.stderr.write('缺少关键词: -k "关键词"\n')
			process.exit(1)
		}
		const {items, series} = await runPriceCompare({
			keyword,
			platforms,
			limit: Number.isFinite(limit) ? limit : 30,
			mode,
			writeHistory: !noHistory
		})
		await writeOutputs({items, outJson, outCsv})
		await writeHtmlReport({items, series, outFile: report, keyword})
		const recCount = items.filter((x) => x.recommended).length
		process.stdout.write(
			`关键词: ${keyword}\n平台: ${platforms}\n结果: ${items.length}\n推荐: ${recCount}\n`,
		)
		if (report) process.stdout.write(`报告: ${report}\n`)
		return
	}
	if (cmd === 'batch') {
		const file = args.f || args.file
		if (!file) {
			process.stderr.write('缺少关键词文件: -f keywords.txt\n')
			process.exit(1)
		}
		const raw = await fs.readFile(path.resolve(process.cwd(), file), 'utf8')
		const keywords = [...new Set(raw.split('\n').map((x) => x.trim()).filter(Boolean))].slice(0, 200)
		if (!keywords.length) {
			process.stderr.write('关键词文件为空\n')
			process.exit(1)
		}
		const all = []
		let series = []
		for (const keyword of keywords) {
			const r = await runPriceCompare({
				keyword,
				platforms,
				limit: Number.isFinite(limit) ? limit : 30,
				mode,
				writeHistory: !noHistory
			})
			all.push(...r.items)
			if (!series.length && r.series?.length) series = r.series
		}
		all.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
		await writeOutputs({items: all, outJson, outCsv})
		await writeHtmlReport({items: all, series, outFile: report, keyword: `batch:${keywords.length}`})
		process.stdout.write(`批量关键词: ${keywords.length}\n平台: ${platforms}\n结果: ${all.length}\n`)
		if (report) process.stdout.write(`报告: ${report}\n`)
		return
	}
	process.stderr.write(`未知命令: ${cmd}\n`)
	usage()
	process.exit(1)
}

main().catch((err) => {
	process.stderr.write(`${err?.stack || err?.message || String(err)}\n`)
	process.exit(1)
})
