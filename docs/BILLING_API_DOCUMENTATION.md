# Billing & Subscription API Documentation

> **For Frontend Development** | Base URL: `https://api.pkt-dev.pocketterminal.com`

---

## Table of Contents

1. [Overview](#overview)
2. [Pricing Plans](#pricing-plans)
3. [Architecture & Flow Diagrams](#architecture--flow-diagrams)
4. [Authentication](#authentication)
5. [API Endpoints](#api-endpoints)
   - [Create Store (with billing)](#1-create-store)
   - [Change Store Plan](#2-change-store-plan)
   - [Create Checkout Session](#3-create-checkout-session)
   - [Delete Store (affects billing)](#4-delete-store)
6. [Handling the 402 Payment Required Response](#handling-the-402-payment-required-response)
7. [Stripe Checkout Redirect Flow](#stripe-checkout-redirect-flow)
8. [Callback Pages](#callback-pages)
9. [Subscription Lifecycle](#subscription-lifecycle)
10. [Error Codes Reference](#error-codes-reference)
11. [Complete Integration Example](#complete-integration-example)

---

## Overview

PocketTerminal uses **seat-based pricing** powered by Stripe. Each **store** is a billable seat. A tenant (organization) has one Stripe customer and one subscription with up to two line items (Starter seats and Pro seats).

When a user creates a store with a paid plan (or upgrades from free), the backend checks if the tenant already has an active Stripe subscription:

- **Has subscription** → Seats are updated automatically, store is created. Returns `201`.
- **No subscription** → Store is created, but a Stripe Checkout session is needed. Returns `402` with a `checkout_url`.

The frontend must handle the `402` response and redirect the user to Stripe Checkout.

---

## Pricing Plans

| Plan | Price | Description |
|------|-------|-------------|
| `free` | $0/month | Basic features. Limited to 1 store per tenant. |
| `starter` | $29/store/month | Standard POS features for small businesses. |
| `pro` | $79/store/month | Advanced features, analytics, multi-terminal support. |

Each store has its own `billing_plan`. A single tenant can have stores on different plans simultaneously (e.g., 2 starter stores + 1 pro store).

---

## Architecture & Flow Diagrams

### High-Level Billing Architecture

```
┌─────────────┐        ┌──────────────┐        ┌──────────────┐
│   Frontend   │◄──────►│  Backend API  │◄──────►│   Stripe API  │
│   (React)    │        │  (Go/Lambda)  │        │               │
└─────────────┘        └──────┬───────┘        └───────┬──────┘
                              │                         │
                              ▼                         │
                       ┌──────────────┐                │
                       │   DynamoDB    │                │
                       │ (Tenant/Store)│                │
                       └──────────────┘                │
                                                        │
                              ┌──────────────────────────┘
                              ▼
                       ┌──────────────┐
                       │   Webhook     │
                       │  (Stripe →    │
                       │   Backend)    │
                       └──────────────┘
```

### Flow 1: First Paid Store (No Existing Subscription)

```
Frontend                        Backend                         Stripe
   │                               │                               │
   │  POST /v0/store               │                               │
   │  { billing_plan: "starter" }  │                               │
   │──────────────────────────────►│                               │
   │                               │  Create store in DB           │
   │                               │  Check subscription → NONE    │
   │                               │                               │
   │  HTTP 402                     │                               │
   │  {                            │                               │
   │    store: { ... },            │                               │
   │    checkout_required: true,   │                               │
   │    checkout_url: "https://    │                               │
   │      checkout.stripe.com/..." │                               │
   │    checkout_session_id: "..." │                               │
   │  }                           │                               │
   │◄──────────────────────────────│                               │
   │                               │                               │
   │  window.location.href =       │                               │
   │    checkout_url               │                               │
   │──────────────────────────────────────────────────────────────►│
   │                               │                               │
   │                               │    (Customer enters card      │
   │                               │     on Stripe hosted page)    │
   │                               │                               │
   │  Redirect to success_url      │                               │
   │◄──────────────────────────────────────────────────────────────│
   │                               │                               │
   │                               │  Webhook: checkout.session    │
   │                               │           .completed          │
   │                               │◄──────────────────────────────│
   │                               │                               │
   │                               │  Save subscription to tenant  │
   │                               │  Sync seat quantities         │
   │                               │                               │
```

### Flow 2: Additional Paid Store (Subscription Already Exists)

```
Frontend                        Backend                         Stripe
   │                               │                               │
   │  POST /v0/store               │                               │
   │  { billing_plan: "pro" }      │                               │
   │──────────────────────────────►│                               │
   │                               │  Create store in DB           │
   │                               │  Check subscription → EXISTS  │
   │                               │  Sync seat quantities ───────►│
   │                               │                               │
   │  HTTP 201                     │                               │
   │  { store: { ... } }           │                               │
   │◄──────────────────────────────│                               │
   │                               │                               │
   │  ✅ Done! No redirect needed   │                               │
```

### Flow 3: Upgrade/Downgrade Store Plan

```
Frontend                        Backend                         Stripe
   │                               │                               │
   │  PUT /v0/store/:storeId/plan  │                               │
   │  { billing_plan: "pro" }      │                               │
   │──────────────────────────────►│                               │
   │                               │  Update store plan in DB      │
   │                               │  Check subscription           │
   │                               │                               │
   │  ── If subscription exists ──►│  Sync quantities ────────────►│
   │  HTTP 200 { store }           │                               │
   │◄──────────────────────────────│                               │
   │                               │                               │
   │  ── If NO subscription ──────►│                               │
   │  HTTP 402                     │                               │
   │  { checkout_required: true,   │                               │
   │    checkout_url: "..." }      │                               │
   │◄──────────────────────────────│                               │
   │                               │                               │
   │  Redirect to checkout_url     │                               │
```

### Flow 4: Explicit Checkout Session (Re-attempt)

```
Frontend                        Backend                         Stripe
   │                               │                               │
   │  POST /v0/billing/            │                               │
   │        checkout-session       │                               │
   │  {                            │                               │
   │    success_url: "https://...",│                               │
   │    cancel_url: "https://..."  │                               │
   │  }                            │                               │
   │──────────────────────────────►│                               │
   │                               │  Create Checkout Session ────►│
   │                               │◄─────────────────────────────│
   │  HTTP 200                     │                               │
   │  {                            │                               │
   │    checkout_session_id: "...",│                               │
   │    checkout_url: "https://    │                               │
   │      checkout.stripe.com/..." │                               │
   │  }                           │                               │
   │◄──────────────────────────────│                               │
   │                               │                               │
   │  Redirect to checkout_url     │                               │
```

---

## Authentication

All billing endpoints (except the webhook) require the standard authentication headers:

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token from Cognito (`Bearer <id_token>`) |
| `X-Tenant-Id` | Yes | The tenant ID for the current session |
| `Content-Type` | Yes | `application/json` |

> ⚠️ The webhook endpoint (`POST /v0/billing/webhook`) is **unauthenticated**. It is called directly by Stripe servers.

---

## API Endpoints

### 1. Create Store

Creates a new store. If the store has a paid `billing_plan` and the tenant has no active subscription, returns `402` with a Stripe Checkout URL.

```
POST /v0/store
```

**Request Body:**

```json
{
  "store_id": "STORE-001",
  "store_name": "Downtown Branch",
  "billing_plan": "starter",
  "description": "Main downtown location",
  "location_type": "retail",
  "store_type": "general",
  "address": {
    "address1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94102",
    "country": "US"
  },
  "country": "US",
  "currency": "USD",
  "timezone": "America/Los_Angeles",
  "email": "downtown@example.com"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `store_id` | string | ✅ | Unique identifier for the store |
| `store_name` | string | ✅ | Display name |
| `billing_plan` | string | ❌ | One of: `free`, `starter`, `pro`. Defaults to `free` if omitted. |
| `location_type` | string | ❌ | One of: `retail`, `restaurant`, `quick_service`, `cafe`, `bar`, `bakery`, `food_truck`, `canteen`, `cloud_kitchen`, `kiosk`, `pharmacy`, `salon`, `laundromat`, `repair_shop`, `clinic`, `cinema`, `theme_park`, `hotel`, `airport_kiosk`, `school_canteen`, `campus_store`, `popup`, `online`, `warehouse`, `outlet` |
| `store_type` | string | ❌ | One of: `general`, `grocery`, `clothing`, `electronics`, `pharmacy`, `restaurant`, `cafe`, `bar`, `bakery`, `juice_bar`, `ice_cream_parlor`, `salon`, `spa`, `laundry`, `repair`, `clinic`, `bookstore`, `toy_store`, `home_decor`, `jewelry`, `specialty` |
| `email` | string | ❌ | Valid email format |
| `latitude` | string | ❌ | Valid latitude |
| `longitude` | string | ❌ | Valid longitude |

**Response — `201 Created` (no checkout needed):**

Store was created and subscription was synced automatically.

```json
{
  "tenant_id": "tenant-abc123",
  "store_id": "STORE-001",
  "store_name": "Downtown Branch",
  "billing_plan": "starter",
  "status": "active",
  "description": "Main downtown location",
  "location_type": "retail",
  "store_type": "general",
  "address": { ... },
  "currency": "USD",
  "timezone": "America/Los_Angeles",
  "created_at": "2026-02-10T12:00:00Z",
  "updated_at": "2026-02-10T12:00:00Z"
}
```

**Response — `402 Payment Required` (checkout needed):**

Store was created but the tenant needs to complete Stripe Checkout to activate the subscription.

```json
{
  "store": {
    "tenant_id": "tenant-abc123",
    "store_id": "STORE-001",
    "store_name": "Downtown Branch",
    "billing_plan": "starter",
    "status": "active",
    ...
  },
  "checkout_required": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3...",
  "checkout_session_id": "cs_test_a1b2c3d4e5f6..."
}
```

> **Frontend Action:** Redirect the user to `checkout_url` using `window.location.href`.

---

### 2. Change Store Plan

Changes the billing plan of an existing store.

```
PUT /v0/store/:storeId/plan
```

**Path Parameters:**

| Parameter | Description |
|-----------|-------------|
| `storeId` | The store ID (e.g., `STORE-001`) |

**Request Body:**

```json
{
  "billing_plan": "pro"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `billing_plan` | string | ✅ | One of: `free`, `starter`, `pro` |

**Response — `200 OK` (subscription synced):**

Plan was changed and seat quantities updated on the existing subscription.

```json
{
  "tenant_id": "tenant-abc123",
  "store_id": "STORE-001",
  "store_name": "Downtown Branch",
  "billing_plan": "pro",
  "status": "active",
  ...
}
```

**Response — `402 Payment Required` (checkout needed):**

Plan was changed but the tenant has no subscription — checkout is required first.

```json
{
  "store": {
    "tenant_id": "tenant-abc123",
    "store_id": "STORE-001",
    "billing_plan": "pro",
    ...
  },
  "checkout_required": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "checkout_session_id": "cs_test_..."
}
```

> **Frontend Action:** Same as Create Store — redirect to `checkout_url`.

---

### 3. Create Checkout Session

Explicitly creates a Stripe Checkout Session. Use this when you need to re-initiate the checkout flow (e.g., user navigated away, session expired, or you want a "Manage Billing" button).

```
POST /v0/billing/checkout-session
```

**Request Body:**

```json
{
  "success_url": "https://app.pocketterminal.com/billing/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://app.pocketterminal.com/billing/cancel"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `success_url` | string | ✅ | Valid URL. Stripe replaces `{CHECKOUT_SESSION_ID}` with the actual session ID. |
| `cancel_url` | string | ✅ | Valid URL. Where Stripe redirects if the user cancels. |

**Response — `200 OK`:**

```json
{
  "checkout_session_id": "cs_test_a1b2c3d4e5f6...",
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3..."
}
```

**Response — `409 Conflict`:**

Tenant already has an active subscription — no checkout session needed.

```json
{
  "code": 1404,
  "slug": "OPERATION_NOT_ALLOWED",
  "message": "Tenant already has an active subscription"
}
```

> **Note:** The `{CHECKOUT_SESSION_ID}` placeholder in `success_url` is a Stripe feature. Stripe automatically replaces it with the real session ID before redirecting.

---

### 4. Delete Store

Deletes a store. If the store has a paid plan, the backend automatically updates seat quantities on the Stripe subscription. If all paid stores are deleted, the subscription is cancelled.

```
DELETE /v0/store/:storeId
```

**Response — `204 No Content`:**

Store deleted and subscription updated. No body returned.

> **Note:** This is fire-and-forget from the frontend perspective. Billing is handled automatically on the backend.

---

## Handling the 402 Payment Required Response

The `402` status code is the key signal that the frontend must act on. Here's the recommended handling logic:

```typescript
// TypeScript / React example

interface CheckoutRequiredResponse {
  store: Store;
  checkout_required: boolean;
  checkout_url?: string;
  checkout_session_id?: string;
}

async function createStore(storeData: CreateStoreRequest): Promise<Store> {
  const response = await fetch(`${API_BASE}/v0/store`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'X-Tenant-Id': tenantId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(storeData),
  });

  if (response.status === 201) {
    // Store created, subscription synced — all good
    return response.json();
  }

  if (response.status === 402) {
    // Store was created but checkout is needed
    const data: CheckoutRequiredResponse = await response.json();

    if (data.checkout_url) {
      // Option A: Full-page redirect (recommended)
      window.location.href = data.checkout_url;

      // Option B: Open in new tab
      // window.open(data.checkout_url, '_blank');
    } else {
      // Checkout session creation failed — show error, let user retry
      showError('Payment setup required. Please try again.');
    }

    // Return the store data so UI can update
    return data.store;
  }

  // Handle other errors
  const error = await response.json();
  throw new Error(error.message);
}
```

### Decision Tree

```
API Response
    │
    ├─ 201 Created
    │   └─ ✅ Show success. Store is fully active.
    │
    ├─ 402 Payment Required
    │   ├─ checkout_url present?
    │   │   ├─ YES → Redirect user to checkout_url
    │   │   └─ NO  → Show error, offer "Set up billing" button
    │   └─ Store data is in response.store (store IS created)
    │
    ├─ 400 Bad Request
    │   └─ Show validation errors
    │
    ├─ 403 Forbidden
    │   └─ User doesn't have access to this tenant
    │
    └─ 500 Internal Server Error
        └─ Show generic error
```

---

## Stripe Checkout Redirect Flow

### What Happens on Stripe's Page

1. User lands on Stripe's hosted checkout page
2. Stripe shows the subscription details (plan name, price)
3. User enters credit card / payment method
4. On success → Stripe redirects to your `success_url`
5. On cancel → Stripe redirects to your `cancel_url`

### Success URL

**Recommended format:**
```
https://app.pocketterminal.com/billing/success?session_id={CHECKOUT_SESSION_ID}
```

Stripe automatically replaces `{CHECKOUT_SESSION_ID}` with the real session ID (e.g., `cs_test_a1b2c3...`).

### Cancel URL

**Recommended format:**
```
https://app.pocketterminal.com/billing/cancel
```

---

## Callback Pages

### Success Page (`/billing/success`)

The success page is shown after the customer completes checkout. At this point:

- ✅ The store has already been created (happened before the 402)
- ⏳ The webhook may or may not have fired yet (usually fires within seconds)
- ✅ The subscription will be active momentarily

**Recommended behavior:**

```typescript
// /billing/success page

function BillingSuccessPage() {
  const sessionId = new URLSearchParams(window.location.search).get('session_id');

  // Option 1: Simple confirmation
  // Just show "Payment successful! Your subscription is now active."
  // Then redirect to the stores page after a few seconds.

  // Option 2: Poll for confirmation (optional)
  // Poll GET /v0/store to check if subscription_status is "active"
  // on the tenant. This is optional — the webhook handles it.

  return (
    <div>
      <h1>✅ Payment Successful!</h1>
      <p>Your subscription is now active. Redirecting to your stores...</p>
    </div>
  );
}
```

> **Important:** Do NOT call any API to "confirm" the checkout. The backend webhook handles everything automatically. The success page is purely a UX confirmation.

### Cancel Page (`/billing/cancel`)

The cancel page is shown if the user clicks "Back" or closes the Stripe Checkout page.

**Important:** The store **was already created** before the checkout redirect. The store exists but the subscription is not yet active.

**Recommended behavior:**

```typescript
function BillingCancelPage() {
  return (
    <div>
      <h1>Payment Cancelled</h1>
      <p>Your store was created but billing is not yet set up.</p>
      <p>You can complete payment setup at any time.</p>
      <button onClick={retryCheckout}>Set Up Billing</button>
      {/* retryCheckout calls POST /v0/billing/checkout-session */}
    </div>
  );
}
```

---

## Subscription Lifecycle

### States

| Status | Meaning | Frontend Behavior |
|--------|---------|-------------------|
| `active` | Subscription is active and paid | Normal operation |
| `past_due` | Payment failed, Stripe is retrying | Show warning banner |
| `canceled` | Subscription was cancelled | Show "Reactivate" option |
| `unpaid` | All retry attempts failed | Block paid features |
| `trialing` | In trial period (if configured) | Show trial info |
| `incomplete` | First payment failed during checkout | Prompt to retry checkout |

### Tenant Response Fields

When you fetch tenant data, these billing fields are available:

```json
{
  "id": "tenant-abc123",
  "name": "Acme Corp",
  "stripe_customer_id": "cus_abc123",
  "subscription_id": "sub_xyz789",
  "subscription_status": "active",
  ...
}
```

> **Note:** `starter_price_item_id` and `pro_price_item_id` are internal fields and are **not** returned in API responses (hidden via `json:"-"`).

### Seat Counting

The backend **always recomputes** seat counts from the database. It never increments/decrements. This ensures accuracy.

```
Example: Tenant has 3 starter stores + 2 pro stores

Stripe Subscription:
  ├─ Line Item 1: Starter plan × 3 ($29 × 3 = $87/month)
  └─ Line Item 2: Pro plan × 2 ($79 × 2 = $158/month)

Total: $245/month
```

---

## Error Codes Reference

### Billing-Specific Error Codes

| Code | Slug | HTTP Status | Description |
|------|------|-------------|-------------|
| `1404` | `OPERATION_NOT_ALLOWED` | 409 | Tenant already has an active subscription (duplicate checkout attempt) |
| `1405` | `BILLING_REQUIRED` | — | Billing setup is required for this operation |
| `1406` | `INVALID_BILLING_PLAN` | 400 | Invalid billing plan value |
| `1407` | `STORE_LIMIT_EXCEEDED` | — | Store limit exceeded for the current plan |
| `1408` | `SUBSCRIPTION_INACTIVE` | — | Subscription is not in an active state |
| `1409` | `PLAN_UPGRADE_REQUIRED` | — | Feature requires a higher plan |
| `1410` | `PAYMENT_FAILED` | — | Payment processing failed |
| `1411` | `CHECKOUT_REQUIRED` | 402 | Stripe Checkout is needed to set up subscription |

### General Error Response Format

```json
{
  "code": 1411,
  "slug": "CHECKOUT_REQUIRED",
  "message": "Checkout is required to activate the subscription"
}
```

---

## Complete Integration Example

### React Hook (TypeScript)

```typescript
// hooks/useBilling.ts

interface CheckoutResponse {
  store: Store;
  checkout_required: boolean;
  checkout_url?: string;
  checkout_session_id?: string;
}

export function useBilling() {
  const { idToken, tenantId } = useAuth();

  const headers = {
    'Authorization': `Bearer ${idToken}`,
    'X-Tenant-Id': tenantId,
    'Content-Type': 'application/json',
  };

  /**
   * Creates a store. Handles 402 by redirecting to Stripe Checkout.
   * Returns the store data regardless of checkout requirement.
   */
  async function createStore(data: CreateStoreRequest): Promise<{
    store: Store;
    checkoutRequired: boolean;
  }> {
    const res = await fetch(`${API_BASE}/v0/store`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (res.status === 201) {
      const store = await res.json();
      return { store, checkoutRequired: false };
    }

    if (res.status === 402) {
      const body: CheckoutResponse = await res.json();
      if (body.checkout_url) {
        // Redirect to Stripe — this navigates away from the app
        window.location.href = body.checkout_url;
      }
      return { store: body.store, checkoutRequired: true };
    }

    const error = await res.json();
    throw new ApiError(error.code, error.message);
  }

  /**
   * Changes the plan on an existing store.
   */
  async function changeStorePlan(
    storeId: string,
    billingPlan: 'free' | 'starter' | 'pro'
  ): Promise<{ store: Store; checkoutRequired: boolean }> {
    const res = await fetch(`${API_BASE}/v0/store/${storeId}/plan`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ billing_plan: billingPlan }),
    });

    if (res.status === 200) {
      const store = await res.json();
      return { store, checkoutRequired: false };
    }

    if (res.status === 402) {
      const body: CheckoutResponse = await res.json();
      if (body.checkout_url) {
        window.location.href = body.checkout_url;
      }
      return { store: body.store, checkoutRequired: true };
    }

    const error = await res.json();
    throw new ApiError(error.code, error.message);
  }

  /**
   * Manually creates a checkout session (e.g., "Set up billing" button).
   */
  async function createCheckoutSession(
    successUrl: string,
    cancelUrl: string
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    const res = await fetch(`${API_BASE}/v0/billing/checkout-session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (res.status === 200) {
      const body = await res.json();
      return {
        checkoutUrl: body.checkout_url,
        sessionId: body.checkout_session_id,
      };
    }

    if (res.status === 409) {
      throw new ApiError(1404, 'Subscription already active');
    }

    const error = await res.json();
    throw new ApiError(error.code, error.message);
  }

  return { createStore, changeStorePlan, createCheckoutSession };
}
```

### Routing Setup

```typescript
// App routes — add these to your router

<Route path="/billing/success" component={BillingSuccessPage} />
<Route path="/billing/cancel" component={BillingCancelPage} />
```

---

## Quick Reference Card

| Action | Method | Endpoint | Expect 402? |
|--------|--------|----------|-------------|
| Create free store | `POST /v0/store` | `billing_plan: "free"` | ❌ Never |
| Create paid store | `POST /v0/store` | `billing_plan: "starter"` or `"pro"` | ✅ If no subscription |
| Upgrade store plan | `PUT /v0/store/:storeId/plan` | `billing_plan: "pro"` | ✅ If no subscription |
| Downgrade to free | `PUT /v0/store/:storeId/plan` | `billing_plan: "free"` | ❌ Never |
| Manual checkout | `POST /v0/billing/checkout-session` | — | ❌ (returns URL in 200) |
| Delete store | `DELETE /v0/store/:storeId` | — | ❌ Never |

> **Rule of thumb:** You only get a `402` when paid stores exist but the tenant has never completed Stripe Checkout. Once Stripe Checkout is completed the first time, all subsequent store operations return `200`/`201` directly.
