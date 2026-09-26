import { Callout } from 'nextra/components'
import { useMDXComponents } from '@/mdx-components'
import defaults from '@/data/methodology-defaults.json'
import i18n from '@/data/methodology-defaults.i18n.json'

// The method's numbers (Reference > Defaults and thresholds), from src/data/methodology-defaults.json, which is generated
// from cd2030.core (cd_methodology_defaults()) -- so the tables show what the apps use. English labels and notes come
// from the JSON; French and Portuguese from src/data/methodology-defaults.i18n.json ({ fr: { <id>: { label, note } },
// pt: {...}, headers, groups, units, sections }). An id without a translation falls back to the English text.
//   <MethodDefaults lang="fr" step="data_quality" />   the table of one step
//   <MethodDefaultsNote lang="fr" />                     where the values come from (and a warning while a placeholder)

// The framework section each entry links to: a section key per step, chosen from the entry's id (or the i18n file's
// `sections` override), then that section's page, anchor and title in each language. The anchors are Nextra's heading
// ids (github-slugger over the heading text), the same as out/ai/corpus.json.
const PAGES = {
  data_quality: 'data-quality',
  adjustment: 'data-adjustment',
  denominators: 'denominators',
  coverage: 'coverage',
  subnational: 'subnational',
  mortality: 'mortality'
}

const SECTIONS = {
  data_quality: {
    page: { en: ['', 'Data quality assessment'], fr: ['', 'Évaluation de la qualité des données'], pt: ['', 'Avaliação da qualidade dos dados'] },
    reporting: { en: ['reporting-completeness', 'Reporting completeness'], fr: ['exhaustivité-des-rapports', 'Exhaustivité des rapports'], pt: ['completude-dos-relatórios', 'Completude dos relatórios'] },
    outliers: { en: ['outlier-detection', 'Outlier detection'], fr: ['détection-des-valeurs-aberrantes', 'Détection des valeurs aberrantes'], pt: ['deteção-de-valores-atípicos', 'Deteção de valores atípicos'] },
    consistency: { en: ['internal-consistency', 'Internal consistency'], fr: ['cohérence-interne', 'Cohérence interne'], pt: ['consistência-interna', 'Consistência interna'] },
    missing: { en: ['data-missingness', 'Data missingness'], fr: ['données-manquantes', 'Données manquantes'], pt: ['dados-ausentes', 'Dados ausentes'] },
    ratios: { en: ['ratio-calculations', 'Ratio calculations'], fr: ['calculs-de-ratios', 'Calculs de ratios'], pt: ['cálculo-de-rácios', 'Cálculo de rácios'] },
    score: { en: ['overall-quality-score', 'Overall quality score'], fr: ['score-de-qualité-global', 'Score de qualité global'], pt: ['pontuação-geral-de-qualidade', 'Pontuação geral de qualidade'] }
  },
  adjustment: {
    page: { en: ['', 'Data adjustment'], fr: ['', 'Ajustement des données'], pt: ['', 'Ajuste de dados'] },
    k: { en: ['configuring-the-k-factor', 'Configuring the k-factor'], fr: ['configuration-du-facteur-k', 'Configuration du facteur k'], pt: ['configuração-do-fator-k', 'Configuração do fator k'] },
    thresholds: { en: ['critical-data-threshold-rules', 'Critical data threshold rules'], fr: ['règles-de-seuil-de-données-critiques', 'Règles de seuil de données critiques'], pt: ['regras-de-limiar-de-dados-críticos', 'Regras de limiar de dados críticos'] },
    rules: { en: ['summary-of-data-adjustment-business-rules', 'Summary of data adjustment business rules'], fr: ['résumé-des-règles-de-gestion-de-lajustement-des-données', "Résumé des règles de gestion de l'ajustement des données"], pt: ['resumo-das-regras-de-negócio-do-ajuste-de-dados', 'Resumo das regras de negócio do ajuste de dados'] }
  },
  denominators: {
    page: { en: ['', 'Denominator assessment and selection'], fr: ['', 'Évaluation et sélection du dénominateur'], pt: ['', 'Avaliação e seleção do denominador'] },
    options: { en: ['denominator-options', 'Denominator options'], fr: ['options-de-dénominateur', 'Options de dénominateur'], pt: ['opções-de-denominador', 'Opções de denominador'] },
    derived: { en: ['computing-the-derived-denominators', 'Computing the derived denominators'], fr: ['calcul-des-dénominateurs-dérivés', 'Calcul des dénominateurs dérivés'], pt: ['cálculo-dos-denominadores-derivados', 'Cálculo dos denominadores derivados'] },
    trend: { en: ['population-trend-comparison', 'Population trend comparison'], fr: ['comparaison-des-tendances-de-la-population', 'Comparaison des tendances de la population'], pt: ['comparação-da-tendência-populacional', 'Comparação da tendência populacional'] }
  },
  coverage: {
    page: { en: ['', 'National coverage'], fr: ['', 'Couverture nationale'], pt: ['', 'Cobertura nacional'] },
    anc: { en: ['antenatal-care-anc', 'Antenatal care (ANC)'], fr: ['soins-prénatals-cpn', 'Soins prénatals (CPN)'], pt: ['cuidados-pré-natais-cpn', 'Cuidados pré-natais (CPN)'] },
    delivery: { en: ['delivery-care', 'Delivery care'], fr: ['soins-daccouchement', "Soins d'accouchement"], pt: ['cuidados-de-parto', 'Cuidados de parto'] },
    immunization: { en: ['immunization', 'Immunization'], fr: ['vaccination', 'Vaccination'], pt: ['imunização-vacinação', 'Imunização (vacinação)'] },
    // The apps' coverage targets are stated with the subnational targets.
    targets: { page: 'subnational', en: ['target-values', 'Target values'], fr: ['valeurs-cibles', 'Valeurs cibles'], pt: ['valores-das-metas', 'Valores das metas'] }
  },
  subnational: {
    page: { en: ['', 'Subnational analysis'], fr: ['', 'Analyse infranationale'], pt: ['', 'Análise subnacional'] },
    inequality: { en: ['inequality', 'Inequality'], fr: ['inégalité', 'Inégalité'], pt: ['desigualdade', 'Desigualdade'] },
    targets: { en: ['target-values', 'Target values'], fr: ['valeurs-cibles', 'Valeurs cibles'], pt: ['valores-das-metas', 'Valores das metas'] }
  },
  mortality: {
    page: { en: ['', 'Mortality'], fr: ['', 'Mortalité'], pt: ['', 'Mortalidade'] },
    immr: { en: ['considerations-for-immr', 'Considerations for iMMR'], fr: ['considérations-pour-limmr', "Considérations pour l'iMMR"], pt: ['considerações-sobre-o-immr', 'Considerações sobre o iMMR'] },
    isbr: { en: ['considerations-for-isbr', 'Considerations for iSBR'], fr: ['considérations-pour-lisbr', "Considérations pour l'iSBR"], pt: ['considerações-sobre-o-isbr', 'Considerações sobre o iSBR'] },
    sbmd: { en: ['ratio-of-stillbirths-to-maternal-deaths-at-national-level', 'Ratio of stillbirths to maternal deaths at national level'], fr: ['ratio-des-mortinaissances-par-rapport-aux-décès-maternels-au-niveau-national', 'Ratio des mortinaissances par rapport aux décès maternels au niveau national'], pt: ['rácio-de-natimortos-para-mortes-maternas-a-nível-nacional', 'Rácio de natimortos para mortes maternas a nível nacional'] },
    scenarios: { en: ['evaluation-scenarios-and-interpretation', 'Evaluation scenarios and interpretation'], fr: ['scénarios-dévaluation-et-interprétation', "Scénarios d'évaluation et interprétation"], pt: ['cenários-de-avaliação-e-interpretação', 'Cenários de avaliação e interpretação'] },
    ratios: { en: ['community-to-institutional-mmr-ratios', 'Community-to-institutional MMR ratios'], fr: ['ratios-mmr-communautaireétablissement', 'Ratios MMR communautaire/établissement'], pt: ['rácios-mmr-comunitárioinstitucional', 'Rácios MMR comunitário/institucional'] },
    outliers: { en: ['outlier-detection-thresholds', 'Outlier detection thresholds'], fr: ['seuils-de-détection-des-valeurs-aberrantes', 'Seuils de détection des valeurs aberrantes'], pt: ['limiares-de-deteção-de-valores-atípicos', 'Limiares de deteção de valores atípicos'] }
  }
}

