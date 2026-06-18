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
const fs = require('fs');
const readline = require('readline');

class MandellOS {
  constructor() {
    this.lexer = null;
    this.parser = null;
    this.router = new RupaTRouter();
    this.memory = new HeapManager('./');
    this.visualizer = new GridRenderer();
    this.persona = new PersonaSnap('./persona');
    this.architect = new TerminalArchitect();
    this.coherenceThreshold = 2.0; // Bounded orbit limit

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
      this.lexer = new MandellLexer(mandellInput);
      const tokens = this.lexer.tokenize();
      console.log(`   ✓ Tokenized: ${tokens.length} tokens extracted\n`);

      // STEP 2: AST PARSING
      console.log('📍 STEP 2: Abstract Syntax Tree Construction...');
      this.parser = new MandellParser(tokens);
      const ast = this.parser.parse();
      console.log(`   ✓ AST built: ${ast.body.length} nodes\n`);

      // STEP 3: COHERENCE CHECK (Bounded Orbit Validation)
      console.log('📍 STEP 3: Bounded Orbit Coherence Validation...');
      const astCoherence = ast.coherenceOrbits[ast.coherenceOrbits.length - 1] || 1.0;
      if (!this.validateBoundedOrbit(astCoherence)) {
        throw new Error(`BoundaryException: Semantic drift detected (C=${astCoherence})`);
      }
      console.log(`   ✓ Coherence valid: C=${astCoherence.toFixed(3)}\n`);

      // STEP 4: FLOW ROUTING (Runtime Execution)
      console.log('📍 STEP 4: Flow Routing & Execution...');
      const executionResult = this.router.route(ast);
      console.log(`   ✓ Execution complete\n`);

      // STEP 5: MEMORY LOGGING (Hot/Warm/Cold)
      console.log('📍 STEP 5: Memory State Archival...');
      this.memory.setFocus(ast.body[0] || null);
      this.memory.pushContext(ast.body.map(node => node.type));
      this.router.getFlowHistory().forEach(step => {
        this.memory.logRupat(step.dell, step.input, step.output);
      });
      this.memory.archiveData('execution', JSON.stringify(executionResult));
      const memState = this.memory.getMemoryState();
      console.log(`   ✓ Warm history: ${memState.warm.rupatCount} rupats`);
      console.log(`   ✓ Cold archive: ${memState.cold.archiveCount} entries\n`);

      // STEP 6: VISUALIZATION (Grid Render)
      console.log('📍 STEP 6: Spatial Visualization...');
      this.visualizer.clear();
      this.visualizer.autoLayout(ast.body);
      console.log(`   ✓ Grid rendered: ${this.visualizer.getMetrics().nodesPlaced} nodes\n`);

      // STEP 7: FINAL OUTPUT
      console.log('╔════════════════════════════════════════╗');
      console.log('║   EXECUTION COMPLETE - FINAL STATE     ║');
      console.log('╚════════════════════════════════════════╝\n');
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
  node run.js help           # Show this guide
  node run.js --interactive  # Start the interactive CLI
  node run.js --audit        # Run the SUSX50 audit seed
`;
  }
}

// TEST SEED: Absolute Compilation Path
const testSeed = '00[Nova] >>> 08[test_output.txt] >>> 09[Show]';

async function main() {
  const os = new MandellOS();

  // Check for CLI arguments
  const args = process.argv.slice(2);

  if (args.includes('--interactive') || args.includes('-i')) {
    // Interactive mode
    await os.startCLI();
  } else if (args.includes('--architect')) {
    // Terminal architect interactive mode
    await os.architect.startInteractive();
  } else if (args.includes('--audit')) {
    console.log('🔎 Running SUSX50 audit harness...');
    const auditor = new SUSX50Auditor();
    const report = auditor.validateSuite();
    console.log(report.summaryText);
    if (!report.passed) {
      process.exit(1);
    }
  } else if (args.length > 0) {
    if (args[0].toLowerCase() === 'help') {
      console.log(os.getHelpText());
      return;
    }
    // Execute provided seed
    await os.execute(args.join(' '));
  } else {
    // Default: execute test seed
    console.log('📍 Running default test seed...\n');
    await os.execute(testSeed);
  }
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
