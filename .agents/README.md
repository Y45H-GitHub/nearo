---
purpose: Entry point for any AI agent (Claude Code, Codex, or otherwise) joining this repo cold. Read this first, then follow the links — do not start writing code without reading the linked PRD and current phase status.
---

# Agent Orientation — Nearo

Nearo is a peer-to-peer local rental marketplace MVP (Airbnb + Facebook Marketplace + Uber
mechanics, no owned inventory). If you are an agent picking up this repo without prior
conversation history, read in this order:

1. **[/specs/prd.md](../specs/prd.md)** — what we're building and why.
2. **[/specs/mvp-scope.md](../specs/mvp-scope.md)** — the exact in/out line. If a feature isn't
   marked ✅ here, it is not MVP work unless the user explicitly asks for the fast-follow.
3. **[/decisions/](../decisions/)** — every non-obvious business or architecture call, as
   individually-numbered ADRs. Each one exists because a hidden assumption would otherwise have
   been invented. If you're about to make a similar call (money, trust, cancellation, mocked
   integrations), check whether an ADR already answers it before deciding yourself.
4. **[/knowledge/business-rules.md](../knowledge/business-rules.md)** — the single source of truth
   for rule *values* (fee %, deposit conditions, verification requirements). Code and docs should
   reference this file, not restate the rules inline.
5. **[/knowledge/glossary.md](../knowledge/glossary.md)** — shared vocabulary. Use these exact
   terms; don't introduce synonyms.
6. **[/tasks/](../tasks/)** — execution-phase tracking (created once implementation phases begin).

## How this repo is organized

| Directory | Responsibility |
|---|---|
| `/.agents/` | How AI agents should operate in this repo (this file, and any future agent-specific process docs). |
| `/docs/` | Human-facing setup/operational docs (getting started, deployment, environment config). |
| `/specs/` | What we're building: PRD, information architecture, user flows, wireframes, API design, folder structure, design tokens. One deliverable per phase, one file (or small file-set) per deliverable. |
| `/knowledge/` | Durable facts about the domain and the rules that govern it: glossary, business rules. Not phase-specific — these get updated in place as rules evolve. |
| `/decisions/` | ADRs — numbered, dated, immutable once accepted (superseded by a new ADR, never edited to reverse a decision). |
| `/tasks/` | Active implementation task breakdowns once building starts. |

## Operating rules for this project (do not violate)

- **Never invent a business rule.** If a decision affects money, trust/verification, cancellation,
  or data ownership and isn't already answered in `/decisions/` or `/knowledge/business-rules.md`,
  stop and ask the user — do not assume a default and proceed.
- **Never skip planning phases.** The deliverable order in
  [prd.md § Roadmap](../specs/prd.md#12-roadmap-deliverable-order) is sequential. Don't jump ahead
  to code because it seems obvious — later deliverables (schema, API design) depend on earlier
  ones being settled.
- **Build in phases, not all at once.** Each phase is reviewed with the user before the next
  starts. Don't pre-generate downstream deliverables "to save time."
- **Don't overengineer the MVP.** If `/specs/mvp-scope.md` marks something 🔜 or ❌, don't build it
  "while you're in there." Fast-follow items should still be *designed for* (interfaces,
  extensible schema) per the relevant ADR, but not implemented.
- **One responsibility per doc.** When adding new knowledge, prefer a new focused file over
  growing an existing one into a catch-all. Link between files with relative paths instead of
  duplicating content.
- **Update, don't silently diverge.** If implementation reveals an ADR or business rule is wrong,
  raise it with the user, then update the source doc — don't let code and docs drift apart.
