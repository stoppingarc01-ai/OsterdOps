# OsterdOps Real AI Provider Live Smoke Testing

## 1. Safety Guard & Opt-In Policy

To prevent accidental spend, phantom charges, or rate-limit consumption during regular local development and CI/CD pipelines, **live upstream provider calls are strictly opt-in**.

By default, `npm run test` executes against deterministic fakes and mocks.

---

## 2. Running Live Smoke Tests

To execute live smoke tests against real provider APIs:

```bash
# 1. Set environment variables
export OSTERDOPS_LIVE_PROVIDER_TESTS=true
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIza..."

# Optional custom test models
export OPENAI_TEST_MODEL="gpt-4o-mini"
export ANTHROPIC_TEST_MODEL="claude-3-5-haiku-20241022"
export GEMINI_TEST_MODEL="gemini-1.5-flash"

# 2. Run test suite
npm run test
```

---

## 3. Guarantees During Live Tests

- **Minimal Token Usage**: Prompts are constrained to 1-token responses (`max_tokens: 5`).
- **Zero Content Persistence**: Prompts and completions are discarded immediately after assertion.
- **Fail-Safe Execution**: Individual provider failures are clearly reported without breaking test suite execution.
