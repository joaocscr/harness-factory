# Module 0: Intake, Your Field

## Core Idea

Every harness, whether it produces design tokens, contracts, financial reports, support replies, or code, has the same underlying structure: context, roles, tools, sequence, guards, quality criteria, visibility.

The structure stays the same across fields; the **content** that fills each slot is what changes. Before Module 1 starts, you need enough about the person's field to fill the generic placeholders in the following modules with real terms.

The intake's job is to prepare the ground for the seven core modules that follow, not to produce an artifact of its own.

## Questions For You

Ask these in 2-3 groups, not all at once. Keep it as light as a conversation, not a form.

**Group 1: What comes out of this?**
- What should the harness ultimately produce? (Code, text, decisions, data, documents, designs …)
- Who uses that result, and for what? (Another team? Customers? A downstream system?)
- What's a good example of a typical task the harness should eventually handle? (A concrete, real one, not wishful thinking)

**Group 2: What holds true in this field?**
- What's the source of truth? A tool, a repository, a document, a system: where does the current, authoritative state live?
- What recurring building blocks/categories exist? (In a design system: token categories. In legal: contract clauses. In finance: account categories. What's the equivalent here?)
- What naming or structure convention is already in use, or should be?
- What language is used for names, comments, documentation?

**Group 3: What must never happen, and who works on what?**
- What must an agent in this field **never** do? (The hardest, non-negotiable rules; even if there's only one, this is the single most important sentence in the whole intake)
- What different work steps/roles normally exist when a human does this work? (This becomes the blueprint for the roles in Module 2)
- How do you recognize good work in this field, and bad work? What would an experienced person in this field immediately flag as a mistake?
- What tools/systems does the agent need access to? (A design tool, a code repo, a database, an external API …)

## What Gets Built

The answers don't produce a standalone artifact, but instead:
- A **project name/slug** (e.g. `legal-review-harness`, `support-macro-harness`)
- A **one-sentence goal**, which lands in `CURRICULUM.md`, following the pattern: *"A system of agents, rules, tools, and guards that reliably turns [input] into [output], without [person] having to steer every step themselves."*
- A first `CURRICULUM.md`, following `templates/CURRICULUM.template.md`, with the goal sentence and modules 1-8 marked ⬜

## Notes For Running This

- If answers stay vague ("automate everything somehow"), dig deeper using the concrete example from Group 1. Abstract answers become concrete once you walk through a real case.
- If the person already has an existing, informal workflow (even without AI), ask about it explicitly. It's often the best source for roles and sequence in Module 4.
- If "what must never happen" comes up empty, push: "What would be the most embarrassing/costly mistake an agent could make here?" Almost every field has at least one answer to that.
- Note down the exact terms the person uses, not your own rephrasings. You'll want to carry those 1:1 into the `AGENTS.md` in Module 1.
