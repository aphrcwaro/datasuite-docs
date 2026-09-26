# Docs reorganisation (2026-09-26)

Goal: easy to understand, and easy to get reference material from -- for people and for the Countdown AI.

## Structure

```
Documentation
  GET STARTED     Overview · Installing DataSuite (with requirements, portable) · Getting started (the interface)
  METHODOLOGY     the Countdown analytical framework -- the single source of the method, in workflow order:
                  Overview (with the workflow) · Analysis setup · Data quality · Data adjustment · Denominators · Coverage ·
                  Bayesian coverage · Equity · Subnational · Mortality · Service utilisation · Health system ·
                  Dissemination
  REFERENCE       Quick reference (each analysis step -> its method page -> its app pages) · RMNCAH and vaccine analyses ·
                  Indicator definitions ·
                  Scientific rationale (the former Methods page) · Defaults and thresholds ·
                  Formulas · Glossary
DataSuite Apps    Overview · Data Extractor · RMNCAH and Vaxx apps (one guide; app differences in RMNCAH | Vaxx tabs,
                  RMNCAH-only pages marked) · Pooled · AI assistant
FAQs · Resources
```

## Moves (all three languages; old URLs redirect, 301, in the site's Caddyfile)

| From | To |
| --- | --- |
| `docs/framework/8-indicator-definitions` | `docs/reference/indicator-definitions` |
| `docs/methods` | `docs/reference/rationale` |
| `docs/framework/13-ai-leverage` | `apps/ai-assistant` |
| `docs/supporting/requirements` | `docs/setup/requirements` |
| `docs/supporting/portable` | `docs/setup/portable` |
| `apps/rmncah` and `apps/vaxx` (section roots) | `apps/countdown` |
| `apps/rmncah/<page>`, `apps/vaxx/<page>` (every page; the two apps' guides merged, same page names) | `apps/countdown/<page>` |
| `docs/framework` | `docs/methodology` |
| `docs/framework/<n-name>` (numbered file names) | `docs/methodology/<name>`: analysis-setup, data-quality, data-adjustment, denominators, coverage, bayesian-coverage, equity, subnational, mortality, service-utilisation, health-system, dissemination |
| `docs/framework/0-workflow`, then `docs/methodology/workflow` (Workflow overview) | `docs/methodology` (the methodology overview: the workflow page's text merged into it, and its module cards now cover every methodology page) |

Everything else keeps its URL. Heading anchors are kept across the moves and the template restructure (renamed
headings carry their old id, `### New heading[#old-id]`), so links with `#anchor` still land on the right section.

## Also

- Tables of contents on every methodology, reference and app page (reference use).
- New: Reference overview (quick reference table), Glossary (English; drawn from the pages' own definitions, each
  linking to its source).
- The AI assistant page: the framework's guidance on using AI, plus what the DataSuite assistant does now (the
  Countdown tools, grounding in the methodology and the dataset, sources, permissions, where its files go). The apps'
  "exports and AI" pages keep exports and link there for AI (they described removed tools).
- Every methodology page follows one outline (METHODOLOGY-TEMPLATE.md): lead, At a glance, Why it matters, Method,
  Interpretation, In the apps, See also -- in en, fr and pt.
- Method and usage split (METHODOLOGY-TEMPLATE.md, "What goes where"): definitions, options, rules, how to read results
  and interpretation pitfalls moved from the app guide (apps/countdown) into the methodology pages; the app guide keeps
  the screens, controls and steps, with a link line to the method wherever it used to explain it. The docs menu has one
  entry per section (the separator labels that repeated them were removed).
- RMNCAH and vaccine analyses (plan item 5): a reference page, `docs/reference/rmncah-vs-vaccine`, lists every rule that
  differs between an RMNCAH analysis (RMNCAH app) and a vaccine analysis (Vaxx app), from cd2030.core; each methodology
  page states the difference once, where it occurs, in a standard callout ("RMNCAH and vaccine analyses differ here")
  linking to it; RMNCAH-only pages say "RMNCAH app only" in At a glance.
- Reference: Defaults and thresholds (generated from cd2030.core's `cd_methodology_defaults()`, so the numbers match
  the code) and Formulas.
- Reference: Abbreviations (per language, as each language's pages use them); the rationale page's title is now
  "Scientific rationale", as in the menu.
- Every page has a `description` in its front matter (the meta description and link previews), in each language.
- Data Extractor pages checked against the extractor's code (datasuite `contrib/dhis2`): action names, the mapping-mode
  warning, server suggestions, the download dialog's fields, an export step, and the workflow order (save the mapping,
  then download). Still to do when the renamed field labels ship (Result Name, Analysis Code, DHIS2 Data Mapping):
  update mapping.mdx and retake its screenshots.
- Checks (npm scripts, and in CI): `links` -- every internal link leads to a page and heading (scripts/check-anchors.mjs);
  `translations` -- fr/pt pages whose English page changed since they were last marked up to date
  (scripts/check-translations.mjs, state in src/data/translations.json; after updating a translation run
  `node scripts/check-translations.mjs --mark <fr|pt|all> <route>`). The baseline (2026-09-26) marks every existing
  translation as current: it tracks changes from then on, it doesn't certify the older translations.

## Conflicts for the methodology owner

None open. All were decided on 2026-09-26 (below).

Resolved from the 2024 Countdown vaccination guidebook: data quality missingness, ratio calculations and expected
ranges; UN projections are national only; derived-denominator formulas and defaults; DHIS2 projection checks;
subnational target values.

Resolved by decision (2026-09-26): keep the apps' rules (cd2030.core), and state them in the docs.
- Below 75% reporting: a district-month's reporting rate below 75% (or missing) is replaced by the median of the
  district's rates between 75% and 100% for that service; the count is then adjusted with k as usual (not left
  unadjusted, not replaced).
- Outliers: more than 5 x MAD from the district's median monthly value, median and MAD computed from all years except the
  most recent one (the same test at the level being assessed in the data quality checks); in adjustment an outlier is
  replaced by the median of the district's non-outlier months in the same year.
- Starting k: a new dataset starts at k = 0 (no adjustment) and the analyst sets k per service; 0.25 is the
  guidebook's default (and adjust_service_data()'s), not the app's starting value.
- Mortality: community-to-institutional ratios 0.5, 1.0, 1.5, 2.0 (what the app computes and charts), not 1.0, 2.0, 3.0.
- Neonatal mortality fallback 2.5% (guidebook example 3%); the rate the analyst supplies replaces it.
- Overall data quality score keeps 1c (the guidebook leaves it out).
- Vaccine analyses check the ANC, delivery and immunization forms (the guidebook: immunization only).
- Subnational targets: the % of units meeting per-unit thresholds; the IA2030 lowest-20%-of-districts measure is not
  computed.
- DHIS2 projection checks: made by the analyst from the trends the apps show.
- Fully immunized: not mentioned (not computed by the apps).

Fixed in the app: the district target table was titled "Sub-National with coverage >90%"; it is now "Districts Meeting
the Coverage Target" (cd2030.core translation `title_target_district_rate`).
