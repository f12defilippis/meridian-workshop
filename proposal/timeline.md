# Timeline

**RFP #:** MC-2026-0417 — Inventory Dashboard Modernization

---

## Delivery Plan Overview

Engagement duration: **8 weeks** from contract signature, organized in four phases. Each phase ends with a milestone review with the Meridian team.

Assumed start date: **May 19, 2026** (subject to contract finalization).

---

## Phase 1 — Onboarding & Architecture Review (Weeks 1–2)

**May 19 – May 30**

| Activity | Deliverable |
|---|---|
| Full codebase analysis and architecture review | Current-state architecture document (R4) |
| Map all user flows and classify by criticality | Test coverage plan for IT review |
| Set up Playwright test framework and CI scaffold | Working test infrastructure |
| Identify all Reports module defects | Defect register with severity classification |

**Milestone:** Architecture document delivered to Meridian IT. Defect register reviewed with operations team. Test plan approved.

---

## Phase 2 — Reports Remediation (Weeks 3–4)

**June 2 – June 13**

| Activity | Deliverable |
|---|---|
| Fix all identified Reports defects (filters, i18n, console errors, API patterns) | Fully functional Reports module (R1) |
| Write E2E tests for Reports flows | Automated test coverage for Reports |
| Write E2E tests for existing Dashboard, Inventory, and Orders flows | Expanding test suite (R3 — partial) |

**Milestone:** Reports module sign-off with operations team. Test suite demo for IT team.

---

## Phase 3 — Restocking Feature (Weeks 5–7)

**June 16 – July 3**

| Activity | Deliverable |
|---|---|
| Design and implement restocking recommendation API | Backend engine with deficit-scoring algorithm |
| Build Restocking view (budget input, recommendation table, manual adjustments) | New frontend view (R2) |
| Operator feedback session (end of Week 6) | Refinements based on real-user input |
| Write E2E tests for Restocking and remaining flows | Complete test suite (R3) |

**Milestone:** Restocking feature demo with operations team. Full E2E test suite delivered and reviewed with IT.

---

## Phase 4 — Enhancements & Handoff (Week 8)

**July 7 – July 11**

| Activity | Deliverable |
|---|---|
| UI modernization — apply new design system across all views | Refreshed interface (D1) |
| Extend i18n to all modules, deliver JA locale | Full internationalization (D2) |
| Implement dark mode with operator toggle | Theme selection (D3) |
| Final architecture document update | Updated documentation (R4 — final) |
| Handoff session with Meridian IT | Knowledge transfer complete |

**Milestone:** Final delivery review. All deliverables accepted. Handoff complete.

---

## Summary

| Phase | Weeks | Primary Deliverables |
|---|---|---|
| 1 — Onboarding & Architecture | 1–2 | R4 (architecture docs), test plan, defect register |
| 2 — Reports Remediation | 3–4 | R1 (reports fixed), R3 (partial test suite) |
| 3 — Restocking Feature | 5–7 | R2 (restocking view), R3 (complete test suite) |
| 4 — Enhancements & Handoff | 8 | D1 (UI refresh), D2 (i18n), D3 (dark mode), final handoff |

All required items (R1–R4) are delivered by the end of Week 7. Week 8 is dedicated to desired items and clean handoff, providing a buffer if any required work needs additional refinement.
