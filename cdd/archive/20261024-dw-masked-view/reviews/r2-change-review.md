# R2 package review — 20261024-dw-masked-view — 2026-10-25 — reviewer: cold sub-agent

- Model: `opencode-zen/gpt-6-luna`
- Family: `opencode-zen` (author: `zai/glm-5.3`, family `zai`; different family)
- Pinned commit: `c766f0fd7269bc0d52935c4802a4570226e98d1d`
- Scope: `cdd/changes/20261024-dw-masked-view/proposal.md`, `tasks.md`, `specs/gherkin/spec.md`, `cdd/specs/gherkin/spec.md` (the modified requirement), and `cdd/rules.md`; no `design.md` exists per the gate record.

| severity | finding | evidence | disposition |
|---|---|---|---|
| should | The new scenario mixes an observable result with an implementation constraint: "with the masking taken from the validator's module in exactly 1 copy." Module placement and copy count are not externally observable contract behavior; keep the scenario focused on the count and retain the single-source invariant in implementation/task verification. | `cdd/changes/20261024-dw-masked-view/specs/gherkin/spec.md`, Requirement "cdd archive stamps a derived metrics file," scenario "The done-whens count matches the validator's masked view" | fixed: Then rewritten observable-only — the count stays, module-placement/copy-count clause dropped; the single-source invariant remains enforced by task 3.2's import pin |
| should | Task 1.1 is a tracked checkbox task but has no `verify by` check, contrary to the task format. Add an observable verification or express this as untracked context rather than a task. | `cdd/changes/20261024-dw-masked-view/tasks.md`, §1, task 1.1 | fixed: §1.1 converted to untracked orientation context pointing at the §2 gate record as its evidence |
| note | The duplicated count-pattern literal is an explicit, considered trade-off rather than an overlooked design choice: the design note records the rejected helper alternatives, and task 3.2 plans an acceptance pin for parity. The pin is not yet present because task 3.2 is unticked. | `cdd/changes/20261024-dw-masked-view/tasks.md`, §2 design note 1 and task 3.2 | won't-fix: intentional trade-off recorded at the gate; planned acceptance pin is the chosen enforcement |

## Counts: blocker 0, should 2, note 1

VERDICT: PROCEED