## 0) Project
- **Name:** SoloCorpTax
- **Internal codename:** SoloCorpTax
- **Region:** Canada (CRA T2)
- **Core idea:** AI-guided **T2 DIY Coach + minimal bookkeeping + cloud document vault for audit readiness** for ultra-simple solo corporations.
- **Hard boundary:** **This product does NOT file T2**. It generates a **Tax-Ready Pack** (PDF + CSV + step-by-step instructions) used with **CRA-certified T2 software** (MVP target: FutureTax/T2Express-style “interview” tools, via generic mapping + optional “FutureTax mode”).

---

## 1) Problem statement
Solo incorporated owners (especially software/IT contractors and newly incorporated dormant companies) want to file simple T2 returns themselves but:
- lack accounting knowledge and confidence,
- overpay accountants ($400–$1000) for nil/simple returns,
- use Excel or nothing for bookkeeping and have weak audit evidence organization,
- need a clear step-by-step path with guardrails to avoid complex cases.

---

## 2) Target users (MVP Personas)

### Persona A — Solo Software / IT Contractor
**Profile**
- 1 shareholder, no employees
- Service income only, low expense count
- May be GST/HST registered

**Complexity to handle (MVP)**
- Basic year-end P&L + simple balance items
- GST/HST simplified summary
- Shareholder loan simplified tracker
- PSB risk education (not determination)

**Explicitly out of scope (MVP)**
- Payroll/salary, T4/remittances
- Dividends/T5
- Multi-shareholder
- Inventory/product sales
- Rental holding corp logic
- Foreign income/taxes

---

### Persona B — New Corporation – No Activity (Nil Return)
**Profile**
- Incorporated, no revenue, maybe no bank account activity

**Complexity**
- Very low

---

## 3) Product outcomes (definition of “MVP done”)
A user can:
1. Create account and corporation profile (auto-filled from uploaded docs where possible).
2. Choose a path: **Nil** or **Active**.
3. Pass a **low-friction complexity gate** (soft gate; ideally inferred from documents/transactions + 2–3 confirmations).
4. Upload bank statement CSV (upload-first; no manual forms required except optional edits).
5. Auto-generate a transaction list; user reviews and fixes only exceptions.
6. Generate:
   - P&L totals by simple categories
   - shareholder loan balance
   - simplified GST/HST summary (if enabled)
   - PSB checklist result
7. Produce **Tax-Ready Pack** (PDF + CSV) + “How to enter these numbers” guide for a chosen CRA-certified software (generic + optional **FutureTax mode** in MVP).

**Success metric (MVP):**
- Nil return: export pack in < 10 minutes
- Active simple contractor: export pack in < 60 minutes after CSV upload
- Support burden: average < 3 clarifying interactions per user/year

---

## 4) Non-goals (hard boundaries)
- No T2 filing submission
- No replacement for tax software
- Not a full bookkeeping system (no payroll, inventory, AR/AP)
- No tax planning or legal advice
- No guarantee of audit outcome

---

## 5) Scope & eligibility rules (guardrails)

### 5.1 MUST BLOCK (out-of-scope)
If any are true, block and show “Hire an accountant” + reasons + handoff checklist:
- Employees or payroll remittances detected/declared
- Inventory/product sales
- More than 1 shareholder
- Foreign income / foreign taxes
- Rental property income inside corp
- Dividends paid OR salary paid (MVP safety choice)
- Transactions/month > 50 (optional: WARN in MVP, BLOCK if you want ultra-safe)

### 5.2 WARN (allowed but flagged)
- Assets purchased > $1,000 (may require depreciation/CCA)
- GST/HST registered (supported via simplified summary)
- High % “personal-looking” transactions (requires careful splits)

---

## 6) Key user journeys

### 6.1 Nil Return Journey (fast path)
1. Upload incorporation/registry docs (optional but recommended).
2. Choose **Nil return**.
3. Confirm 3 items:
   - Any bank account activity? (No/Yes)
   - Any expenses paid by corp? (No/Yes)
   - GST/HST account active? (No/Yes)
4. Generate Nil Return Pack + export PDF.

### 6.2 Active Contractor Journey (doc-first + upload-first)
1. Upload incorporation/registry docs (optional) to auto-fill corp profile.
2. Upload bank statement CSV (required).
3. System infers complexity signals → asks only **2–3 confirmations** if needed.
4. Auto-categorize transactions → user reviews “Needs review” queue.
5. Optional: enable GST/HST and ITC tags.
6. Generate Tax-Ready Pack and download.

