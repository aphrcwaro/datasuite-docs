// Checks the English pages' links to the apps and cd2030.core (front matter: topics, indicators, reportKinds,
// cacheMembers, appPages) against their vocabularies, so the AI corpus never points at something that doesn't exist.
//   node scripts/check-ai-links.mjs                      topics, indicators, app pages (src/ai/*.json); report kinds
//                                                        and cache members skipped, with a warning
//   node scripts/check-ai-links.mjs --manifest <file>    also report kinds and cache members, from cd2030.core's manifest
//   node scripts/check-ai-links.mjs --snapshot           also report kinds and cache members, from the snapshots in
//                                                        src/ai (report-kinds.json, cache-members.json)
// The snapshots were taken from the installed cd2030.core; cd2030.core's cache_manifest() (being added) becomes the
// source: its release workflow will pass its manifest here (--manifest). Exit code 1 when anything doesn't match.
// Also checks the AI briefs (src/ai/BRIEFS.md): every linked page has one, and every item points to a section of its
// page (#anchor) or a docs page (/en/...) that exists -- against out/ai/corpus.json, so build the corpus first
// (npm run ai-corpus); without it the anchors are not checked, with a warning.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const ai = path.join(root, 'src', 'ai')
const content = path.join(root, 'src', 'content', 'en')
const args = process.argv.slice(2)
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))

// Names from any of the shapes a list may come in: strings, or objects with id / name.
const names = list => new Set((list ?? []).map(x => (typeof x === 'string' ? x : x.id ?? x.name)).filter(Boolean))

const vocab = {
  topics: names(readJson(path.join(ai, 'topics.json')).topics),
  indicators: names(readJson(path.join(ai, 'indicators.json')).indicators),
  appPages: names(readJson(path.join(ai, 'app-pages.json')).pages)
}

const manifestAt = args.indexOf('--manifest')
if (manifestAt >= 0) {
  const manifest = readJson(path.resolve(args[manifestAt + 1]))
  vocab.reportKinds = names(manifest.reportKinds ?? manifest.report_kinds ?? manifest.kinds)
  vocab.cacheMembers = names(manifest.cacheMembers ?? manifest.cache_members ?? manifest.members)
} else if (args.includes('--snapshot')) {
  vocab.reportKinds = names(readJson(path.join(ai, 'report-kinds.json')).kinds)
  vocab.cacheMembers = names(readJson(path.join(ai, 'cache-members.json')).members)
} else {
  console.warn('warning: no --manifest or --snapshot: reportKinds and cacheMembers are not checked')
}

// Section anchors and page slugs, from the built corpus (English).
const corpusFile = path.join(root, 'out', 'ai', 'corpus.json')
const corpus = fs.existsSync(corpusFile) ? readJson(corpusFile) : undefined
if (!corpus) console.warn('warning: out/ai/corpus.json not built: AI brief anchors and links are not checked')
const englishPages = (corpus?.pages ?? []).filter(p => p.lang === 'en')
const anchorsBySlug = new Map(englishPages.map(p => [p.slug, new Set(p.sections.map(s => s.anchor))]))
const slugs = new Set(englishPages.map(p => p.slug.replace(/(^|\/)index$/, '')))

const BRIEF_LISTS = ['definitions', 'options', 'steps', 'rules', 'interpretation', 'notCovered']
const briefCount = { draft: 0, reviewed: 0 }
function checkBrief(rel, slug, ai) {
  const out = []
  if (ai.status !== 'draft' && ai.status !== 'reviewed') out.push(`${rel}: ai.status must be draft or reviewed`)
  else briefCount[ai.status]++
  if (typeof ai.summary !== 'string' || !ai.summary.trim()) out.push(`${rel}: ai.summary is missing`)
  let words = String(ai.summary ?? '').split(/\s+/).length
  for (const key of BRIEF_LISTS) {
    if (ai[key] === undefined) continue
    if (!Array.isArray(ai[key])) { out.push(`${rel}: ai.${key} must be a list`); continue }
    for (const item of ai[key]) {
      const text = String(item)
      words += text.split(/\s+/).length
      const anchors = [...text.matchAll(/\(#([^)\s]*)\)/g)].map(m => m[1])
      const pages = [...text.matchAll(/\(\/en\/([^)#\s]*?)\/?(?:#[^)\s]*)?\)/g)].map(m => m[1])
      if (!anchors.length && !pages.length) out.push(`${rel}: ai.${key}: no (#anchor) or (/en/...) source: "${text.slice(0, 60)}"`)
      if (!corpus) continue
      // (#) is the page's introduction, the text before its first heading
      for (const a of anchors) if (!anchorsBySlug.get(slug)?.has(a)) out.push(`${rel}: ai.${key}: #${a} is not a section of this page`)
      for (const pg of pages) if (!slugs.has(pg)) out.push(`${rel}: ai.${key}: /en/${pg}/ is not a docs page`)
    }
  }
  if (words > 450) out.push(`${rel}: ai brief is ${words} words (keep it under ~400)`)
  return out
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : /\.mdx?$/.test(entry.name) ? [full] : []
  })
}

const problems = []
let linked = 0
for (const file of walk(content)) {
  const rel = path.relative(root, file).split(path.sep).join('/')
  const { data } = matter(fs.readFileSync(file, 'utf8'))
  let any = false
  for (const key of ['topics', 'indicators', 'reportKinds', 'cacheMembers', 'appPages']) {
    if (data[key] === undefined) continue
    any = true
    if (!Array.isArray(data[key])) {
      problems.push(`${rel}: ${key} must be a list`)
      continue
    }
    if (!vocab[key]) continue
    for (const value of data[key]) {
      if (!vocab[key].has(String(value))) problems.push(`${rel}: ${key}: "${value}" is not known`)
    }
  }
  if (any) linked++
  const slug = path.relative(content, file).split(path.sep).join('/').replace(/\.mdx?$/, '')
  if (data.ai !== undefined) problems.push(...checkBrief(rel, slug, data.ai))
  else if (any && !/(^|\/)_/.test(slug)) problems.push(`${rel}: a linked page with no AI brief (ai:, see src/ai/BRIEFS.md)`)
}

if (problems.length) {
  console.error(problems.join('\n'))
  console.error(`\n${problems.length} link(s) to fix (vocabularies: src/ai/*.json${manifestAt >= 0 ? ', the manifest' : ''}).`)
  process.exit(1)
}
console.log(`AI links OK: ${linked} pages checked against ${Object.keys(vocab).join(', ')}; AI briefs: ${briefCount.reviewed} reviewed, ${briefCount.draft} draft.`)
