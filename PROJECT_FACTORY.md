# Project Factory Foundation

Roobens Finds uses a reusable project operating system designed to reduce repetitive work, catch errors before deployment, and keep human approval focused on decisions rather than mechanics.

## Core flow

Create -> Validate -> Secure -> Test -> Evidence/Freshness -> Build -> Human Gate -> Deploy -> Monitor -> Search/AI Index -> Measure -> Improve

## Hard automation rule

If a workflow is performed twice, ask whether it can be automated before performing it a third time.

## Foundation v1

Automated on pull requests and pushes to `main`:

- Type/lint validation
- Automated tests
- Production build validation
- Search/AI discovery readiness audit
- Secret scanning with Gitleaks
- Vulnerability and misconfiguration scanning with Trivy
- Production dependency audit with npm
- Weekly dependency update checks through Dependabot
- Automated dependency remediation when a verified patched release is available and the change can be safely validated through CI

## Human approval gates

Keep explicit human approval for:

- Production deployments that can materially affect users
- Destructive data changes
- Credential or security-policy changes
- Database migrations
- Published product verdicts, prices, affiliate claims, or unsupported factual claims
- Major architecture changes

## Discovery principles

Roobens Finds should be understandable by both humans and answer/search systems. Recommendation content should progressively support:

- Canonical entities and exact product/model names
- Structured data
- Clear use cases, tradeoffs, alternatives, and verdicts
- Source provenance
- `last_verified` freshness metadata
- Confidence/staleness rules
- Search indexing and AI-citation measurement

## Next phases

1. Clean already-tracked generated/dependency artifacts (`node_modules`, `dist`) from Git history/current tracking.
2. Add provenance and freshness schemas for recommendation data.
3. Add sitemap/robots/canonical/JSON-LD generation and validation.
4. Add deployment gates and rollback verification.
5. Add monitoring and search/AI visibility feedback loops.
