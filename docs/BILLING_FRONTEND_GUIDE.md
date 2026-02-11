# Billing & Plan Management — Frontend Integration Guide

## Table of Contents
- [Plan Tiers](#plan-tiers)
- [Store Lifecycle & Plan Fields](#store-lifecycle--plan-fields)
- [API Endpoints](#api-endpoints)
- [Upgrade Flow](#upgrade-flow)
- [Downgrade Flow (Cooldown System)](#downgrade-flow-cooldown-system)
- [Cancel Downgrade Flow](#cancel-downgrade-flow)
- [Checkout Flow (Stripe)](#checkout-flow-stripe)
- [Error Codes & HTTP Status Reference](#error-codes--http-status-reference)
- [UI State Machine](#ui-state-machine)
- [Response Schemas](#response-schemas)
- [Worked Examples](#worked-examples)

---

## Plan Tiers

| Plan | Price | Rank | Limits |
|------|-------|------|--------|
| `free` | $0/mo | 0 | 1 store per tenant |
| `starter` | per-seat/mo | 1 | Unlimited stores |
| `pro` | per-seat/mo | 2 | Unlimited stores |

**Direction rules:**
- **Upgrade** = moving to a higher rank (e.g. `free→starter`, `starter→pro`, `free→pro`)
- **Downgrade** = moving to a lower rank (e.g. `pro→starter`, `pro→free`, `starter→free`)

---

## Store Lifecycle & Plan Fields

Every store has these billing-related fields:

| Field | Type | When Present | Description |
|-------|------|--------------|-------------|
| `billing_plan` | `"free" \| "starter" \| "pro"` | Always | The **current active** plan. This is what determines feature access. |
| `pending_plan` | `"free" \| "starter" \| "pro"` or `null` | Only during scheduled downgrade | The plan the store **will move to** at the next billing cycle. |
| `downgrade_effective_at` | ISO 8601 string or `null` | Only during scheduled downgrade | The date/time when `pending_plan` takes effect (matches Stripe billing period end). |
| `plan_activated_at` | ISO 8601 string or `null` | After any plan change | Timestamp of when the current `billing_plan` was activated. |

### Key Principle
> **`billing_plan` is the source of truth for feature access.** The `pending_plan` is informational — it tells the user "your plan will change on this date" but does NOT restrict features until it actually applies.

---

## API Endpoints

### 1. Create Store
```
POST /v0/store
Header: X-Tenant-Id: {tenantId}
```

**Request:**
```json
{
  "store_id": "store-001",
  "store_name": "My Store",
  "billing_plan": "starter",
  "currency": "USD",
  "locale": "en-US",
  ...
}
```
- `billing_plan` is optional. Defaults to `"free"` if omitted.

**Possible Responses:**

| HTTP | Condition | Action |
|------|-----------|--------|
| `201` | Store created successfully | Show store details |
| `402` | Paid plan requested but no Stripe subscription exists | Redirect user to `checkout_url` (see [Checkout Flow](#checkout-flow-stripe)) |
| `409` | Free plan requested but tenant already has 1 free store | Show "free plan limit reached" message, prompt to upgrade |
| `400` | Invalid request body / validation error | Show validation errors |

---

### 2. Change Store Plan
```
PUT /v0/store/:storeId/plan
Header: X-Tenant-Id: {tenantId}
```

**Request:**
```json
{
  "billing_plan": "starter"
}
```
Valid values: `"free"`, `"starter"`, `"pro"`

**Possible Responses:**

| HTTP | Condition | Body Shape | Frontend Action |
|------|-----------|------------|-----------------|
| `200` | Upgrade applied immediately | `ChangeStorePlanResponse` with `downgrade_scheduled: false` | Show success, refresh store data |
| `200` | Downgrade scheduled | `ChangeStorePlanResponse` with `downgrade_scheduled: true` | Show banner: "Your plan will change to X on Y" |
| `200` | Pending downgrade cancelled (user picked current plan) | `ChangeStorePlanResponse` with `downgrade_scheduled: false` | Show "downgrade cancelled" confirmation |
| `402` | Upgrade requires checkout (no subscription yet) | `ChangeStorePlanResponse` with `checkout_required: true` + `checkout_url` | Redirect to `checkout_url` |
| `409` | Downgrade to free denied (free limit reached) | Error with code `3032` | Show "you already have a free store" message |
| `409` | Store is not active | Error with code `3031` | Show "store is inactive" message |
| `400` | Invalid plan value | Error | Show validation error |
| `404` | Store not found | Error with code `3001` | Show "store not found" |

---

### 3. Create Checkout Session
```
POST /v0/billing/checkout-session
Header: X-Tenant-Id: {tenantId}
```

**Request:**
```json
{
  "success_url": "https://app.example.com/billing/success",
  "cancel_url": "https://app.example.com/billing/cancel"
}
```

**Response (200):**
```json
{
  "checkout_session_id": "cs_abc123",
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_abc123..."
}
```

---

### 4. List Stores
```
GET /v0/store
Header: X-Tenant-Id: {tenantId}
```

**Response (200):**
```json
{
  "stores": [
    {
      "tenant_id": "tenant-001",
      "store_id": "store-001",
      "status": "active",
      "billing_plan": "pro",
      "pending_plan": "starter",
      "downgrade_effective_at": "2026-03-15T00:00:00Z",
      "store_name": "Downtown Location",
      "location_type": "retail",
      "description": "Main retail store",
      "address": { "city": "New York", "state": "NY" }
    }
  ],
  "size": 1,
  "next": null
}
```

> Note: `pending_plan` and `downgrade_effective_at` are only present when a downgrade is scheduled. Use these to show downgrade banners in the store list UI.

---

### 5. Get Store Detail
```
GET /v0/store/:storeId
Header: X-Tenant-Id: {tenantId}
```

Returns the full `Store` object including `billing_plan`, `pending_plan`, `downgrade_effective_at`, and `plan_activated_at`.

---

## Upgrade Flow

Upgrades apply **immediately** with proration. The user's Stripe invoice is adjusted right away.

```
User clicks "Upgrade to Pro"
        │
        ▼
  PUT /v0/store/:storeId/plan { "billing_plan": "pro" }
        │
        ├── HTTP 200 ──────────────────────────────────────┐
        │   {                                              │
        │     "store": { ... billing_plan: "pro" },        │
        │     "checkout_required": false,                  │
        │     "downgrade_scheduled": false                 │
        │   }                                              │
        │   ✅ Show success toast                          │
        │   ✅ Refresh store data (plan is now "pro")      │
        │   ✅ If store had a pending downgrade, it's      │
        │      automatically cleared                       │
        │                                                  │
        ├── HTTP 402 ──────────────────────────────────────┐
        │   {                                              │
        │     "store": { ... billing_plan: "free" },       │
        │     "checkout_required": true,                   │
        │     "checkout_url": "https://checkout.stripe..." │
        │   }                                              │
        │   ⚠️ Redirect user to checkout_url               │
        │   ⚠️ Plan is NOT changed yet                     │
        │   ⚠️ After checkout completes, retry the         │
        │      plan change                                 │
        │                                                  │
        └──────────────────────────────────────────────────┘
```

### After Checkout Completion
When the user returns from Stripe Checkout to your `success_url`:
1. The backend processes a Stripe webhook (`checkout.session.completed`) automatically.
2. **Wait 2-3 seconds** for webhook processing, then retry the `PUT /v0/store/:storeId/plan` call.
3. This time it should return `200` since the subscription now exists.

---

## Downgrade Flow (Cooldown System)

Downgrades are **NOT immediate**. They are scheduled to take effect at the end of the current billing cycle. The user keeps full access to their current plan until then.

```
User clicks "Downgrade to Starter"
        │
        ▼
  PUT /v0/store/:storeId/plan { "billing_plan": "starter" }
        │
        ▼
    HTTP 200
    {
      "store": {
        "billing_plan": "pro",              ← STILL PRO (not changed yet)
        "pending_plan": "starter",          ← will become "starter"
        "downgrade_effective_at": "2026-03-15T00:00:00Z"
      },
      "checkout_required": false,
      "downgrade_scheduled": true,          ← KEY FLAG
      "pending_plan": "starter",
      "downgrade_effective_at": "2026-03-15T00:00:00Z"
    }
```

### What to show in the UI

When `downgrade_scheduled: true`:

1. **Banner/Notice:** _"Your store plan will change from **Pro** to **Starter** on **March 15, 2026**. You'll continue to have Pro features until then."_
2. **Cancel button:** _"Keep Pro Plan"_ — sends `PUT /v0/store/:storeId/plan { "billing_plan": "pro" }` (current plan) to cancel the downgrade.
3. **Plan selector:** Show the current plan as "Pro" (active), with "Starter" marked as "Scheduled".

### When the downgrade applies
At the start of the next billing cycle, the backend automatically:
1. Changes `billing_plan` from `pro` to `starter`
2. Clears `pending_plan` and `downgrade_effective_at`
3. Updates Stripe quantities (no proration — new cycle, new rate)

This happens via Stripe's `invoice.paid` webhook — **no frontend action needed.**

---

## Cancel Downgrade Flow

To cancel a scheduled downgrade, the user requests the **same plan they currently have**:

```
Store is currently: billing_plan="pro", pending_plan="starter"

User clicks "Keep Pro Plan"
        │
        ▼
  PUT /v0/store/:storeId/plan { "billing_plan": "pro" }
        │
        ▼
    HTTP 200
    {
      "store": {
        "billing_plan": "pro",
        "pending_plan": null,                ← cleared
        "downgrade_effective_at": null       ← cleared
      },
      "checkout_required": false,
      "downgrade_scheduled": false           ← no longer scheduled
    }
```

Show a confirmation toast: _"Downgrade cancelled. Your store will stay on the Pro plan."_

---

## Checkout Flow (Stripe)

This flow is triggered when a user tries to create a paid store or upgrade to a paid plan but has **never set up payment** (no Stripe subscription).

```
┌──────────────┐     402 + checkout_url     ┌─────────────────┐
│  Your App    │ ◄────────────────────────── │  Backend API    │
│  (Frontend)  │                             │                 │
└──────┬───────┘                             └─────────────────┘
       │
       │  window.location.href = checkout_url
       ▼
┌──────────────────┐
│  Stripe Checkout │   Hosted by Stripe
│  (Card Entry)    │   User enters payment details
└──────┬───────────┘
       │
       │  On success → redirects to success_url
       ▼
┌──────────────┐     Webhook fires async       ┌─────────────────┐
│  Your App    │                                │  Backend API    │
│  success_url │                                │  (processes     │
│  page        │                                │   webhook)      │
└──────┬───────┘                                └─────────────────┘
       │
       │  Wait 2–3 seconds, then retry plan change / store creation
       ▼
    HTTP 200 ✅
```

### Tips for the success page:
- Show a "Setting up your subscription..." spinner
- Poll or retry the original API call after a short delay
- Use exponential backoff if the webhook hasn't been processed yet (retry at 2s, 4s, 8s)
- After 3 retries, show "Your payment was received. Changes may take a moment to reflect."

---

## Error Codes & HTTP Status Reference

### Billing-Specific Error Codes

| Code | Name | HTTP | Description | Frontend Action |
|------|------|------|-------------|-----------------|
| `1406` | `INVALID_BILLING_PLAN` | `400` | Plan value is not `free`, `starter`, or `pro` | Show validation error |
| `1407` | `STORE_LIMIT_EXCEEDED` | `409` | Generic store limit exceeded | Show limit message |
| `1409` | `PLAN_UPGRADE_REQUIRED` | `403` | Feature requires a higher plan | Show upgrade prompt |
| `1411` | `CHECKOUT_REQUIRED` | `402` | No Stripe subscription — checkout needed | Redirect to checkout or show `checkout_url` |
| `3031` | `STORE_NOT_ACTIVE` | `409` | Cannot change plan of inactive store | Show "store is inactive" |
| `3032` | `FREE_PLAN_LIMIT_REACHED` | `409` | Free plan limited to 1 store per tenant | Show "upgrade needed" or "delete existing free store" |

### General Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `3001` | `404` | Store not found |
| `3021` | `400` | Bad request (missing fields) |
| `3022` | `400` | Invalid request (validation failed) |

### Error Response Shape
```json
{
  "code": 3032,
  "slug": "FREE_PLAN_LIMIT_REACHED",
  "message": "Free plan is limited to 1 store per tenant. Upgrade to a paid plan for additional stores."
}
```

---

## UI State Machine

Use this to determine what to show based on the store's fields:

```
┌─────────────────────────────────────────────────────────────┐
│                     STORE PLAN STATES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  State 1: STABLE                                            │
│  ─────────────────                                          │
│  billing_plan = "pro"                                       │
│  pending_plan = null                                        │
│  downgrade_effective_at = null                              │
│                                                             │
│  UI: Show current plan. Show upgrade/downgrade buttons.     │
│                                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                             │
│  State 2: DOWNGRADE PENDING                                 │
│  ──────────────────────────                                 │
│  billing_plan = "pro"                                       │
│  pending_plan = "starter"                                   │
│  downgrade_effective_at = "2026-03-15T00:00:00Z"            │
│                                                             │
│  UI: Show banner "Changing to Starter on Mar 15"            │
│      Show "Cancel Downgrade" button                         │
│      User STILL has Pro features                            │
│                                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                             │
│  State 3: CHECKOUT REQUIRED                                 │
│  ──────────────────────────                                 │
│  HTTP 402 returned from plan change / store creation        │
│  checkout_required = true                                   │
│  checkout_url = "https://..."                               │
│                                                             │
│  UI: Show payment required modal/page                       │
│      CTA: "Complete Payment" → redirect to checkout_url     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Decision Table for Plan Change Button

```
Current    Target    Action              Response
───────    ──────    ──────              ────────
free       starter   Upgrade (immediate) 200 or 402
free       pro       Upgrade (immediate) 200 or 402
starter    pro       Upgrade (immediate) 200 or 402
pro        starter   Downgrade (scheduled) 200 with downgrade_scheduled=true
pro        free      Downgrade (scheduled) 200 with downgrade_scheduled=true, or 409
starter    free      Downgrade (scheduled) 200 with downgrade_scheduled=true, or 409
pro        pro       No-op / Cancel downgrade
starter    starter   No-op / Cancel downgrade
free       free      No-op
```

---

## Response Schemas

### ChangeStorePlanResponse

Returned by `PUT /v0/store/:storeId/plan` on success (`200`) or checkout required (`402`).

```typescript
interface ChangeStorePlanResponse {
  store: Store;                          // Full store object
  checkout_required: boolean;            // true if user must complete Stripe checkout
  checkout_url?: string;                 // Stripe hosted checkout page URL (only if checkout_required)
  checkout_session_id?: string;          // Stripe session ID (only if checkout_required)
  pending_plan?: "free" | "starter" | "pro";  // Set when downgrade is scheduled
  downgrade_effective_at?: string;       // ISO 8601 date when downgrade applies
  downgrade_scheduled: boolean;          // true if this response represents a scheduled downgrade
}
```

### Store (relevant billing fields)

```typescript
interface Store {
  tenant_id: string;
  store_id: string;
  status: "active" | "inactive" | "suspended";
  billing_plan: "free" | "starter" | "pro";
  pending_plan?: "free" | "starter" | "pro" | null;
  downgrade_effective_at?: string | null;    // ISO 8601
  plan_activated_at?: string | null;         // ISO 8601
  store_name: string;
  // ... other fields
}
```

### StoreListItem (from GET /v0/store)

```typescript
interface StoreListItem {
  tenant_id: string;
  store_id: string;
  status: string;
  billing_plan: string;
  pending_plan?: string | null;
  downgrade_effective_at?: string | null;
  store_name: string;
  location_type: string;
  description: string;
  address: { city: string; state: string } | null;
}
```

---

## Worked Examples

### Example 1: New tenant, first store (free)

```
1. POST /v0/store { store_name: "My Shop" }
   → 201 { store: { billing_plan: "free", ... } }
   ✅ Store created on free plan
```

### Example 2: Second store on free plan (blocked)

```
1. POST /v0/store { store_name: "Second Shop" }
   → 409 { code: 3032, message: "Free plan is limited to 1 store..." }
   ❌ Show upgrade prompt
```

### Example 3: Upgrade free store to starter (first time, no subscription)

```
1. PUT /v0/store/store-001/plan { billing_plan: "starter" }
   → 402 {
       checkout_required: true,
       checkout_url: "https://checkout.stripe.com/...",
       store: { billing_plan: "free" }     ← plan NOT changed yet
     }

2. Redirect user to checkout_url
3. User completes payment on Stripe
4. Stripe webhook fires → backend processes
5. User returns to success_url

6. PUT /v0/store/store-001/plan { billing_plan: "starter" }   ← retry
   → 200 {
       store: { billing_plan: "starter" },
       checkout_required: false,
       downgrade_scheduled: false
     }
   ✅ Done, store is now on starter plan
```

### Example 4: Downgrade pro → starter

```
1. PUT /v0/store/store-001/plan { billing_plan: "starter" }
   → 200 {
       store: {
         billing_plan: "pro",               ← still pro!
         pending_plan: "starter",
         downgrade_effective_at: "2026-03-15T00:00:00Z"
       },
       downgrade_scheduled: true,
       pending_plan: "starter",
       downgrade_effective_at: "2026-03-15T00:00:00Z"
     }

   Show banner: "Your plan will change to Starter on March 15, 2026"
   Show button: "Cancel Downgrade"
```

### Example 5: Cancel a pending downgrade

```
Store state: billing_plan="pro", pending_plan="starter"

1. PUT /v0/store/store-001/plan { billing_plan: "pro" }    ← same as current
   → 200 {
       store: {
         billing_plan: "pro",
         pending_plan: null,                 ← cleared
         downgrade_effective_at: null        ← cleared
       },
       downgrade_scheduled: false
     }

   Show toast: "Downgrade cancelled"
```

### Example 6: Upgrade while downgrade is pending

```
Store state: billing_plan="pro", pending_plan="starter"

1. PUT /v0/store/store-001/plan { billing_plan: "pro" }
   → But wait, "pro" is the current plan, so this just cancels the downgrade (Example 5)

   If instead the store was: billing_plan="starter", pending_plan="free"
   And user picks "pro":

1. PUT /v0/store/store-001/plan { billing_plan: "pro" }
   → 200 {
       store: {
         billing_plan: "pro",                ← upgraded immediately
         pending_plan: null,                 ← cleared
         downgrade_effective_at: null        ← cleared
       },
       downgrade_scheduled: false
     }

   Pending downgrade is automatically cleared, upgrade takes precedence.
```

### Example 7: Downgrade to free (limit check fails)

```
Tenant already has 1 free store.

1. PUT /v0/store/store-002/plan { billing_plan: "free" }
   → 409 { code: 3032, message: "Cannot downgrade to free: free plan limit (1 store) already reached..." }

   Show: "You already have a free store. Delete it first or keep this store on a paid plan."
```

---

## Polling & Webhooks — Frontend Considerations

The backend handles all Stripe webhook events automatically. The frontend **never** needs to call webhook endpoints directly. However, be aware of these async processes:

| Event | What Happens Automatically | Frontend Impact |
|-------|---------------------------|-----------------|
| Stripe Checkout completed | Subscription created on tenant | Retry plan change after 2-3s |
| Billing cycle renewal | Pending downgrades applied | `pending_plan` disappears, `billing_plan` changes — visible on next GET |
| Payment failure | Nothing changes | No immediate UI impact; Stripe handles dunning emails |
| Subscription cancelled (by Stripe) | All stores forced to free | `billing_plan` changes to `"free"` — visible on next GET |

### Recommended: Periodic Refresh
If displaying plan info on a dashboard, refresh store data every 30-60 seconds or on page focus to catch any webhook-driven changes (especially around billing cycle boundaries).
