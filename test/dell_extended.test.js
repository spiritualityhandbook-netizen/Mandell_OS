// test/dell_extended.test.js
// =====================================================================
// MANDELL DELL EXPANSION TEST SUITE (DELLS 26-50)
// Tests manifest-aware Dell implementations and English command mappings
// =====================================================================

const assert = require('assert');
const DellExecutor = require('../runtime/core_dells.js');
const MandellDictionary = require('../engine/MandellDictionary.js');
const MandellLexer = require('../engine/mandell_lexer.js');

function testManifestCatalogExists() {
  const executor = new DellExecutor();
  assert(executor.manifestCatalog, 'Manifest catalog should exist');
  assert(
    Object.keys(executor.manifestCatalog).length >= 25,
    'Manifest catalog should have at least 25 entries (26-50)'
  );

  for (let i = 26; i <= 50; i++) {
    const code = String(i).padStart(2, '0');
    assert(executor.manifestCatalog[code], `Manifest catalog should have entry for Dell ${code}`);
    assert(
      Array.isArray(executor.manifestCatalog[code]),
      `Manifest for Dell ${code} should be an array`
    );
    assert(
      executor.manifestCatalog[code].length === 6,
      `Each Dell should have exactly 6 manifest variants, Dell ${code} has ${executor.manifestCatalog[code].length}`
    );
  }
}

function testManifestSelection() {
  const executor = new DellExecutor();

  // Test manifest selection for Dell 26 (Merge)
  const manifest26 = executor.selectManifest('26', 'dedupe');
  assert(manifest26 && manifest26.key === 'dedupe', 'Should select dedupe variant for Merge');

  // Test default variant selection
  const defaultManifest = executor.selectManifest('27', null);
  assert(
    defaultManifest && defaultManifest.key === 'token',
    'Should default to first variant (token) for Split'
  );

  // Test manifest selection by mode in object
  const manifest30 = executor.selectManifest('30', { mode: 'sum' });
  assert(manifest30 && manifest30.key === 'sum', 'Should select sum variant by mode property');
}

function testDellMerge() {
  const executor = new DellExecutor();

  // Test append merge
  const result1 = executor.merge([1, 2, 3, 4]);
  assert(result1.status === 'MERGED', 'Merge should return MERGED status');
  assert(Array.isArray(result1.result), 'Merge result should be an array');

  // Test with manifest hint (dedupe)
  const result2 = executor.merge({ data: [1, 2, 2, 3, 3], manifest: 'dedupe' });
  assert(result2.manifest === 'dedupe', 'Manifest should be tracked');
  assert(result2.tuning && result2.tuning.dedupe === true, 'Tuning should reflect dedupe setting');
}

function testDellSplit() {
  const executor = new DellExecutor();
  const result = executor.split('hello world test');

  assert(result.status === 'SPLIT', 'Split should return SPLIT status');
  assert(Array.isArray(result.parts), 'Split should return parts array');
  assert(result.parts.length >= 2, 'Split should create multiple parts');
  assert(result.manifest && result.tuning, 'Split should track manifest and tuning');
}

function testDellFilter() {
  const executor = new DellExecutor();
  const testData = [1, 0, 'hello', null, '', 'world', 42];

  // Test truthy filter
  const result = executor.filter(testData);
  assert(result.status === 'FILTERED', 'Filter should return FILTERED status');
  assert(Array.isArray(result.result), 'Filter should return filtered array');
}

function testDellMap() {
  const executor = new DellExecutor();
  const testData = ['a', 'b', 'c'];

  const result = executor.map(testData);
  assert(result.status === 'MAPPED', 'Map should return MAPPED status');
  assert(Array.isArray(result.result), 'Map should return array result');
  assert(result.manifest && result.tuning, 'Map should track manifest and tuning');
}

function testDellReduce() {
  const executor = new DellExecutor();
  const testData = [1, 2, 3, 4, 5];

  const result = executor.reduce(testData);
  assert(result.status === 'REDUCED', 'Reduce should return REDUCED status');
  assert(typeof result.result === 'number', 'Default reduce should return a number');
}

function testDellEncrypt() {
  const executor = new DellExecutor();
  const plaintext = 'secret data';

  // Test base64 encryption
  const result = executor.encrypt(plaintext);
  assert(result.status === 'ENCRYPTED', 'Encrypt should return ENCRYPTED status');
  assert(typeof result.result === 'string', 'Encrypted result should be a string');
  assert(result.manifest && result.tuning, 'Encrypt should track manifest and tuning');
}

function testDellDecrypt() {
  const executor = new DellExecutor();
  const plaintext = 'secret data';

  // Encrypt then decrypt
  const encrypted = executor.encrypt(plaintext);
  assert(encrypted.status === 'ENCRYPTED', 'Encrypt should work');

  const decrypted = executor.decrypt(encrypted.result);
  assert(decrypted.status === 'DECRYPTED', 'Decrypt should return DECRYPTED status');
  assert(typeof decrypted.result === 'string', 'Decrypted result should be a string');
}

