# Security Specification for PT NAZLA Terminal Petikemas (Nazla Shark Container Terminal)

## 1. Data Invariants
- A Container document can only be managed by authenticated terminal operators/admins.
- Container documents must adhere strictly to ISO container bounds, positive gross weight, and designated yard blocks.
- Yard blocks documents describe physical container yard slots and capacities and require valid bounds.
- Vessel documents describe berthing container ships and their TEU targets.
- User profile read and write must be isolated to authenticated user ID or verified admin.

## 2. Dirty Dozen Security Payloads
1. Unauthenticated client attempting to insert/modify containers -> PERMISSION_DENIED
2. Malicious user injecting 50MB string payload into container number -> PERMISSION_DENIED (Bounded string size)
3. Malicious user spoofing createdBy UID with arbitrary UID -> PERMISSION_DENIED
4. Malicious user inserting negative grossWeightKg or negative handlingFee -> PERMISSION_DENIED
5. Malicious user tampering with immutable fields (createdAt) -> PERMISSION_DENIED
6. Non-admin modifying another user's role -> PERMISSION_DENIED
7. Unauthenticated user scraping container manifest / consignee PII -> PERMISSION_DENIED
8. Unvalidated status injection (e.g. status: "HACKED") -> PERMISSION_DENIED
9. Malicious user overwriting yard TEU capacity with invalid type -> PERMISSION_DENIED
10. SQL / script injection payload into path document ID -> PERMISSION_DENIED (isValidId regex guard)
11. Unauthenticated bulk listing of yard blocks -> PERMISSION_DENIED
12. Attempt to bypass schema with ghost keys -> PERMISSION_DENIED
