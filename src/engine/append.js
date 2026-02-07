// src/engine/append.js
const crypto = require("crypto");
const { computeEventHash } = require("../hash");

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

/**
 * appendEvent
 * - cria evento canonicalizado
 * - linka com prev_hash
 * - calcula event_hash
 * - grava no store
 */
async function appendEvent({ store, document_id, type, payload, actor }) {
  const prev_hash = await store.getLastHash(document_id);

  const core = {
    event_id: newId(),
    ts: nowIso(),
    document_id,
    type,
    actor: actor || { system: "unknown" },
    payload: payload || {},
    prev_hash: prev_hash || "GENESIS"
  };

  const event_hash = computeEventHash(core);

  const full = { ...core, event_hash };
  await store.append(full);
  return full;
}

module.exports = { appendEvent };
