# Feature: GitHub Copilot Cost Calculator View

## Summary

Add a new **GitHub Copilot Cost Calculator** view to the application that allows users to estimate and compare the cost of using GitHub Copilot across different plans and models based on token usage. This extends the existing cost calculator (currently focused on GitHub Actions runners) with a new section for Copilot usage-based billing.

## Background

Starting June 1, 2026, GitHub is moving Copilot from request-based billing to usage-based (token-based) billing. Each interaction consumes input tokens, output tokens, and cached tokens, priced per model. Costs are tracked in **AI Credits** (1 AI Credit = $0.01 USD). Each plan includes a monthly AI Credits allowance; overage is billed at per-token rates.

## Requirements

### 1. New Sidebar Navigation Entry
- Add a **"Copilot Calculator"** section in the `AppSidebar` alongside the existing "Cost Calculator" and "Usage Analysis" sections
- Include sub-navigation items for the different calculator tabs (see below)

### 2. Copilot Plan Comparison
Display and compare the following Copilot plans side-by-side:

| Plan | Price | Included AI Credits (USD equivalent) |
|------|-------|--------------------------------------|
| Free | $0/mo | ~$0.50 (50 premium requests) |
| Pro | $10/mo | ~$3.00 (300 premium requests) |
| Pro+ | $39/mo | ~$15.00 (1,500 premium requests) |
| Business | $19/user/mo | $30 pooled per user (promotional, $19 after Aug 2026) |
| Enterprise | $39/user/mo | $70 pooled per user (promotional, $39 after Aug 2026) |

Users should be able to:
- Select a plan tier
- See included AI credits allowance
- See overage rates
- Compare monthly cost across plans for a given usage level

### 3. Model Pricing Data

Store per-model pricing (per 1M tokens) in a new data file (`src/data/copilotModels.ts`), organized by provider:

**OpenAI:** GPT-5.4, GPT-5.2-Codex, GPT-5.1-Codex, GPT-4.1, GPT-5 mini
**Anthropic:** Claude Haiku 4.5, Claude Sonnet 4.5/4.6, Claude Opus 4.6/4.7 (includes cache write cost)
**Google:** Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 3.1 Pro, Gemini 3 Flash
**xAI:** Grok models
**Fine-tuned (GitHub):** Raptor mini, Goldeneye

Each model entry should include: `id`, `name`, `provider`, `releaseStatus`, `category`, `inputPricePerMillion`, `cachedInputPricePerMillion`, `outputPricePerMillion`, and optionally `cacheWritePricePerMillion` (for Anthropic).

### 4. Token-Based Cost Calculator

Provide interactive inputs for estimating cost:

- **Model selector** — dropdown grouped by provider
- **Input tokens** — slider + numeric input field (range: 0 to 10M+)
- **Output tokens** — slider + numeric input field (range: 0 to 10M+)
- **Cached input tokens** — slider + numeric input field (optional, defaults to 0)
- **Cache write tokens** — slider + numeric input field (only shown for Anthropic models)

Display:
- Cost breakdown: input cost, cached input cost, cache write cost (if applicable), output cost
- Total cost in USD
- Total cost in AI Credits
- Whether the usage fits within the selected plan's included allowance

### 5. Prompt-Based Cost Estimator

Allow users to paste a prompt (or set of instruction files) into a text area to estimate token count and cost:

- Text area input for pasting prompts/instructions
- Approximate token count estimation (using a ~4 characters per token heuristic, or a simple tokenizer)
- Auto-populate the input token fields based on the estimated count
- Show estimated cost for the pasted prompt across selected model(s)

### 6. Plan Comparison Visualization

- Bar chart or table comparing monthly cost across all 5 plans for the user's configured usage level
- Highlight which plan offers the best value for the given usage
- Show breakeven points (at what usage level does upgrading to a higher plan save money?)
- Color-coded savings indicators (matching existing design: green for savings, red for higher cost)

### 7. Model Comparison Table

- Side-by-side comparison of all models showing cost per interaction for the configured token amounts
- Sort by total cost (ascending/descending)
- Filter by provider
- Highlight included/default models vs premium models

## Technical Implementation Notes

- Follow the existing app architecture: new data file in `src/data/`, new components in `src/components/`, extend `AppView` type in `AppSidebar.tsx`
- Reuse existing UI components (Card, Input, Label, Slider, Badge, Separator, Tabs, etc.)
- Use Recharts for any visualizations (already a dependency)
- Use Radix UI Slider (`@radix-ui/react-slider` already installed) for token amount sliders
- Maintain the existing design system (colors, fonts, spacing, animations from PRD.md)
- Ensure responsive/mobile layout following existing patterns

## Acceptance Criteria

- [ ] New "Copilot Calculator" section appears in the sidebar navigation
- [ ] Copilot model pricing data is stored in `src/data/copilotModels.ts` with all providers
- [ ] Users can select a model and input token amounts via sliders and input fields
- [ ] Cost breakdown displays input/output/cached costs and total in USD and AI Credits
- [ ] Users can paste a prompt to estimate token count and cost
- [ ] Plan comparison view shows all 5 Copilot tiers with cost for configured usage
- [ ] Model comparison table allows sorting and filtering
- [ ] Visualizations use Recharts and match existing design language
- [ ] Mobile-responsive layout
- [ ] All calculations update reactively as inputs change

## References

- [Models and pricing for GitHub Copilot](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing)
- [Usage-based billing for individuals](https://docs.github.com/en/copilot/managing-copilot/managing-copilot-as-an-individual-subscriber/usage-based-billing-for-github-copilot)
- [Usage-based billing for organizations and enterprises](https://docs.github.com/en/copilot/managing-copilot/managing-copilot-for-your-enterprise/usage-based-billing-for-github-copilot)
