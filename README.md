# AuthentiVision

**AI Media Forensics — Deepfake & Face-Morph Detection**

AuthentiVision is a premium forensic analysis interface designed for investigators, analysts, cybersecurity teams, journalists, enterprises, and research environments.

## What is included

- Premium dark-first forensic command-center UI
- Dashboard, analysis intake, results, history, face-morph analysis, batch analysis
- Evidence vault, case management, reports, insights, model performance, threat intelligence
- Responsive navigation and command palette
- Accessibility-conscious controls and keyboard navigation
- Reusable UI primitives and forensic visualization components
- A backend-ready domain service layer under `src/lib/av`
- Clear separation between presentation, domain types, mock data, and service calls

## Important

The current repository is a **frontend demonstration / integration-ready shell**. Detection values are simulated and must not be presented as real model inference.

The service layer is intentionally asynchronous so a production API or on-device inference runtime can replace the simulation without forcing a UI rewrite.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Production integration roadmap

1. Replace `src/lib/av/services.ts` implementations with authenticated API calls.
2. Add object storage for evidence with signed upload URLs.
3. Connect the inference service for video/image deepfake detection and face-morph detection.
4. Persist analyses, cases, evidence, reports, and audit events in a database.
5. Add authentication, RBAC, tenant isolation, rate limiting, and server-side authorization.
6. Move long-running video inference to a job queue with progress events.
7. Generate signed forensic reports and immutable evidence hashes.
8. Add observability, error tracking, security headers, CSP, automated tests, and CI/CD.
