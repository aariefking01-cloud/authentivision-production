# Security Policy & Forensic Chain of Custody

## Cryptographic Evidence Integrity
Every piece of media submitted to AuthentiVision undergoes immediate client-side SHA-256 cryptographic hashing prior to network transmission. The computed digest serves as the evidence item's immutable primary fingerprint across all subsequent operations.

### Chain-of-Custody Safeguards
1. **Client-Side Baseline Hashing**: Standard `crypto.subtle.digest('SHA-256', buffer)` executed in the browser environment prior to uploading.
2. **Immutable Evidence Records**: Evidence metadata and hash signatures are recorded in Firestore under strict write-once/admin-only policies.
3. **Storage Isolation**: Evidence binary payloads are stored in dedicated Cloud Storage buckets with restricted access paths (`evidence/{caseId}/*`).

---

## Role-Based Access Control (RBAC)

AuthentiVision enforces granular RBAC permissions across all product features:

| Role | Case Creation | Evidence Upload | AI Analysis Execution | Human Review Sign-Off | System Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **INVESTIGATOR** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **ANALYST** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **REVIEWER** | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## Security Audit Logging
All security-relevant actions (authentication, evidence upload, human review sign-off, report generation, role switching) emit structured audit events to the `activity_events` Firestore collection.

Audit logs capture:
- `at`: ISO timestamp
- `actor`: User email / ID
- `action`: Specific operation performed
- `resource`: Affected case, evidence, or analysis ID
- `result`: Outcome (`success`, `warning`, `denied`)

---

## Reporting Security Vulnerabilities
If you discover a security vulnerability within AuthentiVision, please report it immediately to security@authentivision.internal.
