# kova-api

Backend for Kova — the onchain neobank on Base. Starts as a monolith per the Kova Master Brief; splits into microservices (kova-travel, kova-payments) as the team grows.

## Stack
- Node.js + TypeScript, Express
- PostgreSQL (primary) + Redis (cache/queue)
- Auth: JWT + refresh tokens, phone/email OTP
- Reap for card issuing/KYC, ZeroDev for smart accounts

## Getting started
```bash
cp .env.example .env
npm install
npm run dev
```

## Status
Empty scaffold — just a health check endpoint. Auth, wallet, card, and vault routes not yet built.
