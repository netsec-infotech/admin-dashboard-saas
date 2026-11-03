# Evegah Admin Dashboard — Feature Proof Index (v1.5)

Each row maps a PRD requirement to the implementation surface, screenshot evidence under `docs/proof/`, and pass/fail status against the acceptance criteria verified for this release.

| # | Feature ID | Feature | Implementation | Screenshot / proof | Status |
|---|------------|---------|----------------|--------------------|--------|
| 1 | FLEET-01 | Live fleet map & status | `/vehicles/map`, `GET /api/vehicles/telemetry` with online/stale/offline | [proof_fleet01_live_map.png](docs/proof/proof_fleet01_live_map.png) | **PASS** |
| 2 | FLEET-02 | Remote vehicle controls (PIN + 2-step) | Vehicle detail actions → `/api/vehicles/:code/commands/*` | [proof_fleet02_remote_controls.png](docs/proof/proof_fleet02_remote_controls.png) | **PASS** |
| 3 | FLEET-03 | Vehicle document expiry | `/vehicles/documents`, `GET /api/fleet-documents/expiry` | [proof_fleet03_document_expiry.png](docs/proof/proof_fleet03_document_expiry.png) | **PASS** |
| 4 | FLEET-04 | Bulk import/export | `/vehicles/import`, preview + commit block, `GET /api/vehicles/export` | [proof_fleet04_bulk_export.png](docs/proof/proof_fleet04_bulk_export.png) | **PASS** |
| 5 | ZONE-01 | Geofence / no-parking editor | `/zones/geofence`, `POST /api/zones/geometry/validate`, `GET /api/zones/breaches` | [proof_zone01_geofence.png](docs/proof/proof_zone01_geofence.png) | **PASS** |
| 6 | ZONE-02 | Model-specific pricing | `/zones/pricing` | [proof_zone02_pricing.png](docs/proof/proof_zone02_pricing.png) | **PASS** |
| 7 | ZONE-03 | Zone capacity meter | Zone list capacity fields from `/api/zones` | [proof_zone03_capacity.png](docs/proof/proof_zone03_capacity.png) | **PASS** |
| 8 | KYC-01 | KYC document review | `/renters/kyc-review` | [proof_kyc01_review.png](docs/proof/proof_kyc01_review.png) | **PASS** |
| 9 | KYC-02 | Rider 360 profile | `/renters/360`, `GET /api/renters/:id/360` | [proof_kyc02_rider360.png](docs/proof/proof_kyc02_rider360.png) | **PASS** |
| 10 | KYC-03 | Rider restrictions | Restriction panel + booking/extend enforcement | [proof_kyc03_restrictions.png](docs/proof/proof_kyc03_restrictions.png) | **PASS** |
| 11 | RIDE-01 | Return inspection & charges | `/ride-operations/return` + GPS sanity + hourly overdue idempotency | [proof_ride01_return.png](docs/proof/proof_ride01_return.png) | **PASS** |
| 12 | RIDE-02 | Manual ride extension | `/extend-ride` — extension blocked when payment fails | [proof_ride02_extend.png](docs/proof/proof_ride02_extend.png) | **PASS** |
| 13 | RIDE-03 | Emergency SOS queue | `/ride-operations/sos` | [proof_ride03_sos.png](docs/proof/proof_ride03_sos.png) | **PASS** |
| 14 | BAT-01 | Swap-station slot grid | `/battery/swap-stations` | [proof_bat01_swap_grid.png](docs/proof/proof_bat01_swap_grid.png) | **PASS** |
| 15 | BAT-02 | Battery health flags | `/battery/health` (cycles > 800 / SoH < 75%) | [proof_bat02_health.png](docs/proof/proof_bat02_health.png) | **PASS** |
| 16 | PAY-01 | Payment reconciliation | `/payment/reconciliation` + webhook dedupe + 02:00 Asia/Kolkata cron | [proof_pay01_reconciliation.png](docs/proof/proof_pay01_reconciliation.png) | **PASS** |
| 17 | PAY-02 | Refund console | `/payment/refund` — refundable cap + duplicate block | [proof_pay02_refunds.png](docs/proof/proof_pay02_refunds.png) | **PASS** |
| 18 | PAY-03 | Coupon rule builder | `/payment/coupons` | [proof_pay03_coupons.png](docs/proof/proof_pay03_coupons.png) | **PASS** |
| 19 | FIN-01 | GST invoices | `/payment/invoices` | [proof_fin01_invoices.png](docs/proof/proof_fin01_invoices.png) | **PASS** |
| 20 | FRAN-01 | Franchise settlement | `/franchise/settlements` | [proof_fran01_settlements.png](docs/proof/proof_fran01_settlements.png) | **PASS** |
| 21 | SET-01 | Branding editor | `/settings/white-label`, `/settings/theme` | [proof_set01_branding.png](docs/proof/proof_set01_branding.png) | **PASS** |
| 22 | SET-02 | Custom domain verification | `/settings/domains` | [proof_set02_domains.png](docs/proof/proof_set02_domains.png) | **PASS** |
| 23 | MSG-01 | Operational messaging | `/messaging` | [proof_msg01_messaging.png](docs/proof/proof_msg01_messaging.png) | **PASS** |
| 24 | SEC-01 | RBAC & tenant boundaries | `RoleGuard`, `tenantScope.js` — forged ID/zone denied | [proof_sec01_roles.png](docs/proof/proof_sec01_roles.png) | **PASS** |
| 25 | SEC-02 | Validation & rate limits | `middleware/rateLimit.js`, `middleware/validate.js` | [proof_sec02_rate_limit.json](docs/proof/proof_sec02_rate_limit.json) | **PASS** |
| 26 | SEC-03 | Audit history | `/settings/audit-logs` | [proof_sec03_audit.png](docs/proof/proof_sec03_audit.png) | **PASS** |
| 27 | DATA-01 | Backups & export queues | `/settings/data` | [proof_data01_backups.png](docs/proof/proof_data01_backups.png) | **PASS** |

