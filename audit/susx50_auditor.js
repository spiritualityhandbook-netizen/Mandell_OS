const fs = require('fs');
const path = require('path');
const MandellLexer = require('../engine/mandell_lexer.js');
const MandellParser = require('../engine/mandell_parser.js');
const TerminalArchitect = require('../engine/terminal_architect.js');
const RupaTRouter = require('../runtime/rupat_router.js');
const HeapManager = require('../memory/heap_manager.js');

class SUSX50Auditor {
  constructor(options = {}) {
    this.coherenceThreshold = options.coherenceThreshold || 2.0;
    this.tempRoot = options.tempRoot || path.join(__dirname, '..', '.audit_temp');
    this.setupTempRoot();
    this.seedSuite = options.seedSuite || this.buildDefaultSuite();
  }

  setupTempRoot() {
    fs.mkdirSync(this.tempRoot, { recursive: true });
  }

  buildDefaultSuite() {
    return [
      {
        name: 'Baseline test seed',
        seed: `Start -> Create "${path.join(this.tempRoot, 'test_output.txt')}" -> Show`,
        expectedResult: {
          status: 'DISPLAYED',
          payload: {
            status: 'CREATED_FILE',
            path: path.join(this.tempRoot, 'test_output.txt'),
          },
        },
      },
      {
        name: 'English flow seed',
        seed: `Start -> Create "${path.join(this.tempRoot, 'english_file.txt')}" -> Show`,
        expectedResult: {
          status: 'DISPLAYED',
          payload: {
            status: 'CREATED_FILE',
            path: path.join(this.tempRoot, 'english_file.txt'),
          },
        },
      },
      {
        name: 'Natural sentence seed',
        seed: `Origin write "${path.join(this.tempRoot, 'sentence_file.txt')}" and then show`,
        expectedResult: {
          status: 'DISPLAYED',
          payload: {
            status: 'CREATED_FILE',
            path: path.join(this.tempRoot, 'sentence_file.txt'),
          },
        },
      },
      {
        name: 'Fog alert audit seed',
        seed: `Start -> Create "${path.join(this.tempRoot, 'fog_file.txt')}" -> Show`,
        expectedResult: {
          status: 'DISPLAYED',
          payload: {
            status: 'CREATED_FILE',
            path: path.join(this.tempRoot, 'fog_file.txt'),
          },
        },
      },
      {
        name: 'Sync integrity audit seed',
        seed: `Start -> Keep "${path.join(this.tempRoot, 'sync_state.txt')}" -> Show`,
      },
    ];
  }

  createMemory() {
    return new HeapManager(this.tempRoot);
  }

  createRouter() {
    return new RupaTRouter();
  }

  async runSeed(item) {
    const lexer = new MandellLexer(item.seed);
    const tokens = lexer.tokenize();
    const parser = new MandellParser(tokens);
    const ast = parser.parse();

    const coherence = ast.coherenceOrbits[ast.coherenceOrbits.length - 1] || 1.0;
    const coherencePass = Math.abs(coherence) < this.coherenceThreshold;
    const tokenPass = tokens.length > 0;
    const astPass = ast.body.length > 0;
    const flowPass = ast.flowGraph && ast.flowGraph.length > 0;

    const router = this.createRouter();
    const executionResult = await router.route(ast);

    const memory = this.createMemory();
    memory.setFocus(ast.body[0] || null);
    memory.pushContext(ast.body.map(node => node.type));
    router.getFlowHistory().forEach(step => memory.logRupat(step.dell, step.input, step.output));
    memory.archiveData('audit:' + item.name, JSON.stringify(executionResult));
    const memState = memory.getMemoryState();

    const fogSyncChecks = await this.validateFogAndSync(memory, executionResult);
    const memoryPass = memState.warm.rupatCount > 0 && memState.cold.archiveCount > 0;
    const resultPass = item.expectedResult
      ? JSON.stringify(executionResult) === JSON.stringify(item.expectedResult)
      : true;

    const finalPass =
      tokenPass &&
      astPass &&
      flowPass &&
      coherencePass &&
      memoryPass &&
      resultPass &&
      fogSyncChecks.fogPass &&
      fogSyncChecks.emergencyPass &&
      fogSyncChecks.syncPass;

    return {
      name: item.name,
      seed: item.seed,
      tokens,
      ast,
      executionResult,
      memState,
      fogSyncChecks,
      checks: {
        tokenPass,
        astPass,
        flowPass,
        coherencePass,
        memoryPass,
        resultPass,
        fogPass: fogSyncChecks.fogPass,
        emergencyPass: fogSyncChecks.emergencyPass,
        syncPass: fogSyncChecks.syncPass,
      },
      passed: finalPass,
    };
  }

  async validateFogAndSync(memory, executionResult) {
    const architect = new TerminalArchitect(null, memory);
    const redResult = await architect.fogMonitorAndRefresh(1500, {});
    const emergencyResult = await architect.fogMonitorAndRefresh(400, {});
    const essenceHash = memory.getEssenceHash();
    const syncArchive = memory.archiveData('sync_check', JSON.stringify(executionResult));
    const searchResults = memory.searchCold('audit');

    return {
      fogPass: redResult.fogStatus === 'RED' && redResult.refreshed === true,
      emergencyPass:
        !!(
          emergencyResult.fogStatus === 'EMERGENCY' &&
          emergencyResult.action === 'EMERGENCY_RESET' &&
          emergencyResult.novaReset
        ),
      syncPass:
        typeof essenceHash === 'string' &&
        syncArchive &&
        Array.isArray(searchResults) &&
        searchResults.length > 0,
    };
  }

  async validateSuite() {
    const results = await Promise.all(this.seedSuite.map(seed => this.runSeed(seed)));
    const passed = results.every(result => result.passed);
    const lines = results.map(result => {
      const status = result.passed ? 'PASS' : 'FAIL';
      const checks = result.checks;
      const failed = Object.keys(checks).filter(key => !checks[key]);
      return `- ${result.name}: ${status}${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`;
    });

    const summaryText = [
      'SUSX50 Audit Report',
      '===================',
      ...lines,
      `\nOverall result: ${passed ? 'PASS' : 'FAIL'}`,
    ].join('\n');

    return { passed, results, summaryText };
  }
}

module.exports = SUSX50Auditor;
