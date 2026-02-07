# windi-forensics-engine

Audit trail e replay determinístico para o WINDI.

Part of the **WINDI** (Worldwide Infrastructure for Non-repudiable Document Integrity) ecosystem.

## Features (MVP)

- **Append-only event log** por document_id
- **Cadeia hash encadeada** (prev_hash → event_hash)
- **verifyChain()** detecta adulteração
- **replay()** reconstrói estado final (verify/policy/payment)
- **Adapters**: in-memory agora; pronto para Postgres/SQLite

## Installation

```bash
npm install windi-forensics-engine
```

## Usage

```js
const { createForensics, EventTypes } = require("windi-forensics-engine");

const fx = createForensics();

// Append verification result
await fx.appendEvent({
  document_id: "INV-2025-0001",
  type: EventTypes.VERIFY_RESULT,
  payload: { verdict: "VALID", integrity: "INTACT", trust_level: "HIGH" },
  actor: { system: "verification-api", instance_id: "api-1" }
});

// Append policy decision
await fx.appendEvent({
  document_id: "INV-2025-0001",
  type: EventTypes.POLICY_DECISION,
  payload: { decision: "ALLOW", reason_codes: [] },
  actor: { system: "policy-engine", instance_id: "pe-1" }
});

// Get timeline and verify chain integrity
const timeline = await fx.getTimeline({ document_id: "INV-2025-0001" });
const check = fx.verifyChain(timeline);
console.log(check); // { ok: true, problems: [] }

// Replay to get final state
const state = fx.replay(timeline);
console.log(state);
// {
//   document_id: "INV-2025-0001",
//   verify: { verdict: "VALID", ... },
//   policy: { decision: "ALLOW", ... },
//   payment: null,
//   notes: []
// }
```

## Event Types

| Type | Description |
|------|-------------|
| `VERIFY_CALLED` | Verification API was called |
| `VERIFY_RESULT` | Verification result received |
| `POLICY_DECISION` | Policy engine decision |
| `PAYMENT_ACTION` | Payment executed/held/blocked |
| `NOTE` | Manual annotation |

## Event Structure (WCAF)

```json
{
  "event_id": "uuid",
  "ts": "2026-02-08T12:00:00Z",
  "document_id": "INV-2025-0001",
  "type": "VERIFY_RESULT",
  "actor": {
    "system": "verification-api",
    "instance_id": "api-1"
  },
  "payload": { ... },
  "prev_hash": "sha256:...",
  "event_hash": "sha256:..."
}
```

## Chain Verification

The engine maintains a hash chain:

```
GENESIS → event_hash[0] → event_hash[1] → event_hash[2] → ...
```

Each event stores:
- `prev_hash`: hash of the previous event (or "GENESIS")
- `event_hash`: SHA-256 of the canonicalized event core

**Tampering detection:**
- If any event is modified, `verifyChain()` returns `{ ok: false, problems: [...] }`
- Problems include `CHAIN_BREAK` (prev_hash mismatch) and `HASH_MISMATCH` (content changed)

## Integration with WINDI Flow

```
SDK → Verification API → Policy Engine → Bank Core
         │                    │              │
         ▼                    ▼              ▼
    VERIFY_RESULT      POLICY_DECISION  PAYMENT_ACTION
         │                    │              │
         └────────────────────┴──────────────┘
                              │
                              ▼
                    Forensics Engine (append)
```

## Testing

```bash
npm test
```

## Position in the WINDI Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WINDI Ecosystem                       │
├─────────────────────────────────────────────────────────┤
│  windi-reader-sdk        — Client SDK                    │
│  windi-policy-engine     — Risk decisions                │
│  windi-proof-spec        — Proof specification           │
│  windi-verification-api  — Backend API                   │
│  windi-forensics-engine ◄── YOU ARE HERE                │
│  windi-wcaf-toolkit      — Compliance CLI                │
│  windi-core-reference    — Architecture docs             │
└─────────────────────────────────────────────────────────┘
```

## Related Repositories

- [windi-verification-api](https://github.com/Bingo-APPweb/windi-verification-api) — Verification API
- [windi-policy-engine](https://github.com/Bingo-APPweb/windi-policy-engine) — Policy Engine
- [windi-wcaf-toolkit](https://github.com/Bingo-APPweb/windi-wcaf-toolkit) — WCAF CLI

## License

Apache 2.0 — See [LICENSE](LICENSE)
