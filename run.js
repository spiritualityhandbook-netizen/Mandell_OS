// =====================================================================
// MANDELLISTICS OPERATING SYSTEM: MASTER EXECUTION SWITCH (run.js)
// Complete pipeline: Input → Lexer → Parser → Router → Memory → Visualizer
// =====================================================================

const MandellLexer = require('./engine/mandell_lexer.js');
const MandellParser = require('./engine/mandell_parser.js');
const RupaTRouter = require('./runtime/rupat_router.js');
const HeapManager = require('./memory/heap_manager.js');
const GridRenderer = require('./visualizer/grid_render.js');
const PersonaSnap = require('./persona/persona_snap.js');
const TerminalArchitect = require('./engine/terminal_architect.js');
const SUSX50Auditor = require('./audit/susx50_auditor.js');
const StreamingOutput = require('./runtime/streaming_output.js');
const DellWorkerPool = require('./runtime/dell_worker_pool.js');
const DellDistributor = require('./network/dell_distributor.js');
const PatternDiscovery = require('./insight/pattern_discovery.js');
const SelfModifyingEngine = require('./runtime/self_modifying.js');
const readline = require('readline');

class MandellOS {
  constructor({ stream = false, workers = 0, distributed = false, discover = false, selfmod = false, distributorPort = 8080 } = {}) {
    this.lexer = null;
    this.parser = null;
    this.workerPool = workers > 0 ? new DellWorkerPool(workers) : null;
    this.distributor = distributed ? new DellDistributor(distributorPort) : null;
    this.discovery = discover ? new PatternDiscovery() : null;
    this.selfModEngine = selfmod ? new SelfModifyingEngine() : null;
    this.router = new RupaTRouter({
      workerPool: this.workerPool,
      patternDiscovery: this.discovery,
      selfModEngine: this.selfModEngine,
    });
    this.memory = new HeapManager('./');
    this.visualizer = new GridRenderer();
    this.persona = new PersonaSnap('./persona');
    this.architect = new TerminalArchitect();
    this.coherenceThreshold = 2.0; // Bounded orbit limit
    this.streaming = stream ? new StreamingOutput() : null;

    if (this.streaming) {
      this.streaming.attachConsole();
      this.streaming.send('init', { status: 'STREAMING_ENABLED' });
    }

    if (this.distributor) {
      this.distributor.startServer();
      console.log(`🌐 Dell distributor listening on port ${distributorPort}`);
    }

    if (this.selfModEngine) {
      try {
        this.selfModEngine.ensureSelfModStub();
        console.log('🧠 Self-modifying runtime stub ensured.');
      } catch (error) {
        console.warn('⚠️ Self-modification initialization failed:', error.message);
      }
    }

    this.persona.snapToPersona('Surgical');
  }

  // Bounded Orbit Coherence Equation: C(n+1) = C(n)^2 + Δc
  calculateCoherence(previousCoherence, deltaC = 0.125) {
    return previousCoherence * previousCoherence + deltaC;
  }

  // Validate bounded orbit (prevents semantic drift)
  validateBoundedOrbit(coherenceValue) {
    return Math.abs(coherenceValue) < this.coherenceThreshold;
  }

  validateAgainstPersona(input) {
    const validation = this.persona.validateAgainstTone(input);
    if (!validation.valid) {
      throw new Error(`PersonaViolation: ${validation.violations.join('; ')}`);
    }
  }

