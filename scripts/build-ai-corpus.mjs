// Builds the AI corpus of the site: every page, split into sections at its headings, as plain text, with the page's
// links to the apps and cd2030.core (front matter: topics, indicators, reportKinds, cacheMembers, appPages). The DataSuite
// chat reads it to answer from, and cite, the methodology. Written after the site is exported (postbuild):
//   out/ai/corpus.json   the corpus (contract: countdown-analytics docs/AI-PLAN.md, "The docs corpus")
//   out/llms.txt         the pages, one line each (https://llmstxt.org)
//   out/llms-full.txt    the English pages in full
// Anchors follow Nextra's heading ids (remark-headings: github-slugger over the heading's text or its [#custom-id]),
// so a section's url opens the page at that heading.
//   node scripts/build-ai-corpus.mjs [contentDir=src/content] [outDir=out]
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

const SITE = 'https://datasuite.damurka.com'
const LANGS = ['en', 'fr', 'pt']
const LINK_KEYS = ['topics', 'indicators', 'reportKinds', 'cacheMembers', 'appPages']

const contentDir = path.resolve(process.argv[2] ?? 'src/content')
const outDir = path.resolve(process.argv[3] ?? 'out')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return /\.mdx?$/.test(entry.name) ? [full] : []
  })
}

// The page's address: /<lang>/<path>/ ("index" is its folder), as the static export writes it (trailingSlash).
function pageUrl(lang, rel) {
  const route = rel.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '')
  return `${SITE}/${lang}/${route ? route + '/' : ''}`
}

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).use(remarkMath)

// A heading's text as Nextra flattens it (remark-headings): the values of its leaves -- link text, inline code, math.
function flatten(node) {
  if (node.type === 'image') return ''
  if ('children' in node) return node.children.map(flatten).join('')
  return 'value' in node ? node.value : ''
}

