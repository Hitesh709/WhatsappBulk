# WhatsappBulk

Compliance-first WhatsApp marketing campaign platform for opted-in leads.

## MVP
- Lead database with WhatsApp consent status
- CSV import-ready data model
- Campaign management
- Approved WhatsApp template sending
- Delivery/read/reply webhook tracking
- Opt-out/suppression handling
- Dashboard foundation

## Architecture
Next.js + TypeScript + Prisma + PostgreSQL + Meta WhatsApp Business Cloud API.

This project does **not** automate WhatsApp Web, rotate numbers, or bypass WhatsApp restrictions. Marketing messages are sent through Meta's official WhatsApp Business Platform and only to contacts with recorded consent.

## Setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Configure PostgreSQL and Meta Cloud API credentials.
4. `npm install`
5. `npm run db:generate`
6. `npm run db:push`
7. `npm run dev`

Meta Developer Hub: https://whatsappbusiness.com/developers/developer-hub/

Never commit `.env`, access tokens, or customer data.
