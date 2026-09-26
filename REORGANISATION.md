# Docs reorganisation (2026-09-26)

Goal: easy to understand, and easy to get reference material from -- for people and for the Countdown AI.

## Structure

```
Documentation
  GET STARTED     Overview · Installing DataSuite (with requirements, portable) · Getting started (the interface)
  METHODOLOGY     the Countdown analytical framework -- the single source of the method, in workflow order:
                  Overview · Workflow · Analysis setup · Data quality · Data adjustment · Denominators · Coverage ·
                  Bayesian coverage · Equity · Subnational · Mortality · Service utilisation · Health system ·
                  Dissemination
  REFERENCE       Quick reference (each analysis step -> its method page -> its app pages) · Indicator definitions ·
                  Scientific rationale (the former Methods page) · Glossary
DataSuite Apps    Overview · Data Extractor · RMNCAH · Vaxx · Pooled · AI assistant
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

Everything else keeps its URL (the framework pages keep their numbered file names, so existing links, the AI briefs
and the corpus stay valid; the menu shows titles without numbers).

## Also

- Tables of contents on every methodology, reference and app page (reference use).
- New: Reference overview (quick reference table), Glossary (English; drawn from the pages' own definitions, each
  linking to its source).
- The AI assistant page: the framework's guidance on using AI, plus what the DataSuite assistant does now (the
  Countdown tools, grounding in the methodology and the dataset, sources, permissions, where its files go). The apps'
  "exports and AI" pages keep exports and link there for AI (they described removed tools).
- Not changed here (need the methodology owner): the content conflicts listed below, and restructuring each
  methodology page onto one template (a later pass, with the translations).

## Conflicts for the methodology owner

- Data adjustment below 75% reporting: "no adjustment, flag unreliable" (threshold rules) vs "impute with the district
  median" (summary table).
- Outlier baseline: "5 x MAD from the monthly median for the year" (data quality) vs "from the district monthly median"
  (adjustment); the former Methods page has its own adjustment action summary too.
- Mortality: ratio range 0.5-2.0 on the chart vs defaults 1.0, 2.0, 3.0.
- Data quality: missingness and ratio calculations "TBC"; expected ranges for checks 3a-3d not given.
- RMNCAH coverage targets: table title says 90%, the calculation uses the listed thresholds.
- Whether UN projections exist below national level (not stated).