---

## 7) Functional requirements (FR)

### FR-A) Authentication (no Cognito/Amplify)
- Email + password registration
- Login/logout
- Password reset via email
- JWT access token + refresh token
- Store refresh token hashes in DB

**Acceptance**
- User can register/login/reset password; cannot access other users’ data.

---

### FR-B) Company wizard (doc-first, fewer taps)
#### FR-B1) “Document checklist” shown before onboarding
Show a short checklist of what helps them finish faster:
- Incorporation/registry document (or Articles/Certificate)
- CRA BN confirmation (if available)
- GST/HST account number (if registered)
- Bank statement CSV for the fiscal year (or latest months)
- Optional: prior-year T2 (if any)

**Acceptance**
- Checklist is visible and skippable; encourages upload.

#### FR-B2) Upload corp registry doc to auto-fill profile
- Allow upload of PDF/JPG/PNG:
  - Certificate/Articles/registry doc
  - BN confirmation (optional)
- Extract fields (best-effort) to pre-fill:
  - legal name
  - incorporation date (optional)
  - province
  - BN (if present)
- **User must confirm extracted fields** (no silent auto-trust).

**MVP extraction approach**
- If PDF is text-based: parse text and attempt extraction.
- If scanned image: store the doc and ask user to confirm manually (OCR can be v2).

**Acceptance**
- Upload works; extracted values appear in a confirm form; user can edit.

#### FR-B3) Replace “7 taps” with “2–3 confirmations” whenever possible
- System tries to infer eligibility using:
  - uploaded corp doc fields
  - bank CSV patterns (payroll-like, inventory-like vendors, etc.)
- Ask only the minimal remaining questions:
  - “Any employees?” (only if uncertain)
  - “Any product/inventory sales?” (only if uncertain)
  - “Any dividends or salary paid?” (always ask explicitly for MVP safety)

**Acceptance**
- New user can finish onboarding with <= 3 questions in typical cases.

---

### FR-C) Eligibility gate (soft then hard)
- Soft gate: quick status shown after doc/CSV upload (“Looks simple”, “Needs 2 checks”, “Out of scope”).
- Hard gate: block if out-of-scope conditions confirmed.

**Acceptance**
- Correct routing SAFE/WARN/BLOCK; provides reasons and handoff checklist.

---

### FR-D) Transactions ingestion (upload-first, auto-list)
MVP methods (no manual form required):
1) Upload bank statement **CSV** (required for Active path)
2) Optional: upload additional CSVs for other accounts
3) Manual edit exists only for corrections (edit transaction fields + category), not for full manual creation.

CSV required columns:
- date
- description
- amount (positive/negative)

Optional:
- currency
- account_name

Features:
- Parse/import to database
- Duplicate detection (date + amount + normalized description)
- Create a transaction list automatically
- Basic enrichment:
  - normalize description
  - vendor keyword extraction

**Acceptance**
- User uploads file and sees the generated list without data entry.

---

### FR-E) Categorization & rules (review-first)
- Auto-suggest category using keyword rules
- User fixes only “Needs review”
- Bulk actions:
  - select multiple → set category
  - create a rule from a transaction (“always categorize vendor X as Y”)

Categories:
**Income**
- Service revenue

**Expenses**
- Software/subscriptions
- Office supplies
- Internet/phone
- Computer/equipment (flag possible asset)
- Meals (show 50% note)
- Professional fees
- Bank fees
- Travel
- Other

**Balance / non-P&L**
- Owner contribution
- Owner withdrawal
- Shareholder loan (due to/from shareholder)
- GST/HST collected
- GST/HST paid
- Transfers

**Acceptance**
- Uncategorized count can reach 0; rule creation works.

---

### FR-E2) Personal vs corporate spending (education + fixing tools)
**Goal:** educate users to keep business and personal spending separate, and provide tools to correct mistakes when they happen.

#### FR-E2.1 Education and prevention nudges
- Show a short “Golden Rules” card in onboarding and in Transactions:
  - “Avoid paying personal expenses with corporate card/bank.”
  - “Avoid paying corporate expenses with personal card.”
  - “If it happens, categorize correctly and track reimbursements/loan balance.”
- When the system detects likely personal spending on a corporate account, show a non-blocking prompt:
  - “This looks personal. Mark as personal / owner withdrawal?”
- When the system detects likely corporate spending on a personal account (if user uploads personal account CSV), show:
  - “This looks business. Mark as owner contribution / reimbursable?”

