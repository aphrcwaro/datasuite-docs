# AI briefs

Each docs page the Countdown AI relies on carries a short **AI brief** in its front matter, under `ai:`. The pages are
written to teach a person; the brief states the same method as explicit lists -- definitions, options, steps, rules,
how to read the results, and what the page does not cover -- so the AI applies the method instead of filling gaps with
general knowledge. The AI is sent the brief first (about 150-400 words), and fetches full sections only for detail or
quotes.

A brief is part of its page: change them together. `scripts/check-ai-links.mjs` fails when a linked page has no
brief, or a brief points to a section that doesn't exist.

## Format

```yaml
ai:
  status: draft            # draft | reviewed -- the AI uses a brief only once it is reviewed
  summary: >-              # 2-4 sentences: what this page's method is for and its core idea
    ...
  definitions:             # optional: terms as this page defines them
    - "Coverage: the population who received a service divided by the population who needed it (#objective)"
  options:                 # optional: the choices the method offers, exactly as listed
    - "Penta-1 derived (#denominator-options)"
  steps:                   # optional: the procedure, in order
    - "Compare each option's population trend with the UN projection (#population-trend-comparison)"
  rules:                   # the method's explicit rules and criteria
    - "The best denominator is chosen per indicator, from the six options (#final-selection-and-synthesis)"
  interpretation:          # optional: how to read the page's results
    - "..."
  notCovered:              # optional: questions a reader might expect here that the page does not answer
    - "..."
```

Rules for writing one:

- **Only what the page says.** Every item must be supported by the page's own text; no outside knowledge, no
  general public-health reasoning, no thresholds or recommendations the page doesn't state. Close paraphrase is fine;
  when in doubt, quote.
- **Every item ends with its section anchor**, `(#anchor)`, the section that supports it. Anchors are the page's heading
  ids (github-slugger of the heading text, or its `[#custom-id]`), as in `out/ai/corpus.json`.
- **Explicit over complete.** Lists the AI can apply; leave narrative, examples and screenshots to the page.
- **Short.** About 150-400 words in total. A long page gets a brief of its method, not a summary of every paragraph.
- **App pages** (`apps/<app>/...`) describe the screen: what each page and card shows, how to use it, and which
  framework page holds the method (as a link, e.g. `rules: ["The method is in Denominator assessment and selection
  (/en/docs/methodology/denominators/)"]`); they don't restate the method.
- **`notCovered`** lists real gaps honestly, so the AI says "the methodology doesn't address this" rather than
  improvising.
- **`status: draft`** until someone who knows the method has checked it against the page; then `reviewed`.

French and Portuguese pages inherit the English page's brief by slug (as they do the front matter links).
