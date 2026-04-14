import fs from 'node:fs/promises'
import path from 'node:path'

export function toCsv(items) {
	const cols = [
		'keyword',
		'platform',
		'id',
		'name',
		'price',
		'sales',
		'shopRating',
		'shopName',
		'url',
		'recommended',
		'valueScore',
		'scrapedAt'
	]
	const escape = (v) => {
		if (v === null || v === undefined) return ''
		const s = String(v)
		if (/[,"\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`
		return s
	}
	return [cols.join(','), ...items.map((x) => cols.map((c) => escape(x[c])).join(','))].join('\n')
}

export async function writeOutputs({items, outJson, outCsv}) {
	if (outJson) {
		await fs.mkdir(path.dirname(outJson), {recursive: true})
		await fs.writeFile(outJson, JSON.stringify({items}, null, 2), 'utf8')
	}
	if (outCsv) {
		await fs.mkdir(path.dirname(outCsv), {recursive: true})
		await fs.writeFile(outCsv, toCsv(items), 'utf8')
	}
}

export async function writeHtmlReport({items, series, outFile, keyword}) {
	if (!outFile) return
	const dir = path.dirname(outFile)
	await fs.mkdir(dir, {recursive: true})
	const payload = {keyword, items, series}
	const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PriceBot 报告</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" />
  <style>
    :root{--bg:#0b0e14;--panel:#121826;--muted:#a2a8b8;--text:#e7ebf3;--accent:#7c5cff;--ok:#2bd576;--warn:#ffb020;--border:rgba(255,255,255,.08)}
    body{margin:0;background:radial-gradient(1200px 800px at 10% 0%,rgba(124,92,255,.25),transparent 55%),radial-gradient(900px 700px at 100% 20%,rgba(43,213,118,.18),transparent 60%),var(--bg);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
    .wrap{max-width:1180px;margin:28px auto;padding:0 18px}
    .header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:16px}
    h1{margin:0;font-size:22px;letter-spacing:.2px}
    .sub{color:var(--muted);font-size:13px}
    .grid{display:grid;grid-template-columns:1fr;gap:14px}
    @media(min-width:980px){.grid{grid-template-columns:1.2fr .8fr}}
    .card{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));border:1px solid var(--border);border-radius:16px;overflow:hidden}
    .card .hd{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
    .card .bd{padding:12px 16px}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:rgba(124,92,255,.16);border:1px solid rgba(124,92,255,.28);color:var(--text);font-size:12px}
    .table{width:100%;border-collapse:separate;border-spacing:0}
    .table th,.table td{padding:10px 10px;border-bottom:1px solid var(--border);vertical-align:top;font-size:13px}
    .table th{color:var(--muted);font-weight:600;text-align:left}
    .name{max-width:460px}
    .row-rec{background:linear-gradient(90deg,rgba(43,213,118,.14),transparent 60%)}
    a{color:inherit}
    .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid var(--border);color:var(--muted)}
    .tag.rec{border-color:rgba(43,213,118,.4);color:var(--ok);background:rgba(43,213,118,.12)}
    .price{font-variant-numeric:tabular-nums}
    .foot{margin-top:14px;color:var(--muted);font-size:12px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <h1>PriceBot 报告</h1>
        <div class="sub">关键词：${escapeHtml(keyword || '')} · 结果数：${items.length} · 生成时间：${new Date().toISOString()}</div>
      </div>
      <div class="pill">价格从低到高 · 推荐标注基于性价比评分</div>
    </div>
    <div class="grid">
      <div class="card">
        <div class="hd"><div>商品对比表</div><div class="sub">点击商品名称打开链接</div></div>
        <div class="bd" style="padding:0">
          <table class="table">
            <thead>
              <tr>
                <th>平台</th><th class="name">商品</th><th>价格</th><th>销量/评价</th><th>店铺</th><th>评分</th><th>推荐</th>
              </tr>
            </thead>
            <tbody id="rows"></tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="hd"><div>价格趋势</div><div class="sub">基于本地历史（多次运行累积）</div></div>
        <div class="bd"><div id="trend" style="height:320px"></div></div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="hd"><div>价格分布</div><div class="sub">Top 15 低价</div></div>
      <div class="bd"><div id="dist" style="height:280px"></div></div>
    </div>
    <div class="foot">提示：京东采集依赖公开搜索页与价格接口；淘宝/拼多多默认示例数据或需自行扩展采集适配器。</div>
  </div>
  <script id="payload" type="application/json">${escapeJson(JSON.stringify(payload))}</script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <script>
    const payload = JSON.parse(document.getElementById('payload').textContent)
    const rows = document.getElementById('rows')
    rows.innerHTML = payload.items.map(x => {
      const rec = x.recommended ? 'row-rec' : ''
      const tag = x.recommended ? '<span class="tag rec">推荐</span>' : '<span class="tag">—</span>'
      return \`<tr class="\${rec}">
        <td>\${escapeHtml(x.platform)}</td>
        <td class="name"><a href="\${escapeAttr(x.url)}" target="_blank" rel="noreferrer">\${escapeHtml(x.name)}</a></td>
        <td class="price">¥ \${Number(x.price).toFixed(2)}</td>
        <td>\${x.sales ?? ''}</td>
        <td>\${escapeHtml(x.shopName ?? '')}</td>
        <td>\${x.shopRating ?? ''}</td>
        <td>\${tag}</td>
      </tr>\`
    }).join('')

    const top = payload.items.slice(0, 15)
    const dist = echarts.init(document.getElementById('dist'))
    dist.setOption({
      backgroundColor: 'transparent',
      grid: {left: 54, right: 16, top: 18, bottom: 36},
      xAxis: {type:'category', axisLabel:{color:'#a2a8b8', rotate: 28}, data: top.map(x => x.platform.toUpperCase())},
      yAxis: {type:'value', axisLabel:{color:'#a2a8b8'}},
      series: [{type:'bar', data: top.map(x => x.price), itemStyle:{color:'#7c5cff', borderRadius:[6,6,0,0]}}],
      tooltip: {trigger:'axis'}
    })

    const trend = echarts.init(document.getElementById('trend'))
    const series = payload.series || []
    trend.setOption({
      backgroundColor: 'transparent',
      grid: {left: 54, right: 16, top: 18, bottom: 36},
      xAxis: {type:'category', axisLabel:{color:'#a2a8b8'}, data: series.map(x => x.day)},
      yAxis: {type:'value', axisLabel:{color:'#a2a8b8'}},
      series: [{type:'line', data: series.map(x => x.price), smooth:true, symbolSize:7, lineStyle:{width:3,color:'#2bd576'}, itemStyle:{color:'#2bd576'}}],
      tooltip: {trigger:'axis'}
    })

    addEventListener('resize', () => {
      dist.resize()
      trend.resize()
    })

    function escapeHtml(s){
      return String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
    }
    function escapeAttr(s){
      return escapeHtml(s).replaceAll("'","&#39;")
    }
  </script>
</body>
</html>`
	await fs.writeFile(outFile, html, 'utf8')
}

function escapeHtml(s) {
	return String(s ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
}

function escapeJson(s) {
	return s.replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026')
}
