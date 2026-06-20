// tests/heap_manager.test.js
// Unit tests for HeapManager: NOVA reset, essence hash, and Hot/Warm/Cold memory

const HeapManager = require('../memory/heap_manager.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple test runner
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}: ${message}`);
  }
}

function assertTrue(value, message) {
  assert(value === true, message);
}

function assertFalse(value, message) {
  assert(value === false, message);
}

function assertExists(obj, message) {
  assert(obj !== null && obj !== undefined, message);
}

function assertLength(arr, len, message) {
  if (!Array.isArray(arr) || arr.length !== len) {
    throw new Error(`Expected length ${len}, got ${arr.length}: ${message}`);
  }
}

// ============================================================
// TESTS: HeapManager NOVA Reset
// ============================================================

test('HeapManager constructor initializes hot/warm/cold memory', () => {
  const hm = new HeapManager('./');
  const state = hm.getMemoryState();
  
  assertExists(state.hot, 'hot memory should exist');
  assertExists(state.warm, 'warm memory should exist');
  assertExists(state.cold, 'cold memory should exist');
});

test('novaReset() clears hot memory', () => {
  const hm = new HeapManager('./');
  
  // Add some data to hot memory
  hm.setFocus('test_node');
  hm.pushContext(['node1', 'node2']);
  
  let state1 = hm.getMemoryState();
  assert(state1.hot.focus !== null || state1.hot.context.length > 0, 'hot memory should have content before reset');
  
  // Trigger NOVA reset
  const result = hm.novaReset('test_reset');
  
  assertEquals(result.status, 'NOVA_RESET_COMPLETE', 'reset should complete successfully');
  
  // Hot memory should be cleared
  let state2 = hm.getMemoryState();
  assertEquals(state2.hot.focus, null, 'focus should be null after reset');
  assertEquals(state2.hot.context.length, 0, 'context array should be empty after reset');
});

test('novaReset() archives checkpoint to warm memory', () => {
  const hm = new HeapManager('./');
  
  // Add context before reset
  hm.pushContext(['critical_data']);
  
  // Trigger NOVA reset
  const result = hm.novaReset('preservation_test');
  
  // Check that checkpoint was archived
  assertExists(result.checkpoint, 'checkpoint should be created');
  assertEquals(result.checkpoint.type, 'NOVA_RESET', 'checkpoint type should be NOVA_RESET');
  assertEquals(result.checkpoint.reason, 'preservation_test', 'checkpoint should record reason');
  assertExists(result.checkpoint.previousHot, 'checkpoint should preserve previous hot context');
});

test('novaReset() creates checkpoint with timestamp', () => {
  const hm = new HeapManager('./');
  const beforeTime = Date.now();
  
  const result = hm.novaReset('timing_test');
  
  const afterTime = Date.now();
  
  assertExists(result.checkpoint.timestamp, 'checkpoint should have timestamp');
  assert(result.checkpoint.timestamp >= beforeTime && result.checkpoint.timestamp <= afterTime, 'timestamp should be within test window');
});

// ============================================================
// TESTS: Essence Hash
// ============================================================

test('getEssenceHash() returns SHA256 hash', () => {
  const hm = new HeapManager('./');
  
  const hash1 = hm.getEssenceHash();
  
  assertExists(hash1, 'essence hash should exist');
  assertEquals(hash1.length, 64, 'SHA256 hash should be 64 hex characters');
});

test('getEssenceHash() changes after hot memory modification', () => {
  const hm = new HeapManager('./');
  
  const hash1 = hm.getEssenceHash();
  
  // Modify hot memory
  hm.setFocus('new_focus');
  
  const hash2 = hm.getEssenceHash();
  
  assert(hash1 !== hash2, 'essence hash should change when hot memory changes');
});

test('getEssenceHash() changes after NOVA reset', () => {
  const hm = new HeapManager('./');
  
  hm.setFocus('initial_focus');
  const hash1 = hm.getEssenceHash();
  
  hm.novaReset('hash_test');
  const hash2 = hm.getEssenceHash();
  
  assert(hash1 !== hash2, 'essence hash should differ before and after NOVA reset');
});

test('getEssenceHash() is deterministic for same state', () => {
  const hm = new HeapManager('./');
  
  hm.setFocus('fixed_focus');
  
  const hash1 = hm.getEssenceHash();
  const hash2 = hm.getEssenceHash();
  
  assertEquals(hash1, hash2, 'essence hash should be deterministic for same state');
});

// ============================================================
// TESTS: Hot/Warm/Cold Memory Layers
// ============================================================

test('pushContext() adds to hot memory', () => {
  const hm = new HeapManager('./');
  
  hm.pushContext(['item1', 'item2', 'item3']);
  
  const state = hm.getMemoryState();
  assert(state.hot.context && state.hot.context.length > 0, 'context should be added to hot memory');
});

test('logRupat() records to warm memory', () => {
  const hm = new HeapManager('./');
  
  const initialState = hm.getMemoryState();
  const initialRupats = initialState.warm.rupatCount;
  
  hm.logRupat('test_dell', { input: 'test' }, { output: 'result' });
  
  const newState = hm.getMemoryState();
  assert(newState.warm.rupatCount > initialRupats, 'rupat count should increase after logging');
});

test('archiveData() stores to cold memory', () => {
  const hm = new HeapManager('./');
  
  const initialState = hm.getMemoryState();
  const initialArchive = initialState.cold.archiveCount;
  
  hm.archiveData('test_key', 'test_data');
  
  const newState = hm.getMemoryState();
  assert(newState.cold.archiveCount > initialArchive, 'archive count should increase');
});

test('clearHotMemory() explicitly clears hot layer', () => {
  const hm = new HeapManager('./');
  
  hm.setFocus('test_focus');
  hm.pushContext(['data']);
  
  let state1 = hm.getMemoryState();
  assert(state1.hot.focus !== null || state1.hot.context.length > 0, 'hot memory should have content');
  
  hm.clearHotMemory();
  
  let state2 = hm.getMemoryState();
  assertEquals(state2.hot.focus, null, 'focus should be null after clear');
  assertEquals(state2.hot.context.length, 0, 'context should be empty after clear');
});

// ============================================================
// TESTS: Sequential Reset and Recovery
// ============================================================

test('Multiple NOVA resets create separate checkpoints', () => {
  const hm = new HeapManager('./');
  
  hm.setFocus('reset1_focus');
  hm.novaReset('first_reset');
  
  hm.setFocus('reset2_focus');
  hm.novaReset('second_reset');
  
  const state = hm.getMemoryState();
  
  // Warm memory should contain both checkpoints
  assert(state.warm.sessions > 0 || state.cold.archiveCount > 0, 'checkpoints should be stored across resets');
});

test('NOVA reset preserves previous context in checkpoint', () => {
  const hm = new HeapManager('./');
  
  hm.setFocus('important_data');
  hm.pushContext(['critical', 'information']);
  
  const result = hm.novaReset('preservation');
  
  assertExists(result.checkpoint.previousHot, 'previous hot context should be in checkpoint');
});

// ============================================================
// Test Runner
// ============================================================

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  HEAP MANAGER TEST SUITE               ║');
  console.log('╚════════════════════════════════════════╝\n');

  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  RESULTS: ${passed}/${passed + failed} tests passed`);
  console.log(`╚════════════════════════════════════════╝\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { test, assert, assertEquals, assertTrue, assertFalse, assertExists, assertLength };
