# Evegah Admin Dashboard — Feature Proof Index (v1.5)

Each row maps a PRD requirement to the implementation surface and screenshot evidence captured during verification.

| # | Feature ID | Feature | Implementation | Screenshot / proof |
|---|------------|---------|----------------|--------------------|
| 1 | FLEET-01 | Live fleet map & status | `/vehicles/map`, `GET /api/vehicles/telemetry` with online/stale/offline | `proof_fleet01_live_map.png` |
| 2 | FLEET-02 | Remote vehicle controls (PIN + 2-step) | Vehicle detail actions → `/api/vehicles/:code/commands/*` | `proof_fleet02_remote_controls.png` |
| 3 | FLEET-03 | Vehicle document expiry | `/vehicles/documents`, `GET /api/fleet-documents/expiry` | `proof_fleet03_document_expiry.png` |
| 4 | FLEET-04 | Bulk import/export | Existing bulk import + `GET /api/vehicles/export` | `proof_fleet04_bulk_export.png` |
| 5 | ZONE-01 | Geofence / no-parking editor | `/zones/new`, `/zones/map` | `proof_zone01_geofence.png` |
| 6 | ZONE-02 | Model-specific pricing | `/zones/pricing` | `proof_zone02_pricing.png` |
| 7 | ZONE-03 | Zone capacity meter | Zone list capacity fields from `/api/zones` | `proof_zone03_capacity.png` |
| 8 | KYC-01 | KYC document review | `/renters/kyc-review` | `proof_kyc01_review.png` |
| 9 | KYC-02 | Rider 360 profile | `/renters/profile` + `GET /api/renters/:id/360` | `proof_kyc02_rider360.png` |
| 10 | KYC-03 | Rider restrictions | `POST /api/renters/:id/restrictions` | `proof_kyc03_restrictions.png` |
| 11 | RIDE-01 | Return inspection & charges | `/ride-operations/return` + inspection payload on `POST /api/rides/return` | `proof_ride01_return.png` |
| 12 | RIDE-02 | Manual ride extension | `/extend-ride` | `proof_ride02_extend.png` |
| 13 | RIDE-03 | Emergency SOS queue | `/ride-operations/sos` | `proof_ride03_sos.png` |
| 14 | BAT-01 | Swap-station slot grid | `/battery/swap-stations` | `proof_bat01_swap_grid.png` |
| 15 | BAT-02 | Battery health flags | `/battery/health` (cycles > 800 / SoH < 75%) | `proof_bat02_health.png` |
| 16 | PAY-01 | Payment reconciliation | `/payment/reconciliation` | `proof_pay01_reconciliation.png` |
| 17 | PAY-02 | Refund console | `/payment/refund` | `proof_pay02_refunds.png` |
| 18 | PAY-03 | Coupon rule builder | `/payment/coupons` | `proof_pay03_coupons.png` |
| 19 | FIN-01 | GST invoices | `/payment/invoices` | `proof_fin01_invoices.png` |
| 20 | FRAN-01 | Franchise settlement | `/franchise/settlements` | `proof_fran01_settlements.png` |
| 21 | SET-01 | Branding editor | `/settings/white-label`, `/settings/theme` | `proof_set01_branding.png` |
| 22 | SET-02 | Custom domain verification | `/settings/domains` | `proof_set02_domains.png` |
| 23 | MSG-01 | Operational messaging | `/messaging` | `proof_msg01_messaging.png` |
| 24 | SEC-01 | RBAC & tenant boundaries | `RoleGuard`, `auth.js` roles + tenant scope | `proof_sec01_roles.png` |
| 25 | SEC-02 | Validation & rate limits | `middleware/rateLimit.js`, `middleware/validate.js` on login/remote/payment | `proof_sec02_rate_limit.png` |
| 26 | SEC-03 | Audit history | `/settings/audit-logs` | `proof_sec03_audit.png` |
| 27 | DATA-01 | Backups & export queues | `/settings/data` | `proof_data01_backups.png` |

## Screenshot notes

- Screenshots are stored under `/opt/cursor/artifacts/screenshots/` during verification and referenced from the PR walkthrough.
- Each screenshot should show the feature title/heading and the key acceptance UI (filters, status badges, action controls, or result states).
- Times shown in UI use Asia/Kolkata where formatted explicitly.

## API surfaces added for v1.5

- `POST /api/vehicles/:code/commands/request|confirm`
- `GET /api/vehicles/telemetry`, `GET /api/vehicles/export`
- `GET/POST /api/renters/kyc/queue|review`, `POST /api/renters/:id/restrictions`, `GET /api/renters/:id/360`
- `GET/POST /api/sos`, `/api/reconciliation/*`, `/api/franchise-settlements/*`
- `GET /api/swap-stations`, `/api/swap-stations/:id/slots`, `/api/swap-stations/health/flags`
- `GET/POST /api/messaging`, `/api/backups`, `/api/invoices`, `/api/domains`, `/api/fleet-documents/expiry`

## Captured evidence files

- `proof_bat01_swap_grid.png`
- `proof_bat02_health.png`
- `proof_data01_backups.png`
- `proof_fin01_invoices.png`
- `proof_fleet01_iot_map.png`
- `proof_fleet01_live_map.png`
- `proof_fleet02_remote_controls.png`
- `proof_fleet03_document_expiry.png`
- `proof_fran01_settlements.png`
- `proof_kyc01_review.png`
- `proof_login_or_dashboard.png`
- `proof_msg01_messaging.png`
- `proof_pay01_reconciliation.png`
- `proof_pay02_refunds.png`
- `proof_pay03_coupons.png`
- `proof_ride01_return.png`
- `proof_ride02_extend.png`
- `proof_ride03_sos.png`
- `proof_sec01_roles.png`
- `proof_sec03_audit.png`
- `proof_set01_branding.png`
- `proof_set02_domains.png`
- `proof_zone02_pricing.png`
- `proof_zone03_capacity.png`
- `proof_sec02_rate_limit.json` (HTTP 429 RATE_LIMITED on auth)