#### FR-E2.2 Detection (heuristics, not perfect)
- Flag transactions as “possible personal” when vendor/keywords match a configurable list (MVP seed list), e.g.:
  - grocery, dining, clothing, streaming, pharmacy, personal utilities
- Flag “possible business paid personally” when vendor/keywords match business list:
  - cloud software, dev tools, hosting, SaaS, professional memberships
- Provide confidence level: HIGH/MED/LOW based on rule match strength.
- Always allow user override.

#### FR-E2.3 Fixing tools (what user can do)
For each flagged or selected transaction, user can set one of these “Treatment” options:
1) **Business expense paid by corporation** → normal expense category.
2) **Personal expense paid by corporation** → categorize as:
   - Owner withdrawal **OR**
   - Shareholder loan “Due from shareholder” (MVP: map to Owner withdrawal and reflect in shareholder loan report).
3) **Business expense paid personally** → categorize as:
   - Owner contribution **OR**
   - Reimbursable by corporation (MVP: map to Owner contribution and reflect in shareholder loan report).
4) **Split transaction** (MVP optional):
   - Allow user to split one transaction into two lines with different treatments (e.g., 70% business / 30% personal).

#### FR-E2.4 Reimbursement workflow (MVP-light)
- Provide a simple “Reimbursements” view (can be part of Shareholder Loan page):
  - list of “business paid personally” items (owner contributions) suggested for reimbursement
  - list of “personal paid by corporation” items (owner withdrawals) suggested to repay
- Allow user to mark an item “Settled” when they transfer money back/forth.
- Settled status is informational; it does not change historical transactions (unless user edits).

#### FR-E2.5 Reporting impact
- Personal expenses paid by corporation must **NOT** appear in business expense totals (P&L).
- Business expenses paid personally should appear in P&L as expense, with offset via owner contribution (or shareholder loan impact) according to your simplified model.
- Shareholder loan report must incorporate these treatments and show warnings at year-end.

**Acceptance**
- System flags likely personal/business-mixed transactions, user can correct via one-click treatment, and exports reflect corrected P&L and shareholder loan balance.

### FR-F) GST/HST (simplified + reminders)
If GST enabled:
- Configure:
  - GST/HST registered yes/no
  - rate selection (5% GST, 13% HST, etc.)
  - filing frequency
  - filing period end date (optional)
- Tag:
  - income: taxable/exempt (default taxable)
  - expense: ITC eligible yes/no (default yes for typical business purchases)

Outputs:
- taxable sales estimate
- tax collected estimate
- ITCs estimate
- net tax estimate
- **Reminder guidance** (education only):
  - show next filing due date logic based on frequency (user confirms period dates)

**Acceptance**
- GST summary exports; reminders are visible as informational guidance.

---

### FR-G) Shareholder loan tracker (simplified)
- Uses “Owner contribution/withdrawal” categories to compute:
  - Due to shareholder
  - Due from shareholder
- Warning if year-end “due from shareholder” is positive.

**Acceptance**
- Balances computed and included in export.

---

### FR-H) PSB risk education (not determination)
- Checklist and output “low/medium/high” with educational text + recommendation to consult CPA for medium/high.

**Acceptance**
- Checklist completes; output shown in pack.

---

### FR-I) Salary vs dividend handling (MVP safety)
- Explicit question:
  - “Did you pay salary this year?”
  - “Did you pay dividends this year?”
- If yes to either → BLOCK and produce handoff checklist.

**Acceptance**
- Blocks unsupported cases.

---

### FR-J) Tax-Ready Pack + “FutureTax mode” instructions
Generate:
- P&L totals by category
- Balance summary: cash, shareholder loan, GST payable/receivable estimate (if enabled)
- “Tax form line mapping” (basic GIFI mapping)
- “How to enter” instructions:
  - Generic CRA-certified software guidance
  - MVP optional: **FutureTax mode** mapping steps (text-only in MVP; screenshots later)

Export:
- PDF (summary + checklists + warnings)
- CSV: P&L
- CSV: mapping
- Store exports in S3; provide download links.

**Acceptance**
- Exports download; totals match underlying transactions.

---

### FR-K) Document vault (audit readiness)
- Upload and store:
  - corp registry docs
  - bank CSV
  - generated exports
  - optional receipts (MVP optional; can be v2)
- Tag documents by year/type
- Allow user download anytime

**Acceptance**
- User can upload/view/download docs.

---

### FR-L) Payments and entitlements (MVP)
**Payment processor:** Stripe (recommended for speed)

