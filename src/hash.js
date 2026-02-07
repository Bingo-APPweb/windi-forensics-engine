// src/hash.js
const crypto = require("crypto");

function stableStringify(obj) {
  // stringify determinístico simples (ordena chaves recursivamente)
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }

  const keys = Object.keys(obj).sort();
  const parts = keys.map(k => JSON.stringify(k) + ":" + stableStringify(obj[k]));
  return "{" + parts.join(",") + "}";
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function computeEventHash(eventCore) {
  // eventCore deve excluir event_hash (obviamente)
  return sha256Hex(stableStringify(eventCore));
}

module.exports = { stableStringify, sha256Hex, computeEventHash };
