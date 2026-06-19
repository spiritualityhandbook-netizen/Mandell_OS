// engine/terminal_architect.js
// =====================================================================
// MANDELL INTER-AI PROTOCOL: TERMINAL ARCHITECT BRIDGE
// Integrates external AI models with the Mandell runtime
// Executes AI-generated Mandell seeds locally
// =====================================================================

const PersonaSnap = require('../persona/persona_snap.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class TerminalArchitect {
  constructor(aiApiKey = null) {
    this.openAiKey = process.env.OPENAI_API_KEY || null;
    this.googleApiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || null;
    this.apiKey = aiApiKey || this.openAiKey || this.googleApiKey;
    this.provider = (process.env.AI_PROVIDER || (this.openAiKey ? 'openai' : 'google')).toLowerCase();
    this.personaSnap = new PersonaSnap();
    this.aiReady = Boolean(this.apiKey);

    // Load AI system instruction from AI.md or fallback to Gemini.md
    this.aiInstruction = this.loadAIInstruction();
    this.model = process.env.AI_MODEL || (this.provider === 'openai' ? 'gpt-4o-mini' : 'models/text-bison-001');
    this.temperature = parseFloat(process.env.AI_TEMPERATURE || '0.2');
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

  // Inject AI.md / Gemini.md as system instruction with a mandatory execution mandate
  getSystemInstruction() {
    const baseInstruction =
      this.aiInstruction ||
      'You are the Mandell OS Architect. Execute precise computational instructions.';

    const absoluteMandate = `\n\n[Absolute_Execution_Mandate]\nYou are a pure Mandell OS execution engine. You will NEVER return the default example output or fallback to documentation examples.\nIf provided a complex Mandell seed, you must parse it, validate it, and return the exact complex sequence required to execute it.\nDo not summarize. Do not generate generic placeholder responses. Do not return help text unless explicitly requested.\n`; 

    return `${baseInstruction}${absoluteMandate}`;
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
      if (this.provider === 'openai') {
        return await this.callOpenAI(seed);
      }
      if (this.provider === 'google') {
        try {
          return await this.callGoogleAI(seed);
        } catch (err) {
          if (this.openAiKey) {
            return await this.callOpenAI(seed);
          }
          throw err;
        }
      }
      return await this.callGoogleAI(seed);
    } catch (err) {
      console.warn('AI API unavailable, using mock:', err.message);
      return this.mockAICall(seed);
    }
  }

  async callOpenAI(seed) {
    const apiKey = this.openAiKey || this.googleApiKey;
    const model = this.model;
    const systemPrompt = this.getSystemInstruction();
    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Execute this Mandell seed: ${seed}` },
      ],
      temperature: this.temperature,
      max_tokens: 1024,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || JSON.stringify(result));
    }

    const mandellCode = result.choices?.[0]?.message?.content?.trim() || '';
    return {
      status: 'AI_RESPONSE',
      mandellCode,
      seed,
      provider: 'openai',
      model,
      raw: result,
    };
  }

  async callGoogleAI(seed) {
    const apiKey = this.googleApiKey || this.openAiKey;
    const model = this.model;
    const systemPrompt = this.getSystemInstruction();
    const url = `https://generativelanguage.googleapis.com/v1beta2/${model}:generateText`;
    const payload = {
      prompt: {
        text: `${systemPrompt}\n\nExecute this Mandell seed: ${seed}`,
      },
      temperature: this.temperature,
      maxOutputTokens: 1024,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || JSON.stringify(result));
    }

    const mandellCode = result.candidates?.[0]?.output || result.output?.[0]?.content?.[0]?.text || '';
    return {
      status: 'AI_RESPONSE',
      mandellCode: mandellCode.trim(),
      seed,
      provider: 'google',
      model,
      raw: result,
    };
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

      return {
        status: 'EXECUTED',
        seed,
        mandellCode,
        timestamp: Date.now(),
        provider: aiResult.provider,
        model: aiResult.model,
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