  // Main execution pipeline
  async execute(mandellInput) {
    try {
      console.log('╔════════════════════════════════════════╗');
      console.log('║   MANDELL OS - EXECUTION PIPELINE      ║');
      console.log('╚════════════════════════════════════════╝\n');

      this.validateAgainstPersona(mandellInput);
      if (!mandellInput || mandellInput.trim().length === 0) {
        throw new Error('InputError: Provide a Mandell seed or English command sequence.');
      }

      // STEP 1: TOKENIZATION (Lexer)
      console.log('📍 STEP 1: Lexical Analysis...');
      if (this.streaming) this.streaming.send('lexical-analysis', { status: 'start' });
      this.lexer = new MandellLexer(mandellInput);
      const tokens = this.lexer.tokenize();
      console.log(`   ✓ Tokenized: ${tokens.length} tokens extracted\n`);
      if (this.streaming) this.streaming.send('lexical-analysis', { status: 'complete', tokenCount: tokens.length });

      // STEP 2: AST PARSING
      console.log('📍 STEP 2: Abstract Syntax Tree Construction...');
      if (this.streaming) this.streaming.send('ast-parsing', { status: 'start' });
      this.parser = new MandellParser(tokens);
      const ast = this.parser.parse();
      console.log(`   ✓ AST built: ${ast.body.length} nodes\n`);
      if (this.streaming) this.streaming.send('ast-parsing', { status: 'complete', nodeCount: ast.body.length });

      // STEP 3: COHERENCE CHECK (Bounded Orbit Validation)
      console.log('📍 STEP 3: Bounded Orbit Coherence Validation...');
      if (this.streaming) this.streaming.send('coherence-check', { status: 'start' });
      const astCoherence = ast.coherenceOrbits[ast.coherenceOrbits.length - 1] || 1.0;
      if (!this.validateBoundedOrbit(astCoherence)) {
        throw new Error(`BoundaryException: Semantic drift detected (C=${astCoherence})`);
      }
      console.log(`   ✓ Coherence valid: C=${astCoherence.toFixed(3)}\n`);
      if (this.streaming) this.streaming.send('coherence-check', { status: 'complete', coherence: astCoherence });

      // STEP 4: FLOW ROUTING (Runtime Execution)
      console.log('📍 STEP 4: Flow Routing & Execution...');
      if (this.streaming) this.streaming.send('flow-routing', { status: 'start' });
      const executionResult = await this.router.route(ast);
      console.log(`   ✓ Execution complete\n`);
      if (this.streaming) this.streaming.send('flow-routing', { status: 'complete', result: executionResult });

      // STEP 5: MEMORY LOGGING (Hot/Warm/Cold)
      console.log('📍 STEP 5: Memory State Archival...');
      if (this.streaming) this.streaming.send('memory-archival', { status: 'start' });
      this.memory.setFocus(ast.body[0] || null);
      this.memory.pushContext(ast.body.map(node => node.type));
      this.router.getFlowHistory().forEach(step => {
        this.memory.logRupat(step.dell, step.input, step.output);
      });
      this.memory.archiveData('execution', JSON.stringify(executionResult));
      const memState = this.memory.getMemoryState();
      console.log(`   ✓ Warm history: ${memState.warm.rupatCount} rupats`);
      console.log(`   ✓ Cold archive: ${memState.cold.archiveCount} entries\n`);
      if (this.streaming) this.streaming.send('memory-archival', { status: 'complete', memoryState: memState });

      // STEP 6: VISUALIZATION (Grid Render)
      console.log('📍 STEP 6: Spatial Visualization...');
      if (this.streaming) this.streaming.send('visualization', { status: 'start' });
      this.visualizer.clear();
      this.visualizer.autoLayout(ast.body);
      console.log(`   ✓ Grid rendered: ${this.visualizer.getMetrics().nodesPlaced} nodes\n`);
      if (this.streaming) this.streaming.send('visualization', { status: 'complete', nodesPlaced: this.visualizer.getMetrics().nodesPlaced });

      // STEP 7: FINAL OUTPUT
      console.log('╔════════════════════════════════════════╗');
      console.log('║   EXECUTION COMPLETE - FINAL STATE     ║');
      console.log('╚════════════════════════════════════════╝\n');
      if (this.streaming) this.streaming.send('execution-complete', {
        status: 'complete',
        result: executionResult,
        memoryState: memState,
        visualization: this.visualizer.getMetrics(),
      });
      console.log('📊 Result:', JSON.stringify(executionResult, null, 2));
      console.log('\n📋 Grid Visualization:\n');
      console.log(this.visualizer.render());
      console.log(this.visualizer.renderLegend());
      console.log('\n🧪 SUSX50 Audit Summary:');
      console.log(`   - Tokens: ${tokens.length}`);
      console.log(`   - AST nodes: ${ast.body.length}`);
      console.log(`   - Flow edges: ${ast.flowGraph ? ast.flowGraph.length : 0}`);
      console.log(`   - Memory warm entries: ${memState.warm.rupatCount}`);
      console.log(`   - Cold archive entries: ${memState.cold.archiveCount}`);
      return { success: true, result: executionResult };
    } catch (error) {
      if (this.streaming) this.streaming.send('execution-error', { status: 'error', message: error.message });
      console.error('❌ Execution Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Interactive CLI mode
  async startCLI() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  MANDELL OS - INTERACTIVE TERMINAL     ║');
    console.log('║  Type "exit" to quit                   ║');
    console.log('║  Type "help" for English command guide ║');
    console.log('╚════════════════════════════════════════╝\n');

    const prompt = () => {
      rl.question('🎯 Mandell Input > ', async input => {
        if (input.toLowerCase() === 'exit') {
          console.log('\n👋 Shutting down Mandell OS.');
          rl.close();
          return;
        }

        if (input.toLowerCase() === 'help') {
          console.log(this.getHelpText());
          prompt();
          return;
        }

        if (input.trim() === '') {
          prompt();
          return;
        }

        await this.execute(input);
        console.log('');
        prompt();
      });
    };

    prompt();
  }

  getHelpText() {
    return `Mandell OS Help

Core English commands:
  Nova/Start/Origin      -> 00[Nova]
  Solo                   -> 01[Solo]
  Create/Make/Write      -> 08[Create]
  Show/Display/Output    -> 09[Show]
  Change/Edit/Update     -> 04[Change]
  Test/Check             -> 12[Test]
  Bind                   -> 14[Bind]
  Keep/Remember          -> 10[Keep]
  Void                   -> 20[Void]
  Clear/Reset            -> 00[Nova]

Flow arrows supported:
  >>>  =>  ->  ⇶  ⇷  ⇅  ⇳  ↯  ⟲  ↺

Examples:
  Nova -> Create Hello_World.txt -> Show
  Start => Write MyFile.txt => Display
  Origin -> Make ProjectPlan.txt -> Output
  Solo => Keep JournalEntry.txt -> Remember
  Nova ⇶ Create Hello_World.txt ⇶ Show
  Origin -> Write Notes.txt -> Display
  Solo -> Create Hello.txt -> Keep

Natural-style English examples:
  Start create A_Fresh_File and then show it
  Nova make MyNotes.txt and display
  Origin write Journal.txt then output

Commands:
  node run.js help             # Show this guide
  node run.js --interactive                # Start the interactive CLI
  node run.js --audit                      # Run the SUSX50 audit seed
  node run.js --stream                     # Enable streaming output mode
  node run.js --workers=4                  # Run with worker pool for parallel Dell execution
  node run.js --distributed                # Start the Dell network distributor server
  node run.js --discover                   # Enable recursive pattern discovery on ASTs
  node run.js --selfmod                    # Ensure a self-modifying runtime stub is available
  node run.js --dashboard                  # Launch the Mandell web dashboard
  node run.js --interactive --stream       # CLI with streaming updates
  node run.js --stream --workers=4         # Stream with parallel Dell execution
`;
  }
}

// TEST SEED: Absolute Compilation Path
const testSeed = '00[Nova] >>> 08[test_output.txt] >>> 09[Show]';

async function main() {
  const args = process.argv.slice(2);
  const streamEnabled = args.includes('--stream');
  const distributed = args.includes('--distributed');
  const discover = args.includes('--discover');
  const selfmod = args.includes('--selfmod');
  const workersArg = args.find(arg => arg.startsWith('--workers='));
  const workers = workersArg ? Math.max(1, parseInt(workersArg.split('=')[1], 10) || 2) : 0;
  const distributorPortArg = args.find(arg => arg.startsWith('--port='));
  const distributorPort = distributorPortArg ? parseInt(distributorPortArg.split('=')[1], 10) || 8080 : 8080;
  const filteredArgs = args.filter(arg => !['--stream', '--distributed', '--discover', '--selfmod'].some(flag => arg === flag) && !arg.startsWith('--workers=') && !arg.startsWith('--port='));
  const os = new MandellOS({
    stream: streamEnabled,
    workers,
    distributed,
    discover,
    selfmod,
    distributorPort,
  });

  // Check for CLI arguments

  if (filteredArgs.includes('--interactive') || filteredArgs.includes('-i')) {
    // Interactive mode
    await os.startCLI();
  } else if (filteredArgs.includes('--architect')) {
    // Terminal architect interactive mode
    await os.architect.startInteractive();
  } else if (filteredArgs.includes('--dashboard')) {
    const DashboardServer = require('./dashboard/dashboard_server.js');
    await DashboardServer.startServer();
  } else if (filteredArgs.includes('--audit')) {
    console.log('🔎 Running SUSX50 audit harness...');
    const auditor = new SUSX50Auditor();
    const report = await auditor.validateSuite();
    console.log(report.summaryText);
    if (!report.passed) {
      process.exit(1);
    }
  } else {
    const helpRequested = filteredArgs.some(arg => ['help', '--help', '-h'].includes(arg.toLowerCase()));
    if (helpRequested) {
      console.log(os.getHelpText());
      return;
    }
    if (filteredArgs.length > 0) {
      // Execute provided seed
      await os.execute(filteredArgs.join(' '));
    } else {
      // Default: execute test seed
      console.log('📍 Running default test seed...\n');
      await os.execute(testSeed);
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
  });
}

module.exports = MandellOS;