**Summary: 27 / 27 PASS**

## Screenshot notes

- All proof files live in [`docs/proof/`](docs/proof/) and are linked relatively from this index.
- Each screenshot shows the feature title/heading and the key acceptance UI (filters, status badges, action controls, or result states).
- Times shown in UI use Asia/Kolkata where formatted explicitly.

## Acceptance criteria verified in this pass

- **FLEET-04:** CSV/Excel preview lists valid vs invalid rows with field-level errors; commit returns `IMPORT_VALIDATION_FAILED` and never creates partial/duplicate vehicles.
- **ZONE-01:** Geometry validator explains `SELF_INTERSECTION` / invalid area; breach scan lists vehicles outside assigned boundaries.
- **KYC-02 / KYC-03:** Rider 360 UI shows ride/wallet/docs; restrictions are visible and booking returns `RIDER_RESTRICTED`.
- **RIDE-01:** GPS sanity flags implausible odometer; hourly overdue assessment charges once and retries charge ₹0.
- **RIDE-02:** Extension with failed/missing payment returns HTTP 402 `PAYMENT_FAILED`.
- **PAY-01:** Webhooks accepted once (`duplicate: true` on replay); daily reconciliation run scheduled for 02:00 Asia/Kolkata.
- **PAY-02:** Over-refund returns `REFUND_EXCEEDS_BALANCE`; completed refund blocks duplicates with `DUPLICATE_REFUND`.
- **SEC-01:** Franchise-scoped JWT cannot read out-of-zone vehicles (`TENANT_MISMATCH`).

Automated suite: `backend/scripts/test_v15_acceptance.js`  
Latest output: [docs/proof/v15_acceptance_output.txt](docs/proof/v15_acceptance_output.txt) — **25 passed, 0 failed**.

## API surfaces added for v1.5

- `POST /api/vehicles/:code/commands/request|confirm`
- `GET /api/vehicles/telemetry`, `GET /api/vehicles/export`
- `POST /api/vehicles/bulk-import/preview`, hardened `POST /api/vehicles/bulk-import`
- `GET/POST /api/renters/kyc/queue|review`, `POST /api/renters/:id/restrictions`, `GET /api/renters/:id/360`
- `POST /api/zones/geometry/validate`, `GET /api/zones/breaches`
- `GET/POST /api/sos`, `/api/reconciliation/*` (webhook dedupe + cron), `/api/franchise-settlements/*`
- `GET /api/swap-stations`, `/api/swap-stations/:id/slots`, `/api/swap-stations/health/flags`
- `GET/POST /api/messaging`, `/api/backups`, `/api/invoices`, `/api/domains`, `/api/fleet-documents/expiry`

## Open product decisions

1. **Overdue rate:** RIDE-01 currently assesses ₹50 per whole overdue hour. Confirm whether franchise-specific rates or grace-minute rounding should replace the flat schedule.
2. **Partial refunds:** PAY-02 currently marks deposit `Refunded` after the first successful refund and blocks further draws. Confirm whether multi-step partial refunds against remaining balance are required.
3. **Bulk import force path:** `force_partial` exists as an admin override; product should decide whether Super Admin may ever commit valid rows while leaving invalids behind, or keep all-or-nothing forever.
4. **Geofence overlap policy:** Overlap is reported as a warning. Confirm whether publishing overlapping service polygons should be hard-blocked or allowed with acknowledgment.
5. **Restriction reason taxonomy:** Current tags are `non_payment`, `vehicle_abandonment`, `unsafe_driving`, `other`. Confirm whether franchise teams need custom tags or severity levels.
6. **IoT tile provider:** Live map tiles depend on configured map credentials; offline tiles show an empty basemap while vehicle markers still render from telemetry.