function testDellCompressExpand() {
  const executor = new DellExecutor();
  const testData = 'this is test data that should be compressed';

  const compressed = executor.compress2(testData);
  assert(compressed.status === 'COMPRESSED2', 'Compress2 should return COMPRESSED2 status');
  assert(typeof compressed.result === 'string', 'Compressed result should be a string');

  const expanded = executor.expand2(compressed.result);
  assert(expanded.status === 'EXPANDED2', 'Expand2 should return EXPANDED2 status');
}

function testDellAnnotate() {
  const executor = new DellExecutor();
  const testPayload = 'test data';

  const result = executor.annotate(testPayload);
  assert(result.status === 'ANNOTATED', 'Annotate should return ANNOTATED status');
  assert(
    result.result && result.result.annotation,
    'Annotated result should have annotation field'
  );
}

function testDellValidate() {
  const executor = new DellExecutor();
  const testPayload = { name: 'test', value: 42 };

  const result = executor.validate(testPayload);
  assert(result.status === 'VALIDATED', 'Validate should return VALIDATED status');
  assert(typeof result.valid === 'boolean', 'Validate should return valid boolean');
}

function testDellNormalize() {
  const executor = new DellExecutor();
  const testPayload = 'TeSt DaTa';

  const result = executor.normalize(testPayload);
  assert(result.status === 'NORMALIZED', 'Normalize should return NORMALIZED status');
  assert(typeof result.result === 'string', 'Normalized result should be a string');
}

function testDellProfile() {
  const executor = new DellExecutor();
  const testPayload = [1, 2, 3, 4, 5];

  const result = executor.profile(testPayload);
  assert(result.status === 'PROFILED', 'Profile should return PROFILED status');
  assert(
    result.result && result.result.size !== undefined,
    'Profile result should have size metric'
  );
  assert(result.result.type !== undefined, 'Profile result should have type metric');
}

function testDellSimulate() {
  const executor = new DellExecutor();
  const testPayload = { temperature: 0.7, input: 'test' };

  const result = executor.simulate(testPayload);
  assert(result.status === 'SIMULATED', 'Simulate should return SIMULATED status');
  assert(
    result.result && result.result.simulated === true,
    'Simulate should mark result as simulated'
  );
}

function testDellProject() {
  const executor = new DellExecutor();
  const testPayload = { field1: 'value1', field2: 'value2', field3: 'value3' };

  const result = executor.project(testPayload);
  assert(result.status === 'PROJECTED', 'Project should return PROJECTED status');
  assert(result.result, 'Project should return a result');
}

function testDellRoute() {
  const executor = new DellExecutor();
  const testPayload = 'route test';

  const result = executor.route(testPayload);
  assert(result.status === 'ROUTED', 'Route should return ROUTED status');
  assert(result.route !== undefined, 'Route result should have route property');
}

function testDellStage() {
  const executor = new DellExecutor();
  const testPayload = 'stage data';

  const result = executor.stage(testPayload);
  assert(result.status === 'STAGED', 'Stage should return STAGED status');
  assert(result.stage !== undefined, 'Stage result should have stage property');
}

function testDellCache() {
  const executor = new DellExecutor();
  const testPayload = 'cache data';

  const result = executor.cache(testPayload);
  assert(result.status === 'CACHED', 'Cache should return CACHED status');
  assert(result.manifest !== undefined, 'Cache result should have manifest property');
}

function testDellRefresh() {
  const executor = new DellExecutor();
  const testPayload = 'refresh data';

  const result = executor.refresh(testPayload);
  assert(result.status === 'REFRESHED', 'Refresh should return REFRESHED status');
  assert(result.payload !== undefined, 'Refresh result should have payload property');
}

function testDellAlert() {
  const executor = new DellExecutor();
  const testPayload = 'alert message';

  const result = executor.alert(testPayload);
  assert(result.status === 'ALERTED', 'Alert should return ALERTED status');
  assert(result.message !== undefined, 'Alert result should have message property');
}

function testDellCalculate() {
  const executor = new DellExecutor();
  const testPayload = [10, 5, 3];

  const result = executor.calculate(testPayload);
  assert(result.status === 'CALCULATED', 'Calculate should return CALCULATED status');
  assert(result.result !== undefined, 'Calculate result should have result property');
}

function testDellTransform() {
  const executor = new DellExecutor();
  const testPayload = 42;

  const result = executor.transform(testPayload);
  assert(result.status === 'TRANSFORMED', 'Transform should return TRANSFORMED status');
  assert(result.result !== undefined, 'Transform result should have result property');
}

function testDellManifest() {
  const executor = new DellExecutor();
  const testPayload = 'manifest test';

  const result = executor.manifest(testPayload);
  assert(result.status === 'MANIFESTED', 'Manifest should return MANIFESTED status');
  assert(result.action !== undefined, 'Manifest result should have action property');
}

