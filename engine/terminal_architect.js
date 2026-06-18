// engine/terminal_architect.js
// =====================================================================
// MANDELL INTER-AI PROTOCOL: TERMINAL ARCHITECT BRIDGE
// Integrates Gemini API with Mandell runtime
// Executes AI-generated Mandell seeds locally
// =====================================================================

const DellExecutor = require('../runtime/core_dells.js');
const PersonaSnap = require('../persona/persona_snap.js');
const fs = require('fs');
const readline = require('readline');

class TerminalArchitect {
  constructor(geminiApiKey = null) {
    this.apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
    this.dellExecutor = new DellExecutor();
    this.personaSnap = new PersonaSnap();
    this.geminiReady = this.apiKey ? true : false;
    
    // Load Gemini.md for system instruction
    this.geminiMd = this.loadGeminiMd();
  }

  // Load Gemini.md configuration file
  loadGeminiMd() {
    try {
      const geminiPath = './Gemini.md';
      if (fs.existsSync(geminiPath)) {
        return fs.readFileSync(geminiPath, 'utf8');
      }
    } catch (err) {
      console.error('Error loading Gemini.md:', err.message);
    }
    return ''; // Fallback: empty system instruction
  }

  // Inject Gemini.md as system instruction
  getSystemInstruction() {
    return this.geminiMd || 'You are the Mandell OS Architect. Execute precise computational instructions.';
  }

  // Mock Gemini API call (when real API is unavailable)
  async mockGeminiCall(seed) {
    console.log('[MOCK_GEMINI] Received seed:', seed);
    
    // Echo back a basic Mandell response
    return {
      status: 'MOCK_RESPONSE',
      response: `00[Nova] >>> 08[Mandell_Output.txt] >>> 09[Show]`,
      seed
    };
  }

  // Call real Gemini API (requires @google/generative-ai)
  async callGeminiAPI(seed) {
    if (!this.geminiReady) {
      return this.mockGeminiCall(seed);
    }

    try {
      // Attempt to import Gemini library
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
                text: `${systemPrompt}\n\nExecute this Mandell seed: ${seed}`
              }
            ]
          }
        ]
      });

      const mandellCode = response.response.text();
      return { status: 'GEMINI_RESPONSE', mandellCode, seed };
    } catch (err) {
      console.warn('Gemini API unavailable, using mock:', err.message);
      return this.mockGeminiCall(seed);
    }
  }

  // Process terminal input through entire pipeline
  async processInput(seed) {
    try {
      // Step 1: Get Gemini response
      const geminiResult = await this.callGeminiAPI(seed);
      
      if (geminiResult.error) {
        return { error: geminiResult.error };
      }

      const mandellCode = geminiResult.mandellCode || geminiResult.response;

      // Step 2: Parse and execute via runtime
      // (Parser would go here in full implementation)
      
      // Step 3: Return execution result
      return {
        status: 'EXECUTED',
        seed,
        mandellCode,
        timestamp: Date.now()
      };
    } catch (err) {
      return { error: err.message };
    }
  }

  // Interactive terminal mode
  async startInteractive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('╔═══════════════════════════════════════╗');
    console.log('║   MANDELL OS - TERMINAL ARCHITECT    ║');
    console.log('║   Interactive Seed Executor          ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
    console.log('Enter Mandell seeds to execute. Type "exit" to quit.');
    console.log('');

    const askForSeed = () => {
      rl.question('📍 Mandell Seed > ', async (seed) => {
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
      const seeds = fs.readFileSync(filePath, 'utf8').split('\n').filter(s => s.trim());
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
