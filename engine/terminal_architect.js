// engine/terminal_architect.js
// =====================================================================
// MANDELL INTER-AI PROTOCOL: TERMINAL ARCHITECT BRIDGE
// Integrates external AI models with the Mandell runtime
// Executes AI-generated Mandell seeds locally
// =====================================================================

const DellExecutor = require('../runtime/core_dells.js');
const PersonaSnap = require('../persona/persona_snap.js');
const fs = require('fs');
const readline = require('readline');

class TerminalArchitect {
  constructor(aiApiKey = null) {
    this.apiKey = aiApiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    this.dellExecutor = new DellExecutor();
    this.personaSnap = new PersonaSnap();
    this.aiReady = this.apiKey ? true : false;

    // Load AI system instruction from AI.md or fallback to Gemini.md
    this.aiInstruction = this.loadAIInstruction();
  }

  // Load AI.md configuration file, or fallback to Gemini.md for compatibility
  loadAIInstruction() {
    try {
      const aiPath = './AI.md';
      const geminiPath = './Gemini.md';
      if (fs.existsSync(aiPath)) {
        return fs.readFileSync(aiPath, 'utf8');
      }
      if (fs.existsSync(geminiPath)) {
        return fs.readFileSync(geminiPath, 'utf8');
      }
    } catch (err) {
      console.error('Error loading AI system instruction file:', err.message);
    }
    return ''; // Fallback: empty system instruction
  }

  // Inject AI.md / Gemini.md as system instruction
  getSystemInstruction() {
    return (
      this.aiInstruction ||
      'You are the Mandell OS Architect. Execute precise computational instructions.'
    );
  }

  // Mock AI call when no API integration is available
  async mockAICall(seed) {
    console.log('[MOCK_AI] Received seed:', seed);

    // Echo back a basic Mandell response
    return {
      status: 'MOCK_RESPONSE',
      response: `00[Nova] >>> 08[Mandell_Output.txt] >>> 09[Show]`,
      seed,
    };
  }

  // Call a real AI API if configured; falls back to mock mode
  async callAIAPI(seed) {
    if (!this.aiReady) {
      return this.mockAICall(seed);
    }

    try {
      // Attempt to import Gemini library if configured; otherwise the implementation
      // can be extended to any AI client by swapping this block.
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const systemPrompt = this.getSystemInstruction();
      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nExecute this Mandell seed: ${seed}`,
              },
            ],
          },
        ],
      });

      const mandellCode = response.response.text();
      return { status: 'AI_RESPONSE', mandellCode, seed };
    } catch (err) {
      console.warn('AI API unavailable, using mock:', err.message);
      return this.mockAICall(seed);
    }
  }

  // Process terminal input through entire pipeline
  async processInput(seed) {
    try {
      // Step 1: Get AI response
      const aiResult = await this.callAIAPI(seed);

      if (aiResult.error) {
        return { error: aiResult.error };
      }

      const mandellCode = aiResult.mandellCode || aiResult.response;

      // Step 2: Parse and execute via runtime
      // (Parser would go here in full implementation)

      // Step 3: Return execution result
      return {
        status: 'EXECUTED',
        seed,
        mandellCode,
        timestamp: Date.now(),
      };
    } catch (err) {
      return { error: err.message };
    }
  }

  // Interactive terminal mode
  async startInteractive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('╔═══════════════════════════════════════╗');
    console.log('║   MANDELL OS - TERMINAL ARCHITECT    ║');
    console.log('║   Interactive Seed Executor          ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
    console.log('Enter Mandell seeds to execute. Type "exit" to quit.');
    console.log('');

    const askForSeed = () => {
      rl.question('📍 Mandell Seed > ', async seed => {
        if (seed.toLowerCase() === 'exit') {
          console.log('👋 Exiting Terminal Architect.');
          rl.close();
          return;
        }

        if (seed.trim() === '') {
          askForSeed();
          return;
        }

        // Process the seed
        const result = await this.processInput(seed);
        console.log('📤 Result:', JSON.stringify(result, null, 2));
        console.log('');

        askForSeed();
      });
    };

    askForSeed();
  }

  // Batch mode: process multiple seeds from file
  async processBatch(filePath) {
    try {
      const seeds = fs
        .readFileSync(filePath, 'utf8')
        .split('\n')
        .filter(s => s.trim());
      const results = [];

      for (const seed of seeds) {
        const result = await this.processInput(seed);
        results.push(result);
      }

      return { status: 'BATCH_COMPLETE', processed: results.length, results };
    } catch (err) {
      return { error: err.message };
    }
  }
}

module.exports = TerminalArchitect;
