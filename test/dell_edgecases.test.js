const assert = require('assert');
const DellExecutor = require('../runtime/core_dells.js');

function testDeepMergeDeeperVariant() {
  const executor = new DellExecutor();
  const payload = { data: [[{ a: { x: 1 } }, { a: { y: 2 } }], [{ b: 3 }]], manifest: 'deeper' };
  const res = executor.merge(payload);
  if (!Array.isArray(res.result)) throw new Error('Expected merged result array');
  // deep merge behavior in this implementation flattens nested arrays
  assert(
    res.result.some(item => item.a && (item.a.x === 1 || item.a.y === 2)),
    'Deep merge should preserve nested object entries'
  );
}

function testApplyManifestSettings() {
  const executor = new DellExecutor();
  const manifest = executor.selectManifest('26', { manifest: 'blend' });
  const wrapped = { data: [1, 2, 3], info: 'test' };
  const applied = executor.applyManifestSettings(manifest, wrapped);
  assert(applied.manifest === manifest.key, 'applyManifestSettings should attach manifest key');
  assert(
    applied.tuning && applied.tuning.blend === true,
    'applyManifestSettings should include tuning'
  );
}

function testManifestApplyDell50() {
  const executor = new DellExecutor();
  const res = executor.manifest({ manifest: 'describe' });
  assert(res.status === 'MANIFESTED', 'Manifest Dell should return MANIFESTED');
}

function run() {
  const tests = [
    { name: 'Deep merge (deeper)', fn: testDeepMergeDeeperVariant },
    { name: 'applyManifestSettings', fn: testApplyManifestSettings },
    { name: 'Dell 50 manifest apply', fn: testManifestApplyDell50 },
  ];

  let passed = 0;
  let failed = 0;
  for (const t of tests) {
    try {
      t.fn();
      console.log('✔', t.name);
      passed++;
    } catch (e) {
      console.error('✖', t.name, e.message);
      failed++;
    }
  }
  console.log('\nEdge-case tests:', { passed, failed });
  if (failed > 0) process.exit(1);
}

if (require.main === module) run();
module.exports = { run };
