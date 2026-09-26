// Every internal docs link in the content -- /<lang>/...#anchor and same-page (#anchor), in Markdown links and
// href attributes -- must lead to a page and, when it names one, to a heading of that page. Checked against the
// built AI corpus, which holds every page's heading anchors as Nextra renders them (custom [#id]s included).
//
//   node scripts/check-anchors.mjs [corpus dir, default out]      (build the corpus first: npm run ai-corpus)
//
// Front matter (the AI briefs' (#anchor) items) is checked by check-ai-links.mjs.

import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const corpusFile = path.join(root, process.argv[2] ?? 'out', 'ai', 'corpus.json')
if (!fs.existsSync(corpusFile)) {
  console.error(`${path.relative(root, corpusFile)} not found: build the corpus first (npm run ai-corpus)`)
  process.exit(2)
}
const corpus = JSON.parse(fs.readFileSync(corpusFile, 'utf8'))

const norm = p => decodeURIComponent(p).replace(/^\/+|\/+$/g, '').replace(/\/index$/, '')
const pages = new Map()
for (const page of corpus.pages) pages.set(norm(new URL(page.url).pathname), new Set(page.sections.map(s => s.anchor)))

const link = /(?:\]\(|href=["'])(\/(?:en|fr|pt)\/[^)"'\s#]*)?(?:#([^)"'\s]*))?[)"']/g
const broken = []
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) { walk(full); continue }
    if (!/\.mdx?$/.test(entry.name)) continue
    const rel = path.relative(path.join(root, 'src', 'content'), full).split(path.sep).join('/')
    const own = norm(rel.replace(/\.mdx?$/, ''))
    let text = fs.readFileSync(full, 'utf8')
    if (text.startsWith('---')) text = text.slice(text.indexOf('\n---', 3) + 4)
    for (const m of text.matchAll(link)) {
      const [, target, anchor] = m
      if (target === undefined && anchor === undefined) continue
      if (target && /^\/(?:en|fr|pt)\/(?:images|files)\//.test(target)) continue
      const page = target ? norm(target) : own
      if (!pages.has(page)) {
        if (target && !/\.\w+$/.test(target)) broken.push(`${rel}: no page ${target}`)
        continue
      }
      if (anchor && !pages.get(page).has(decodeURIComponent(anchor))) broken.push(`${rel}: ${target ?? ''}#${anchor} is not a heading of ${page}`)
    }
  }
}
walk(path.join(root, 'src', 'content'))

for (const b of broken) console.log(b)
console.log(broken.length ? `Links: ${broken.length} broken.` : 'Links OK: every internal link leads to a page and heading.')
process.exit(broken.length ? 1 : 0)
