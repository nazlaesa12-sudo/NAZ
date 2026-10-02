# Security Specification for PT NAZLA Bahari Marine

## 1. Data Invariants
- A Ship document can only be managed by authenticated operators/admins.
- A CargoManifest document must belong to a valid registered ship ID.
- User profile read and write must be isolated to the authenticated user ID or verified admin.
- Cargo manifests must strictly contain numeric non-negative weights, fees, item counts and bounded strings.

## 2. Dirty Dozen Security Payloads
1. Anonymous user attempting to create/read ship manifests -> PERMISSION_DENIED
2. Malicious user inserting 50MB string into cargo description -> PERMISSION_DENIED (Bounded string size)
3. Malicious user spoofing createdBy UID with someone else's UID -> PERMISSION_DENIED
4. Malicious user sending negative cargo weight -> PERMISSION_DENIED
5. Malicious user tampering with immutable fields (createdAt) on update -> PERMISSION_DENIED
6. Non-admin modifying another user's role -> PERMISSION_DENIED
7. User attempting to list another user's private data without auth -> PERMISSION_DENIED
8. Unvalidated status injection (e.g., status: "HACKED") -> PERMISSION_DENIED
9. Overwriting ship capacity with arbitrary string type -> PERMISSION_DENIED
10. SQL / script injection payload into path document ID -> PERMISSION_DENIED (isValidId regex guard)
11. Unauthenticated bulk scraping of cargo manifest -> PERMISSION_DENIED
12. Attempt to bypass schema with ghost keys -> PERMISSION_DENIED