// A block's readable text: JSX keeps its children and drops its attributes; ESM and {expressions} are dropped.
function text(node) {
  switch (node.type) {
    case 'mdxjsEsm': case 'mdxFlowExpression': case 'mdxTextExpression': case 'thematicBreak': return ''
    case 'html': return node.value.replace(/<[^>]*>/g, '')
    case 'code': return node.value
    case 'math': return '$$' + node.value + '$$'
    case 'inlineMath': return '$' + node.value + '$'
    case 'inlineCode': case 'text': return node.value
    case 'break': return '\n'
    case 'image': return node.alt ?? ''
    case 'table': return node.children.map(row => row.children.map(cell => text(cell).trim()).join(' | ')).join('\n')
    case 'list': return node.children.map(item => '- ' + text(item).trim().replace(/\n/g, '\n  ')).join('\n')
    case 'mdxJsxFlowElement':
      // <Tabs items={['RMNCAH', 'Vaxx']}>: each tab's text is labelled with its item, so the app it applies to survives
      if (node.name === 'Tabs') {
        const items = node.attributes?.find(a => a.name === 'items')?.value
        const labels = [...String(items?.value ?? items ?? '').matchAll(/(['"])(.*?)\1/g)].map(m => m[2])
        return node.children.filter(c => c.type === 'mdxJsxFlowElement')
          .map((tab, i) => ({ label: labels[i], body: text({ ...tab, name: 'Tabs.Tab' }).trim() }))
          .filter(t => t.body).map(t => (t.label ? `[${t.label}] ` : '') + t.body).join('\n\n')
      }
      return node.children.map(text).map(t => t.trim()).filter(Boolean).join('\n\n')
    case 'paragraph': case 'emphasis': case 'strong': case 'delete': case 'link': case 'linkReference': case 'mdxJsxTextElement':
      return (node.children ?? []).map(text).join('')
    default:
      return 'children' in node ? node.children.map(text).map(t => t.trim()).filter(Boolean).join('\n\n') : ''
  }
}

// Sections at every heading (##..######); the text before the first one belongs to the page itself (anchor "").
// Headings inside JSX (e.g. in a <Steps>) start sections too, in document order, as Nextra gives them ids.
function sections(body, title) {
  const slugger = new GithubSlugger()
  const out = [{ anchor: '', heading: title, parts: [] }]
  const visit = nodes => {
    for (const node of nodes) {
      if (node.type === 'heading') {
        if (node.depth === 1) continue
        const last = node.children.at(-1)
        const custom = last?.type === 'text' ? last.value.match(/\s*\[#([^]+?)]\s*$/) : null
        if (custom) last.value = last.value.slice(0, custom.index)
        const heading = flatten(node).trim()
        out.push({ anchor: slugger.slug(custom ? custom[1] : heading), heading, parts: [] })
      } else if ((node.type === 'mdxJsxFlowElement') && node.children?.some(c => c.type === 'heading')) {
        visit(node.children)
      } else {
        const t = text(node).trim()
        if (t) out.at(-1).parts.push(t)
      }
    }
  }
  visit(parser.parse(body).children)
  return out
    .map(s => ({ anchor: s.anchor, heading: s.heading, text: s.parts.join('\n\n').replace(/\n{3,}/g, '\n\n') }))
    .filter(s => s.text || s.anchor)
}

function links(data) {
  return Object.fromEntries(LINK_KEYS.map(k => [k, Array.isArray(data[k]) ? data[k].map(String) : []]))
}

// The page's AI brief (src/ai/BRIEFS.md), when it has one: status, summary, and the lists of items, as strings.
const BRIEF_LISTS = ['definitions', 'options', 'steps', 'rules', 'interpretation', 'notCovered']
function brief(data) {
  const ai = data.ai
  if (!ai || typeof ai !== 'object') return undefined
  const out = { status: ai.status === 'reviewed' ? 'reviewed' : 'draft', summary: String(ai.summary ?? '').trim() }
  for (const k of BRIEF_LISTS) {
    if (Array.isArray(ai[k]) && ai[k].length) out[k] = ai[k].map(String)
  }
  return out
}

const pages = []
const english = new Map()
for (const lang of LANGS) {
  const langDir = path.join(contentDir, lang)
  if (!fs.existsSync(langDir)) continue
  for (const file of walk(langDir).sort()) {
    const rel = path.relative(langDir, file).split(path.sep).join('/')
    const { data, content } = matter(fs.readFileSync(file, 'utf8'))
    const h1 = content.match(/^#\s+(.+)$/m)
    const title = String(data.title ?? (h1 ? flatten(parser.parse(h1[0])).replace(/\s*\[#[^\]]+]\s*$/, '').trim() : path.basename(rel).replace(/\.mdx?$/, '')))
    const page = { url: pageUrl(lang, rel), lang, title, slug: rel.replace(/\.mdx?$/, ''), frontmatter: links(data), sections: sections(content, title) }
    const ai = brief(data)
    if (ai) page.ai = ai
    if (lang === 'en') english.set(page.slug, page)
    pages.push(page)
  }
}

// The Defaults and thresholds page draws its tables from src/data/methodology-defaults.json (generated from
// cd2030.core) with a component, so its text holds only headings: fold the values into each step's section, in the
// page's language, so the AI can quote them.
const defaultsFile = path.resolve('src/data/methodology-defaults.json')
if (fs.existsSync(defaultsFile)) {
  const defaults = JSON.parse(fs.readFileSync(defaultsFile, 'utf8'))
  const i18nFile = path.resolve('src/data/methodology-defaults.i18n.json')
  const i18n = fs.existsSync(i18nFile) ? JSON.parse(fs.readFileSync(i18nFile, 'utf8')) : {}
  const show = v => Array.isArray(v) ? (v.length === 2 && v.every(x => typeof x === 'number') ? `${v[0]}-${v[1]}` : v.join(', ')) : String(v)
  for (const page of pages) {
    if (page.slug !== 'docs/reference/defaults') continue
    // which step each heading's table shows, from the page source (<MethodDefaults ... step="...">)
    const source = fs.readFileSync(path.join(contentDir, page.lang, 'docs/reference/defaults.mdx'), 'utf8')
    const stepOf = new Map()
    let heading = null
    for (const line of source.split(/\r?\n/)) {
      const h = line.match(/^#{2,3}\s+(.+?)\s*(?:\[#[^\]]+\])?\s*$/)
      if (h) heading = h[1].trim()
      const m = line.match(/<MethodDefaults\b[^>]*\bstep="([a-z_]+)"/)
      if (m && heading) stepOf.set(heading, m[1])
    }
    const tr = i18n[page.lang] ?? {}
    for (const section of page.sections) {
      const step = stepOf.get(section.heading)
      if (!step) continue
      const rows = defaults.entries.filter(e => e.step === step).map(e => {
        const t = tr[e.id] ?? {}
        const unit = e.unit ? ` ${e.unit}` : ''
        return `${t.label ?? e.label}: ${show(e.value)}${unit} (${e.group}). ${t.note ?? e.note}`
      })
      if (rows.length) section.text = `${section.text}\n${rows.join('\n')}`.trim()
    }
  }
}

// Translations carry the English page's links (only the English pages have them), and say which page that is.
for (const page of pages) {
  if (page.lang === 'en') continue
  const source = english.get(page.slug)
  if (source && LINK_KEYS.every(k => page.frontmatter[k].length === 0)) {
    page.frontmatter = { ...source.frontmatter }
    page.translationOf = source.url
  }
  // and its AI brief (in English: the translated page's own brief, if it ever gets one, wins)
  if (source?.ai && !page.ai) {
    page.ai = source.ai
    page.translationOf ??= source.url
  }
}

const version = createHash('sha256').update(JSON.stringify(pages)).digest('hex').slice(0, 16)
const corpus = {
  version,
  generatedAt: new Date().toISOString(),
  site: SITE,
  notes: 'Only the English pages carry front matter links and AI briefs (ai: see src/ai/BRIEFS.md); a French or Portuguese page with the same slug inherits them, and translationOf names the English page. A brief is used by the AI only when its status is reviewed.',
  pages
}

fs.mkdirSync(path.join(outDir, 'ai'), { recursive: true })
fs.writeFileSync(path.join(outDir, 'ai', 'corpus.json'), JSON.stringify(corpus))

const byLang = lang => pages.filter(p => p.lang === lang)
const llms = [
  '# DataSuite documentation',
  '',
  '> Methodology and user guides for the Countdown to 2030 analysis in DataSuite: data quality, adjustment, denominators, coverage, equity, sub-national analysis, mortality, service utilization, health system performance, and the RMNCAH, Vaxx and Pooled apps.',
  '',
  `The full corpus, split into sections with their links to the apps and cd2030.core: ${SITE}/ai/corpus.json (version ${version}).`,
  ...LANGS.flatMap(lang => ['', `## ${{ en: 'English', fr: 'Francais', pt: 'Portugues' }[lang]}`, '',
    ...byLang(lang).map(p => `- [${p.title}](${p.url})`)])
].join('\n') + '\n'
fs.writeFileSync(path.join(outDir, 'llms.txt'), llms)

const full = byLang('en').map(p => [`# ${p.title}`, `Source: ${p.url}`, '',
  ...p.sections.flatMap(s => [s.anchor ? `## ${s.heading}` : '', s.text, ''])].join('\n')).join('\n\n')
fs.writeFileSync(path.join(outDir, 'llms-full.txt'), full)

const sectionCount = pages.reduce((n, p) => n + p.sections.length, 0)
console.log(`AI corpus ${version}: ${pages.length} pages, ${sectionCount} sections -> ${path.relative(process.cwd(), path.join(outDir, 'ai', 'corpus.json'))}, llms.txt, llms-full.txt`)