function testEnglishCommandMappings() {
  const commands = [
    'merge',
    'split',
    'filter',
    'map',
    'reduce',
    'sample',
    'rank',
    'encrypt',
    'decrypt',
    'compress',
    'expand',
    'annotate',
    'validate',
    'normalize',
    'profile',
    'simulate',
    'project',
    'route',
    'stage',
    'cache',
    'refresh',
    'alert',
    'calculate',
    'transform',
    'manifest',
  ];

  for (const cmd of commands) {
    const dictEntry = MandellDictionary.commands[cmd];
    assert(dictEntry, `Dictionary should have entry for command: ${cmd}`);
    assert(dictEntry.code, `Command ${cmd} should have a code mapping`);
    assert(
      /^\d{2}$/.test(dictEntry.code),
      `Command ${cmd} code should be 2 digits, got ${dictEntry.code}`
    );
  }
}

function testDellExecutorRegistration() {
  const executor = new DellExecutor();

  // Check that all Dell codes 00-50 are registered
  for (let i = 0; i <= 50; i++) {
    const code = String(i).padStart(2, '0');
    assert(executor.dellRegistry[code], `Dell registry should have executor for code ${code}`);
    assert(
      typeof executor.dellRegistry[code] === 'function',
      `Dell executor for code ${code} should be a function`
    );
  }
}

function testPayloadUnwrapping() {
  const executor = new DellExecutor();

  // Test unwrap with data property
  const wrapped = { data: 'hello world', metadata: 'test' };
  const unwrapped = executor.unwrapPayload(wrapped);
  assert(unwrapped === 'hello world', 'Should unwrap data property');

  // Test unwrap with direct value
  const direct = 'direct value';
  const result = executor.unwrapPayload(direct);
  assert(result === 'direct value', 'Should return direct value if no data property');
}

function testLexerRecognizesNewDells() {
  const testCodes = ['26', '27', '30', '40', '50'];

  for (const code of testCodes) {
    const seed = `${code}[TestDell]`;
    const lexer = new MandellLexer(seed);
    const tokens = lexer.tokenize();
    assert(
      tokens.some(t => t.type === 'DELL' && t.value === code),
      `Lexer should recognize Dell code ${code}`
    );
  }
}

function testLexerRecognizesNewEnglishCommands() {
  const commands = ['merge', 'split', 'filter', 'map', 'reduce', 'encrypt', 'manifest', 'duo', 'tree', 'logic', 'resonate'];

  for (const cmd of commands) {
    const seed = `Start ${cmd} test`;
    const lexer = new MandellLexer(seed);
    const tokens = lexer.tokenize();
    assert(
      tokens.some(t => t.type === 'ENGLISH_COMMAND' && t.value.toLowerCase() === cmd),
      `Lexer should recognize English command: ${cmd}`
    );
  }
}

async function runTests() {
  const tests = [
    { name: 'Manifest catalog exists and complete', fn: testManifestCatalogExists },
    { name: 'Manifest selection works', fn: testManifestSelection },
    { name: 'Dell 26 Merge', fn: testDellMerge },
    { name: 'Dell 27 Split', fn: testDellSplit },
    { name: 'Dell 28 Filter', fn: testDellFilter },
    { name: 'Dell 29 Map', fn: testDellMap },
    { name: 'Dell 30 Reduce', fn: testDellReduce },
    { name: 'Dell 33 Encrypt', fn: testDellEncrypt },
    { name: 'Dell 34 Decrypt', fn: testDellDecrypt },
    { name: 'Dell 35-36 Compress/Expand', fn: testDellCompressExpand },
    { name: 'Dell 37 Annotate', fn: testDellAnnotate },
    { name: 'Dell 38 Validate', fn: testDellValidate },
    { name: 'Dell 39 Normalize', fn: testDellNormalize },
    { name: 'Dell 40 Profile', fn: testDellProfile },
    { name: 'Dell 41 Simulate', fn: testDellSimulate },
    { name: 'Dell 42 Project', fn: testDellProject },
    { name: 'Dell 43 Route', fn: testDellRoute },
    { name: 'Dell 44 Stage', fn: testDellStage },
    { name: 'Dell 45 Cache', fn: testDellCache },
    { name: 'Dell 46 Refresh', fn: testDellRefresh },
    { name: 'Dell 47 Alert', fn: testDellAlert },
    { name: 'Dell 48 Calculate', fn: testDellCalculate },
    { name: 'Dell 49 Transform', fn: testDellTransform },
    { name: 'Dell 50 Manifest', fn: testDellManifest },
    { name: 'English command mappings (26-50)', fn: testEnglishCommandMappings },
    { name: 'Dell executor registration (00-50)', fn: testDellExecutorRegistration },
    { name: 'Payload unwrapping', fn: testPayloadUnwrapping },
    { name: 'Lexer recognizes new Dell codes', fn: testLexerRecognizesNewDells },
    { name: 'Lexer recognizes new English commands', fn: testLexerRecognizesNewEnglishCommands },
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      test.fn();
      console.log(`✔ ${test.name}`);
      passedTests += 1;
    } catch (error) {
      console.error(`✖ ${test.name} — ${error.message}`);
      failedTests += 1;
    }
  }

  return { passedTests, failedTests };
}

module.exports = { runTests };

if (require.main === module) {
  runTests().then(summary => {
    console.log('\nExtended Dell Test Summary');
    console.log('==========================');
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    if (summary.failedTests > 0) process.exit(1);
  });
}
