# Technical Approach

**RFP #:** MC-2026-0417 — Inventory Dashboard Modernization

---

## Overview

Our technical approach addresses each requirement in Meridian's priority order. For every item, we describe the work, the methodology, and the assumptions derived from our clarifying questions with Meridian's procurement team.

The existing system is a Vue 3 + FastAPI application with JSON-based data storage. Our approach preserves the current architecture while systematically resolving defects, adding capabilities, and establishing the test and documentation foundation Meridian's IT team requires.

---

## Required Items

### R1 — Reports Module Remediation

**Objective:** Identify and resolve all defects in the Reports module.

**Approach:**

We will conduct a full audit of the Reports module codebase — both frontend (Vue components, computed properties, filter bindings) and backend (API endpoints, data filtering, response schemas). The audit will cover:

- **Filter behavior:** Verify that all four filters (Time Period, Warehouse, Category, Order Status) are correctly wired to the Reports API and that filter combinations produce accurate results.
- **Internationalization gaps:** Identify hardcoded strings, missing locale keys, and formatting inconsistencies (dates, numbers, currencies) across the EN/JP locales.
- **Console errors:** Trace and resolve any runtime warnings or errors in browser developer tools.
- **API pattern inconsistencies:** Ensure the Reports endpoints follow the same request/response conventions as the rest of the application (query parameter naming, error handling, response structure).
- **Data integrity:** Validate that displayed data matches source data under all filter states, including edge cases (empty results, single-warehouse, all-categories).

Each defect will be documented, fixed, and verified with an automated test before closure.

**Assumption:** Meridian does not maintain a specific defect list. Our audit is responsible for discovering and resolving all issues present in the module.

---

### R2 — Restocking Recommendations

**Objective:** Deliver a new Restocking view that recommends purchase orders based on stock levels, demand forecasts, and an operator-supplied budget ceiling.

**Approach:**

We will design and implement a new view consisting of:

1. **Backend recommendation engine** — A new API endpoint that accepts a budget ceiling and returns prioritized restocking recommendations. The algorithm will:
   - Compare current stock levels against demand forecasts to calculate a deficit score per SKU
   - Rank items by urgency (highest deficit relative to forecast demand)
   - Allocate budget top-down by priority until the ceiling is reached
   - Return a proposed purchase order with quantities, estimated costs, and supplier references

2. **Frontend Restocking view** — A new page in the dashboard that allows operators to:
   - Set a budget ceiling via an input control
   - View the recommended purchase order as a sortable, filterable table
   - Adjust quantities manually and see the budget impact in real time
   - Filter by warehouse and category to focus on specific segments
   - Export or review the final recommendation before action

3. **Integration with existing data** — The recommendation engine will consume the same inventory, demand, and spending data already available through the existing API, ensuring consistency with what operators see in other views.

**Assumption:** Meridian's operations team has full flexibility on the restocking algorithm. We will propose the deficit-scoring approach described above and refine it during Phase 3 based on operator feedback.

---

### R3 — Automated Browser Testing

**Objective:** Establish end-to-end test coverage for critical user flows.

**Approach:**

We will use **Playwright** as the E2E testing framework — it supports all major browsers, runs headless for CI environments, and integrates well with the existing Vue/Vite toolchain.

Our process:

1. **Flow identification** — Analyze the full codebase (views, routes, API interactions) to map all user flows. Classify each as critical, important, or supplementary based on operational impact and usage frequency.

2. **Test suite design** — Write E2E tests covering all critical flows, including:
   - Dashboard loading and summary data accuracy
   - Inventory browsing with filter combinations
   - Order tracking and status filtering
   - Spending analysis views
   - Reports module (post-remediation)
   - Restocking view (new feature)

3. **CI readiness** — Structure the test suite so it can be integrated into a CI/CD pipeline. Tests will run against a local dev server and produce clear pass/fail output with screenshots on failure.

**Assumption:** Meridian's IT team does not prescribe specific flows to test. We will perform a thorough codebase analysis to identify and prioritize critical paths, and deliver the rationale alongside the test suite.

---

### R4 — Architecture Documentation

**Objective:** Deliver a current-state architecture overview suitable for handoff to Meridian IT.

**Approach:**

We will produce an interactive HTML architecture document that includes:

- **System overview** — High-level diagram showing frontend, backend, data layer, and their interactions
- **Component map** — Vue component hierarchy with data flow annotations
- **API reference** — All endpoints, parameters, and response schemas
- **Data model** — Structure of the JSON data files and how they relate to each other
- **Deployment notes** — How to run, build, and maintain the application

This will be generated during Phase 1 (onboarding) and updated throughout the engagement as changes are made. The format is a self-contained HTML file that Meridian IT can open in any browser — no special tooling required.

**Assumption:** The previous vendor's handoff documentation is incomplete. Our architecture review starts from the source code, not from existing docs.

---

## Desired Items

### D1 — UI Modernization

**Objective:** Refresh the visual design to deliver a modern, professional interface befitting an industrial automation leader.

**Approach:**

Meridian does not have an existing design system, so we will establish one as part of this work:

- **Visual identity** — A design language inspired by the precision and reliability of industrial automation: clean lines, confident typography, a sophisticated color palette that balances professionalism with visual clarity for data-dense screens.
- **Component library** — Standardized UI components (cards, tables, charts, filters, navigation) built on the new design tokens, ensuring visual consistency across all views.
- **Data visualization** — Refreshed charts and graphs with improved readability, better use of color to convey status and priority, and responsive layouts that work across screen sizes.
- **Responsive design** — Ensure the dashboard performs well on warehouse floor tablets as well as desktop monitors.

The goal is an interface that makes a strong visual impression ("wow factor") while remaining functional and fast for daily operational use.

**Assumption:** We have creative freedom on the visual direction. We will present a design concept for approval before applying it across the application.

---

### D2 — Internationalization

**Objective:** Extend i18n support to all modules so Tokyo warehouse staff can work in Japanese.

**Approach:**

- Audit all views for hardcoded strings and extract them to locale files
- Extend the existing i18n infrastructure (if partial) or implement vue-i18n across all modules
- Cover not just labels but also date formats, number formats, and currency display (JPY, USD, GBP)
- Deliver a complete JA locale file and verify with representative screens

**Assumption:** Primary languages are English (default) and Japanese. Additional locales can be added later using the same infrastructure.

---

### D3 — Dark Mode

**Objective:** Provide an operator-selectable dark theme for low-light warehouse environments.

**Approach:**

- Implement a theme toggle (light/dark) accessible from the dashboard header
- Define dark mode design tokens that maintain readability and contrast ratios (WCAG AA minimum)
- Ensure all charts, tables, and data visualizations adapt correctly to the dark palette
- Persist the user's preference in local storage so it carries across sessions

**Assumption:** Dark mode is a visual theme only — no functional differences between light and dark mode.
