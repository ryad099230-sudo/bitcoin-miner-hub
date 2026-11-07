# Deposit verification delivery — 2026-11-07

## Implemented in the existing project
- `src/components/app/Deposit.tsx`: existing-request view, exact requested amount, asset/network, destination, expiry, persisted status, received amount, confirmations, copy/explorer actions, TXID entry and authenticated `verify-deposit` invocation.
- `src/lib/deposit-verification.ts`: sends only `deposit_id` and trimmed `tx_hash`, checks the current user's ownership before invocation, and reads the owned database row afterwards. A successful HTTP response or submitted TXID never establishes credit.
- A synchronous submission lock plus disabled pending controls prevents double submission in this page. Confirmed state refreshes deposit, balance, ledger, notification and referral queries. Server-side idempotency still must be verified against the deployed function.
- Arabic-first messages and existing English localization distinguish submitted, confirming, underpaid, confirmed and errors. No background polling, cron, subscriptions or paid APIs were added.
- `src/lib/deposits.ts` and tests: transaction format, BTC/TRON explorer selection, allowed networks, exact decimal amount validation and retry eligibility.
- `src/routes/_authenticated/dashboard.tsx`: uses the deposit component, fixes existing TypeScript errors and constrains mobile navigation width.
- `src/routes/_authenticated/admin.tsx`: earlier uploaded-request work added deposit filters/details and network input validation; fixes existing TypeScript errors. No network setting was saved by this work.
- `src/components/app/ui-bits.tsx`: localized deposit status badges and contained history tables.
- Content routes: complete their existing sharing metadata.
- `AGENTS.md`, project memory and `roadmap.md`: preserve safety requirements and record remaining blockers.

## Earlier work in this interrupted development cycle
`drizzle/migrations/0001_harden_deposit_confirmation.sql` was applied on October 30: normalized hash uniqueness, confirmation prerequisites, immutable confirmed records and rejected/expired notifications. No existing financial rows, flags, addresses or rates were changed. This migration does not implement blockchain verification, and the existing manual confirmation RPC cannot bypass the confirmation-count requirement.

## Checks
- November 7: 24 tests across four test files passed: deposit rules, verifier payload/ownership/outcomes, money arithmetic and root routing.
- Latest automatic type/build result: `build OK` at 2026-11-07 09:29:57 UTC. No manual build or typecheck was run separately.
- November 7 browser: sign-in page rendered without page errors at desktop and 651px phone width; body width was 651px.
- October 30 browser: signed-in deposit page displayed deposits disabled, ordinary user was denied admin access, and the real create-deposit RPC rejected a request while deposits were disabled. A direct verifier availability probe returned HTTP 404 on that connection.

## Limitations — not represented as successful
- The active Lovable Cloud connection differs from the external backend named in the uploaded brief. It was not switched.
- November 7 database reads and session minting failed with “Database is possibly not accessible at the moment.” Authenticated end-to-end verification is blocked now.
- The claimed `verify-deposit` version 5 source/configuration is not present in this checkout and its deployment/version could not be verified. No Edge Function was created, updated or redeployed. JWT settings were not weakened or changed; the server-side JWT/ownership implementation remains unverified.
- No real transfer, successful blockchain confirmation, wrong-recipient chain rejection, duplicate-credit chain replay, or referral exactly-once integration was tested. Unit tests are not proof of those deployed-server behaviors.
- No wallet address, enable flag, network verification flag, rate, financial record, owner email or user role was changed during this work. No real-money transfer was made.
- GitHub synchronization cannot be confirmed through the available project tools. No manual Git push was performed.

## Remaining prerequisite
Restore access to the currently intended backend and make the existing verifier version 5/source available through the project connection. Its JWT validation, ownership, chain-derived values and atomic/idempotent crediting need live validation before claiming funds can be accepted. No private keys, seed phrases or paid services are required by this UI work.