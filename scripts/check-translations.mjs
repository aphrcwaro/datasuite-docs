// Tracks which French and Portuguese pages are out of date with their English page.
//
// src/data/translations.json records, for every page, the hash of the English text each translation was last brought
// up to date with. When the English page changes, its translations are reported as stale until someone updates them
// and marks them:
//
//   node scripts/check-translations.mjs                       report stale, missing and untracked translations
//   node scripts/check-translations.mjs --strict              ... and exit 1 when there are any (CI)
//   node scripts/check-translations.mjs --mark fr docs/methodology/coverage [more routes]
//                                                             record that these fr pages match the English now
//   node scripts/check-translations.mjs --mark all <routes>   the same for every language
//   node scripts/check-translations.mjs --mark-all            record every existing translation as up to date
//                                                             (baseline; use only after reviewing them)
//
// The English text hashed is the page body (after the front matter) plus its title: the front matter's `ai:` brief
// and link lists are English-only and don't need translating. Line endings and trailing spaces are ignored.
// Also checked: src/data/methodology-defaults.i18n.json has a fr and pt label for every methodology default.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const content = path.join(root, 'src', 'content')
const manifestPath = path.join(root, 'src', 'data', 'translations.json')
const LANGS = ['fr', 'pt']

const pagesOf = lang => {
  const out = new Map()
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.mdx?$/.test(entry.name)) out.set(path.relative(path.join(content, lang), full).split(path.sep).join('/').replace(/\.mdx?$/, ''), full)
    }
  }
  walk(path.join(content, lang))
  return out
}

const hashOf = file => {
  const { data, content: body } = matter(fs.readFileSync(file, 'utf8'))
  const text = `${data.title ?? ''}\n${body}`.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim()
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)
}

const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { englishOnly: [], pages: {} }
const en = pagesOf('en')
const translated = Object.fromEntries(LANGS.map(lang => [lang, pagesOf(lang)]))
const save = () => {
  const pages = Object.fromEntries(Object.keys(manifest.pages).sort().map(k => [k, manifest.pages[k]]))
  fs.writeFileSync(manifestPath, JSON.stringify({ ...manifest, pages }, null, 2) + '\n')
}

const args = process.argv.slice(2)
if (args[0] === '--mark' || args[0] === '--mark-all') {
  const all = args[0] === '--mark-all'
  const langs = all || args[1] === 'all' ? LANGS : [args[1]]
  const routes = all ? [...en.keys()] : args.slice(2)
  if (!all && (!LANGS.includes(langs[0]) && args[1] !== 'all' || !routes.length)) {
    console.error('usage: --mark <fr|pt|all> <route> [route...]   (route as in src/content/en, e.g. docs/methodology/coverage)')
    process.exit(2)
  }
  let n = 0
  for (const route of routes) {
    if (!en.has(route)) { console.error(`no English page ${route}`); process.exitCode = 1; continue }
    for (const lang of langs) {
      if (!translated[lang].has(route)) { if (!all) console.error(`no ${lang} page ${route}`); continue }
      manifest.pages[route] = { ...manifest.pages[route], [lang]: hashOf(en.get(route)) }
      n++
    }
  }
  save()
  console.log(`marked ${n} translation(s) as up to date`)
  process.exit()
}

const report = { stale: [], missing: [], untracked: [], orphan: [] }
for (const [route, file] of en) {
  const hash = hashOf(file)
  for (const lang of LANGS) {
    if (!translated[lang].has(route)) {
      if (!manifest.englishOnly.includes(route)) report.missing.push(`${lang}/${route}`)
    } else if (!manifest.pages[route]?.[lang]) report.untracked.push(`${lang}/${route}`)
    else if (manifest.pages[route][lang] !== hash) report.stale.push(`${lang}/${route}`)
  }
}
for (const lang of LANGS) for (const route of translated[lang].keys()) if (!en.has(route)) report.orphan.push(`${lang}/${route}`)

// the methodology defaults' translated labels
const defaults = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'methodology-defaults.json'), 'utf8'))
const i18n = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'methodology-defaults.i18n.json'), 'utf8'))
const ids = (Array.isArray(defaults) ? defaults : defaults.entries ?? []).map(e => e.id)
for (const lang of LANGS) for (const id of ids) if (!i18n[lang]?.[id]?.label) report.missing.push(`${lang}: methodology default ${id} (src/data/methodology-defaults.i18n.json)`)

const labels = {
  stale: 'stale (the English page changed since the translation was marked up to date)',
  missing: 'missing (no translation; add the route to englishOnly in src/data/translations.json if intended)',
  untracked: 'untracked (never marked; review, then --mark)',
  orphan: 'orphan (no English page)'
}
let total = 0
for (const [key, items] of Object.entries(report)) {
  if (!items.length) continue
  total += items.length
  console.log(`${labels[key]}: ${items.length}`)
  for (const item of items) console.log(`  ${item}`)
}
console.log(total ? `Translations: ${total} to look at.` : 'Translations OK: every fr and pt page is up to date with its English page.')
if (total && args.includes('--strict')) process.exit(1)
