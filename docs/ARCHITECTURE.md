# AuthentiVision — Technical Architecture & Forensic Pipeline Specification

## Overview
AuthentiVision is an enterprise-grade AI media-forensics platform designed for law enforcement, intelligence agencies, legal teams, and trust & safety departments. It provides cryptographic chain-of-custody tracking, deepfake video detection, face morphing forensic analysis, human examiner review sign-off loops, and automated report generation.

---

## Technical Stack & Architecture

```
[ Browser Client ]
   ├── React 18 + TypeScript + Tailwind CSS
   ├── SHA-256 Web Crypto API (Client-Side Ingestion Hashing)
   └── Firebase Web SDK (Auth, Firestore, Cloud Storage)
          │
          ▼
[ Firebase Platform ]
   ├── Firebase Authentication (RBAC: ADMIN, INVESTIGATOR, ANALYST, REVIEWER)
   ├── Cloud Firestore (Encrypted NoSQL Database for Cases, Analyses, Evidence & Audit Logs)
   └── Firebase Cloud Storage (Sealed Forensic Evidence Storage)
          │
          ▼
[ AI Forensic Service Layer ]
   ├── Pluggable JobRunner Pipeline
   ├── Spatial Artifact Detection
   ├── Temporal Frequency Analysis
   ├── Facial Landmark & Morph Distortions
   └── Calibrated Ensemble Scoring Engine
```

---

## Forensic Processing Pipeline

1. **Ingestion & Cryptographic Hashing**:
   - Files are hashed client-side before upload using standard `crypto.subtle` SHA-256 to establish an immediate immutable baseline.
   - Files are uploaded to Firebase Cloud Storage under `evidence/{caseId}/{timestamp}_{filename}`.
   - An immutable `EvidenceRecord` is written to Firestore containing SHA-256, SHA-1, MD5, size, and timestamp.

2. **AI Inference Pipeline Execution**:
   - The analysis task is dispatched via the modular `JobRunner` service layer.
   - The media file is evaluated across spatial artifacts (texture anomaly, blend boundaries), temporal consistency (flicker, frame jitter), face morphing landmarks, and compression history.
   - Signals are aggregated using calibrated weighting into a final verdict: `authentic`, `deepfake`, `morph`, `suspicious`, or `inconclusive`.

3. **Human Review Loop & Auditability**:
   - Analysts and Peer Reviewers can review spatial heatmaps and temporal confidence timelines.
   - Analysts can confirm or override AI findings with detailed forensic notes.
   - Human decisions are persisted in Firestore alongside an immutable audit trail (`activity_events`).

4. **Forensic Report Generation**:
   - Reports are rendered into official printable forensic PDF format or structured JSON.
   - Each report contains the cryptographic SHA-256 evidence hash, calibrated score breakdowns, signal timeline, and reviewer signature.

---

## Database Schema (Firestore Collections)

- `users/{uid}`: Profile, role, organization, assigned cases.
- `cases/{caseId}`: Case name, description, investigator, status, priority, findings array.
- `analyses/{analysisId}`: Analysis records, verdict, confidence score, detection signals, timeline markers, human review record.
- `evidence/{evidenceId}`: Cryptographic hashes (SHA-256, SHA-1, MD5), storage URL, seal status, case association.
- `reports/{reportId}`: Title, analysis reference, format, creation timestamp, author.
- `activity_events/{eventId}`: Security audit log entries (actor, action, timestamp, ip, resource).

---

## Security & Access Control

- **Role-Based Access Control (RBAC)**: Enforced via Firestore security rules and client role-checking (`ADMIN`, `INVESTIGATOR`, `ANALYST`, `REVIEWER`).
- **Chain of Custody**: Original evidence files are sealed upon upload. Hash verification checks detect any tampering or modification after ingestion.
- **Zero Insecure Secrets**: Firebase client configuration uses public app identifiers while security rules enforce server-side validation.