// The section of an entry, from its id (first match wins; otherwise the page itself).
const RULES = {
  data_quality: [[/outlier|mad/, 'outliers'], [/score|performance/, 'score'], [/missing/, 'missing'],
    [/pairs|consisten/, 'consistency'], [/ratio|anc1|penta|opv/, 'ratios'], [/report|complet|district/, 'reporting']],
  adjustment: [[/(^|_)k($|_)|k_?factor/, 'k'], [/report|cutoff|threshold|rate/, 'thresholds'], [/.*/, 'rules']],
  denominators: [[/growth|cbr|cdr|crude|un_|dhis2|projection/, 'trend'], [/option/, 'options'], [/.*/, 'derived']],
  coverage: [[/target|threshold/, 'targets'], [/anc/, 'anc'], [/deliver|csection|c_section|caesar|lbw|birth_?weight|sba|pnc/, 'delivery'],
    [/bcg|penta|dtp|measles|mcv|opv|immun|vacc/, 'immunization']],
  subnational: [[/madm|inequal/, 'inequality'], [/.*/, 'targets']],
  mortality: [[/outlier|sd|mad/, 'outliers'], [/sb.*md|stillbirth.*maternal|sbr_mmr/, 'sbmd'],
    [/completeness|scenario|range/, 'scenarios'], [/community|mc_mi|cmmr|ratio/, 'ratios'], [/isbr|stillbirth|sbr/, 'isbr'],
    [/immr|mmr|maternal/, 'immr']]
}

