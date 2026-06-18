const assert = require('assert');
const fs = require('fs');
const path = require('path');
const MandellLexer = require('../engine/mandell_lexer.js');
const MandellParser = require('../engine/mandell_parser.js');
const RupaTRouter = require('../runtime/rupat_router.js');
const HeapManager = require('../memory/heap_manager.js');
const SUSX50Auditor = require('../audit/susx50_auditor.js');

function testLexerSentenceFlow() {
  const seed = 'Start create "My File.txt" and then show it';
  const lexer = new MandellLexer(seed);
  const tokens = lexer.tokenize();

  assert(
    tokens.some(t => t.type === 'FLOW_FORWARD'),
    'Expected a flow token for "and then"'
  );
  assert(
    tokens.some(t => t.type === 'QUOTED_STRING' && t.value === 'My File.txt'),
    'Expected quoted string target token'
  );
  assert(
    tokens.some(t => t.type === 'ENGLISH_COMMAND' && t.value.toLowerCase() === 'start'),
    'Expected "Start" to be recognized as an English command'
  );
}

function testParserSentenceFlow() {
  const seed = 'Start create "My File.txt" and then show it';
  const lexer = new MandellLexer(seed);
  const tokens = lexer.tokenize();
  const parser = new MandellParser(tokens);
  const ast = parser.parse();

  assert(ast.body.length >= 3, 'AST should include multiple command nodes');
  assert(ast.flowGraph.length >= 1, 'AST should build at least one flow edge');
  assert(ast.flowGraph[0].flow === '⇶', 'Flow edge should normalize to forward flow');
}

function testRouterExecution() {
  const tempPath = path.join(__dirname, '..', 'Test_Run_File.txt');
  const seed = `Start -> Create "${tempPath}" -> Show`;
  const lexer = new MandellLexer(seed);
  const tokens = lexer.tokenize();
  const parser = new MandellParser(tokens);
  const ast = parser.parse();
  const router = new RupaTRouter();
  const result = router.route(ast);

  assert(result && result.status === 'DISPLAYED', 'Expected router to return a displayed result');
  assert(
    result.payload && result.payload.status === 'CREATED_FILE',
    'Expected create flow to produce a created file payload'
  );
  assert(result.payload.path === tempPath, 'Expected created file path to match target path');
}

function testNaturalSentenceCreateAndShow() {
  const targetPath = path.join(__dirname, '..', '.test_temp', 'pronoun_file.txt');
  if (!fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }
  const seed = `Start create a file called "${targetPath}" and then show it`;
  const lexer = new MandellLexer(seed);
  const tokens = lexer.tokenize();
  const parser = new MandellParser(tokens);
  const ast = parser.parse();
  const router = new RupaTRouter();
  const result = router.route(ast);

  assert(result && result.status === 'DISPLAYED', 'Expected routed sentence to display');
  assert(
    result.payload && result.payload.status === 'CREATED_FILE',
    'Expected create sentence to make a file'
  );
  assert(
    result.payload.path === targetPath,
    'Expected natural sentence create path to match target'
  );
}

function testFlowOperatorParsing() {
  const seed = 'Start -> Create "FlowFile.txt" then Show it';
  const lexer = new MandellLexer(seed);
  const tokens = lexer.tokenize();
  const parser = new MandellParser(tokens);
  const ast = parser.parse();

  assert(ast.flowGraph.length >= 1, 'Flow graph should include at least one edge');
  assert(
    ast.flowGraph.every(edge => edge.flow === '⇶'),
    'All forward sentence connectors should normalize to ⇶'
  );
}

function testMemoryRagSearch() {
  const tempRoot = path.join(__dirname, '..', '.test_memory_temp');
  if (!fs.existsSync(tempRoot)) {
    fs.mkdirSync(tempRoot, { recursive: true });
  }
  const memory = new HeapManager(tempRoot);
  memory.archiveData('search_test', 'hello world from mandell');
  const results = memory.searchCold('hello');

  assert(Array.isArray(results), 'Expected search results array');
  assert(results.length > 0, 'Expected at least one cold memory search result');
  assert(results[0].label === 'search_test', 'Expected top result label to match archived entry');
}

function testAuditHarness() {
  const auditor = new SUSX50Auditor({ tempRoot: path.join(__dirname, '..', '.audit_temp_test') });
  const report = auditor.validateSuite();

  assert(report.passed, 'Audit harness should pass the default seed suite');
  assert(report.results.length >= 3, 'Audit suite should validate multiple seeds');
}

async function runTests() {
  const tests = [
    { name: 'Lexer sentence flow', fn: testLexerSentenceFlow },
    { name: 'Parser sentence flow', fn: testParserSentenceFlow },
    { name: 'Router execution', fn: testRouterExecution },
    { name: 'Natural sentence create and show', fn: testNaturalSentenceCreateAndShow },
    { name: 'Flow operator parsing', fn: testFlowOperatorParsing },
    { name: 'Memory RAG search', fn: testMemoryRagSearch },
    { name: 'Audit harness pass', fn: testAuditHarness },
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
    console.log('\nTest summary:', summary);
    if (summary.failedTests > 0) process.exit(1);
  });
}
