# kova-api

Backend for **Kova** — an onchain neobank on Base. Starts as a monolith per the Master Brief; splits into microservices (`kova-travel`, `kova-payments`) as the team grows.

## Where this sits

```mermaid
graph LR
    App[kova-app] -->|REST| API[kova-api]
    API --> PG[(PostgreSQL)]
    API --> Redis[(Redis)]
    API --> Reap[Reap: card issuing + KYC]
    API --> ZeroDev[ZeroDev: bundler + paymaster]
    API --> Contracts[kova-contracts on Base]
    Reap -->|webhooks| API
    API --> Notif[FCM / SendGrid / Twilio]
    API --> Analytics[Mixpanel / Amplitude]
```

## Request flow: card transaction to spend analytics

```mermaid
sequenceDiagram
    participant Merchant
    participant Reap
    participant API as kova-api
    participant DB as PostgreSQL
    participant App as kova-app

    Merchant->>Reap: Card swipe (Visa/Mastercard)
    Reap->>API: Webhook: transaction + MCC code
    API->>DB: Store transaction, categorize by MCC
    API->>App: Push notification (FCM)
    App->>API: GET /analytics/monthly
    API->>DB: Aggregate by category
    API-->>App: Spend breakdown
```

## Auth flow (OTP + JWT)

```mermaid
sequenceDiagram
    participant App as kova-app
    participant API as kova-api
    participant Twilio
    participant DB as PostgreSQL

    App->>API: POST /auth/otp/request {phone}
    API->>Twilio: Send OTP
    App->>API: POST /auth/otp/verify {phone, code}
    API->>DB: Upsert user
    API-->>App: JWT (access + refresh), HTTPOnly cookie
```

## Service boundaries (Phase 1 monolith → Phase 2 split)

```mermaid
graph TD
    subgraph Phase1 [Phase 1 — kova-api monolith]
        Auth[Auth: OTP, JWT]
        Users[Users + wallets]
        Card[Card: Reap webhooks]
        Vault[Vault: deposits/yield indexing]
        P2P[P2P transfers]
    end
    subgraph Phase2 [Phase 2 — split out]
        Travel[kova-travel]
        Payments[kova-payments]
    end
    Phase1 -.->|extracted when owned by dedicated team member| Phase2
```

## Stack
- Node.js + TypeScript, Express
- PostgreSQL (primary) + Redis (cache, Bull queue for async jobs: SIP execution, vault rebalancing, analytics)
- Auth: JWT + refresh tokens, phone/email OTP
- Reap for card issuing/KYC, ZeroDev for smart accounts
- Monitoring: Sentry + Datadog/Grafana

## Roadmap

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title Kova API — Phase 1-2
    section Phase 1 (MVP)
    Auth (OTP + JWT)              :a1, 2026-08-01, 20d
    User + wallet routes          :a2, after a1, 20d
    Reap webhook ingestion        :a3, after a2, 20d
    Vault yield indexing          :a4, after a2, 25d
    P2P transfer routes           :a5, after a3, 15d
    section Phase 2
    Savings Goals + SIP jobs      :b1, after a4, 25d
    BBPS bill payment routes      :b2, after b1, 20d
```

## Getting started
```bash
cp .env.example .env
npm install
npm run dev
```

## Status
Only a `/health` route exists. Auth, wallet, card, and vault routes are next — see roadmap above.