const TEXT = {
  en: {
    headers: { what: 'What', value: 'Value', group: 'Applies to', use: 'How the app uses it', method: 'Method page' },
    groups: { both: 'Both', rmncah: 'RMNCAH', vaccine: 'Vaccine' },
    empty: 'No values for this step in the generated file.',
    source: (pkg, v, d) => `Generated from ${pkg} ${v} on ${d}.`,
    placeholder: 'Placeholder: these are a few example entries, not yet the file generated from cd2030.core. The full list replaces them when src/data/methodology-defaults.json is generated.'
  }
}

const LANGS = ['en', 'fr', 'pt']

function t(lang) {
  const en = TEXT.en
  const other = i18n.ui?.[lang] ?? {}
  return {
    headers: { ...en.headers, ...(i18n.headers?.[lang] ?? {}) },
    groups: { ...en.groups, ...(i18n.groups?.[lang] ?? {}) },
    empty: other.empty ?? en.empty,
    source: other.source ?? null,
    placeholder: other.placeholder ?? en.placeholder
  }
}

function sectionOf(entry) {
  const override = i18n.sections?.[entry.id]
  if (override && SECTIONS[entry.step]?.[override]) return override
  const id = String(entry.id).toLowerCase()
  const hit = (RULES[entry.step] ?? []).find(([re]) => re.test(id))
  return hit ? hit[1] : 'page'
}

function formatNumber(n, lang) {
  return new Intl.NumberFormat(lang === 'en' ? 'en-GB' : lang, { maximumFractionDigits: 4 }).format(n)
}

function formatValue(entry, lang) {
  const tr = i18n[lang]?.[entry.id]
  if (tr?.value) return tr.value
  if (entry.unit === 'year') return String(entry.value)
  const pct = entry.unit === '%'
  const one = v => (typeof v === 'number' ? formatNumber(v, lang) + (pct ? (lang === 'fr' ? ' %' : '%') : '') : String(v))
  // A range (two numbers, id "..._range" or "..._window") reads "1 – 1.5"; a list ", " in English -- French and
  // Portuguese write decimals with a comma, so their lists use a semicolon.
  const isRange = Array.isArray(entry.value) && entry.value.length === 2 && /range|window/.test(entry.id)
  const sep = isRange ? ' – ' : lang === 'fr' ? ' ; ' : lang === 'pt' ? '; ' : ', '
  const values = Array.isArray(entry.value) ? entry.value.map(one).join(sep) : one(entry.value)
  const unit = entry.unit ? (i18n.units?.[lang]?.[entry.unit] ?? entry.unit) : ''
  if (!unit || pct || unit === 'proportion' || unit === 'ratio') return values
  return `${values} ${unit.replace(/^x /, '× ')}`
}

export function MethodDefaults({ lang = 'en', step }) {
  const L = LANGS.includes(lang) ? lang : 'en'
  const { table: Table, tr: Tr, th: Th, td: Td, a: A } = useMDXComponents()
  const text = t(L)
  const entries = (defaults.entries ?? []).filter(e => e.step === step)
  if (!entries.length) return <p><em>{text.empty}</em></p>

  return (
    <Table>
      <thead>
        <Tr>
          <Th>{text.headers.what}</Th>
          <Th>{text.headers.value}</Th>
          <Th>{text.headers.group}</Th>
          <Th>{text.headers.use}</Th>
          <Th>{text.headers.method}</Th>
        </Tr>
      </thead>
      <tbody>
        {entries.map(entry => {
          const tr = L === 'en' ? null : i18n[L]?.[entry.id]
          const key = sectionOf(entry)
          const section = SECTIONS[entry.step]?.[key] ?? SECTIONS[entry.step]?.page
          const [anchor, title] = section?.[L] ?? ['', entry.step]
          const href = `/${L}/docs/methodology/${section?.page ?? PAGES[entry.step]}${anchor ? '#' + anchor : ''}`
          return (
            <Tr key={entry.id}>
              <Td>{tr?.label ?? entry.label}</Td>
              <Td style={{ whiteSpace: 'nowrap' }}>{formatValue(entry, L)}</Td>
              <Td>{text.groups[entry.group] ?? entry.group}</Td>
              <Td>{tr?.note ?? entry.note}</Td>
              <Td>{PAGES[entry.step] ? <A href={href}>{title}</A> : null}</Td>
            </Tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export function MethodDefaultsNote({ lang = 'en' }) {
  const L = LANGS.includes(lang) ? lang : 'en'
  const text = t(L)
  const date = String(defaults.generatedAt ?? '').slice(0, 10)
  const source = text.source
    ? text.source.replace('{package}', defaults.package).replace('{version}', defaults.version).replace('{date}', date)
    : TEXT.en.source(defaults.package, defaults.version, date)
  if (defaults.placeholder) return <Callout type="warning">{text.placeholder}</Callout>
  return <p><em>{source}</em></p>
}

export default MethodDefaults
