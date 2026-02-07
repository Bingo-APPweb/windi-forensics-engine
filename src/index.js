// src/index.js
const { MemoryStore } = require("./store/memoryStore");
const { appendEvent } = require("./engine/append");
const { getTimeline } = require("./engine/timeline");
const { verifyChain } = require("./engine/verifyChain");
const { replay } = require("./engine/replay");
const { EventTypes } = require("./schema");

function createForensics({ store } = {}) {
  const s = store || new MemoryStore();

  return {
    store: s,
    EventTypes,

    appendEvent: (args) => appendEvent({ store: s, ...args }),
    getTimeline: (args) => getTimeline({ store: s, ...args }),
    verifyChain: (timeline) => verifyChain(timeline),
    replay: (timeline) => replay(timeline),
  };
}

module.exports = { createForensics, MemoryStore, EventTypes };