Payment models (pick 1 for MVP):
- Option 1: **Annual subscription**
- Option 2: **Per-filing-year purchase** (good for nil return users)

Requirements:
- Pricing plans in Stripe
- Stripe Checkout redirect
- Webhook handler:
  - `checkout.session.completed`
  - `invoice.payment_succeeded` (if subscription)
  - `customer.subscription.updated/deleted`
- Entitlements stored in DB:
  - plan type
  - active status
  - current period start/end
- Gating:
  - onboarding and uploads allowed
  - **Export Pack requires active payment** (or allow 1 free sample export with watermark)

**Acceptance**
- Payment activates access; webhook updates entitlement; export gating enforced.

---

## 8) Non-functional requirements (NFR)
- HTTPS (TLS) in transit
- S3 encryption at rest (SSE-S3 OK for MVP)
- Multi-tenant isolation
- Basic audit log for transaction edits
- Performance: <= 5k transactions/company/year
- Clear disclaimers; no tax advice

---

## 9) AWS architecture (EC2-first, no ECS/ECR, no Secrets Manager in MVP)

### 9.1 Compute
- **Backend API on EC2** (Ubuntu)
  - pure js expressjs backend, no typescript, consider cors issue
  - run as systemd service: `solocorptax-api`
  - reverse proxy via Nginx
- **Worker on same EC2** (optional MVP)
  - systemd service: `solocorptax-worker`
  - job queue options:
    - simplest: DB job table + polling worker for now
    - optional: SQS + worker on EC2 in future

### 9.2 Frontend hosting
- react javascript + redux toolkit + @radix-ui
- Next.js static export → S3 + CloudFront

### 9.3 Data + files
- **Neon Postgres** (managed PostgreSQL)
- S3 for uploads/exports/vault documents
- CloudWatch logs optional

### 9.4 Auth
- Self-managed JWT auth
- need to support google login and email/password login
- should be able to merge account if google login email and email/password login are the same.
---

## 10) Secrets handling (MVP)
**No Secrets Manager.** Use:
- dot env should be used for Backend
- EC2 environment file (e.g., `/etc/solocorptax.env`, root-only permissions)
- systemd `EnvironmentFile=...`
- Store: DB URL/password, JWT secret, Stripe keys, SMTP credentials

---

## 11) Deployment pipeline (Jenkins local, manual infra setup)
- CloudFront distributions and Nginx configuration are created **manually** (one-time).
- Jenkins stages:
  1) Lint + unit tests
  2) Build frontend → upload to S3 + invalidate CloudFront
  3) Build backend artifact (zip) and SSH upload to EC2 (or git pull)
  4) Run DB migrations
  5) Restart systemd services
  6) Smoke test `/health`

---

## 12) Data model additions (payments)
- database should use db-migrate lib and sqls to be use in dbeaver later

### subscriptions (entitlements)
- id
- user_id
- stripe_customer_id
- stripe_subscription_id (nullable for one-time)
- plan_code
- status (ACTIVE, PAST_DUE, CANCELED)
- current_period_start
- current_period_end
- created_at

### payments_events (optional)
- id
- stripe_event_id (unique)
- type
- payload_json
- created_at

---

## 13) API additions (payments)
- POST /billing/create-checkout-session
- POST /billing/webhook
- GET /billing/status

---

## 14) Build plan (updated)
### Phase 1 (core)
1) Auth + company profile (with doc upload + confirm)
2) Upload bank CSV → auto transaction list
3) Auto-categorization + “Needs review” queue + bulk categorize + rules
4) Summary report
5) Export pack generation (PDF/CSV) + S3 storage

### Phase 2 (guardrails + differentiators)
6) Eligibility hard gate (doc+CSV inference + minimal confirmations)
7) Shareholder loan + PSB checklist + GST simplified
8) Document vault indexing

### Phase 3 (monetization)
9) Stripe Checkout + webhook + entitlements
10) Export gating

---

## 15) Acceptance tests (must pass)
- Nil return pack exports without transactions.
- Upload-only flow: user can finish without manual transaction entry.
- Doc upload pre-fills profile; user confirms.
- Eligibility blocks employees/inventory/multi-shareholder/dividends/salary.
- Export pack downloads; totals match.
- Stripe payment activates export access; webhook updates status.

---

## 16) Copy & disclaimers
- “Educational guidance only; not legal/tax advice.”
- “You must verify accuracy before filing.”
- “If you have employees, inventory, multiple shareholders, foreign income, salary/dividends, or rental income in the corporation, consult a CPA.”
