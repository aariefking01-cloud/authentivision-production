# AuthentiVision Architecture

## Frontend

React + TypeScript + Vite + Tailwind CSS.

### Presentation
`src/pages` contains product screens. `src/components` contains reusable visual primitives and layout components.

### Domain layer
`src/lib/av/types.ts` defines forensic records and analysis configuration.
`src/lib/av/mock-data.ts` provides deterministic demo fixtures.
`src/lib/av/services.ts` exposes asynchronous service contracts that can be replaced by API clients.

### Production boundary

Keep the browser responsible for:
- evidence selection and upload UX
- analysis configuration
- progress rendering
- result visualization
- case/evidence/report workflows

Keep the backend responsible for:
- authentication and authorization
- file validation and storage
- hashing and chain-of-custody records
- model inference
- job orchestration
- database persistence
- report signing
- audit logging

Never trust verdicts, scores, filenames, or case permissions supplied by the browser.
