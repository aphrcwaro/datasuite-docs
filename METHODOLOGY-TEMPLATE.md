# The methodology page template

Every analysis-step page in `src/content/<lang>/docs/methodology/` follows the same outline, so a reader (or the
Countdown AI) finds the same kind of material in the same place on every page. The overview page (`index`)
is exempt.

## Outline

```mdx
---
(front matter: topics, reportKinds, cacheMembers, appPages, ai brief -- unchanged keys; see src/ai/BRIEFS.md)
---

import { Callout, Steps } from 'nextra/components'

# <Page title>

<Lead: one to three sentences -- the question this step answers and what it produces.>

<Callout type="info">
**At a glance**
- **Answers:** <the question(s) the step answers>
- **Uses:** <inputs, and the step they come from, linked>
- **Produces:** <outputs, and the step that uses them, linked>
- **In the apps:** <links to the app guide pages, /<lang>/apps/countdown/... (and pooled where relevant)>
- **Defaults:** <link to /<lang>/docs/reference/defaults#<step section>> (only when the step has entries there)
</Callout>

## Why it matters
Rationale: the scientific and programmatic basis. Short; the long argument lives in
/<lang>/docs/reference/rationale (link to its section).

## Method
Definitions, options, formulas, parameters and business rules, as `###` sub-sections (one per concept, check or
topic). Tables of thresholds and rules live here.

## Interpretation
How to read the results: what good and bad look like, red flags, worked examples, figures.

## In the apps
Where and how the step is done in the apps: short numbered steps (`<Steps>`), with links to the app guide
(/<lang>/apps/countdown/...) for screen-by-screen detail. Note RMNCAH/Vaxx differences in a line or two.

## See also
Links: the rationale section, /<lang>/docs/reference/formulas, /<lang>/docs/reference/defaults, the glossary (en),
the previous and next step.
```

Section headings by language:

| en | fr | pt |
| --- | --- | --- |
| At a glance | En bref | Em resumo |
| Answers / Uses / Produces / In the apps / Defaults | Répond à / Utilise / Produit / Dans les applications / Valeurs par défaut | Responde a / Utiliza / Produz / Nas aplicações / Valores predefinidos |
| Why it matters | Pourquoi c'est important | Porque é importante |
| Method | Méthode | Método |
| Interpretation | Interprétation | Interpretação |
| In the apps | Dans les applications | Nas aplicações |
| See also | Voir aussi | Ver também |

## What goes where: methodology or app guide

The methodology pages hold **the method and its interpretation**; the app guide (`apps/countdown/`, `apps/pooled/`)
holds **how to use the app**. Each fact lives in one place; the other links to it.

| Methodology page (`docs/methodology/`) | App guide (`apps/`) |
| --- | --- |
| definitions, indicators and what they measure | which page, card and tab shows it |
| options and how to choose between them (e.g. the denominator options) | the control that sets it and its values |
| thresholds, targets, rules, formulas, defaults | where the app applies them (a line, linking to the method) |
| how to read a result: what a pattern, level or trend means, red flags | what the chart or table on screen contains (axes, colours, columns) |
| common pitfalls in interpreting or deciding | pitfalls in operating the app (order of steps, saving, filters) |
| worked examples | screenshots of the screens |

In an app guide page, a method point becomes one line linking to the methodology section ("What this shows and how
to read it: [Data quality > Outlier detection](/<lang>/docs/methodology/data-quality#outlier-detection)"). Under
Interpretation, a methodology page may end with `### Common pitfalls`.

## Rules

- **Pages with several topics** (e.g. subnational: coverage, inequality, targets): keep the one outline; each topic is a
  `###` under Method, and again under Interpretation and In the apps where it has material.
- **A section with nothing to say is left out** (e.g. no In the apps for a step the apps don't implement -- say so in
  At a glance instead). The order never changes.
- **Anchors are stable.** The outline's `##` headings use their natural anchors. Content headings keep the anchor they
  had: when one is renamed or moved, keep the old id with Nextra's suffix, `### New heading[#old-id]` (no space before the bracket). Links from other
  pages, the AI briefs' `(#anchor)` items and `src/components/MethodDefaults.jsx` rely on them.
- **Get help targets.** Each app page's Get help button opens a heading of the app guide (the `help` entries in
  cd2030.rmncah and cd2030.vaxx `R/pages.R`). Those headings carry the English id in every language (fr/pt use
  `[#english-id]`), so one id works for all three; don't rename or remove them without updating `pages.R`.
- **Restructure, don't rewrite.** Moving text into the outline must not drop or change a fact, number, rule, table,
  formula, figure or link. Methodology changes are made separately and recorded in REORGANISATION.md.
- **fr and pt mirror en**: same outline, same order, their own heading text (anchors follow their text).
- **Checks**: `npm run build`; `node scripts/check-ai-links.mjs --snapshot` (brief anchors); and every internal
  `#anchor` link must resolve.
