// engine/terminal_architect.js
// =====================================================================
// MANDELL INTER-AI PROTOCOL: TERMINAL ARCHITECT BRIDGE
// Integrates external AI models with the Mandell runtime
// Executes AI-generated Mandell seeds locally
// =====================================================================

const PersonaSnap = require('../persona/persona_snap.js');
const HeapManager = require('../memory/heap_manager.js');
const GreekmandellRegistry = require('../lexicon/greekmandell_registry.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class TerminalArchitect {
  constructor(aiApiKey = null, heapManager = null) {
    this.openAiKey = process.env.OPENAI_API_KEY || null;
    this.googleApiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || null;
    this.apiKey = aiApiKey || this.openAiKey || this.googleApiKey;
    this.provider = (process.env.AI_PROVIDER || (this.openAiKey ? 'openai' : 'google')).toLowerCase();
    this.personaSnap = new PersonaSnap();
    this.heapManager = heapManager || new HeapManager(process.cwd());
    this.aiReady = Boolean(this.apiKey);
    this.greekRegistry = GreekmandellRegistry;

    // Load AI system instruction from AI.md or fallback to Gemini.md
    this.aiInstruction = this.loadAIInstruction();
    this.model = process.env.AI_MODEL || (this.provider === 'openai' ? 'gpt-4o-mini' : 'models/text-bison-001');
    this.temperature = parseFloat(process.env.AI_TEMPERATURE || '0.2');
    this._bisimInterval = null;

    // Core persona lock for AbCC enforcement
    this.personaSnap.snapToPersona('Surgical');
    this.personaSnap.lockPersona('Surgical');
  }

  // Build Mandell JSON preamble according to spec
  buildPreamble(extra = {}) {
    const pre = {
      __mandel_preamble: this.getSystemInstruction(),
      __horizon_remaining: extra.tokensRemaining || 8000,
      __fog_status: extra.fogStatus || 'GREEN',
      __last_sync: Date.now(),
      __essence_hash: this.heapManager.getEssenceHash(),
      __schema_version: 'VB.2',
      state: {
        active_focus: this.heapManager.getFocus(),
        delta_target: extra.deltaTarget || null,
        persona_current: this.personaSnap.getCurrentPersona ? this.personaSnap.getCurrentPersona() : 'SOVEREIGN',
        authority_level: extra.authority || 10,
        context_bindings: this.heapManager.getHotContext(),
        tokens_spent: extra.tokensSpent || 0,
        tokens_allocated: extra.tokensAllocated || 8000,
      },
      __instructions: extra.instructions || '',
    };
    return pre;
  }

  // Basic token estimator (bytes -> token-like estimate)
  estimateTokens(text) {
    if (!text) return 0;
    // approximate: 1 token ~ 4 chars (rough heuristic)
    return Math.max(1, Math.ceil(Buffer.from(text, 'utf8').length / 4));
  }

  // Fog monitor: detect token exhaustion and perform silent refresh
  // Returns fog status (GREEN/YELLOW/RED/EMERGENCY) and refresh state
  async fogMonitorAndRefresh(tokensRemaining, extra = {}) {
    const greenThreshold = parseInt(process.env.FOG_GREEN_THRESHOLD || '7000', 10);
    const yellowThreshold = parseInt(process.env.FOG_YELLOW_THRESHOLD || '5000', 10);
    const redThreshold = parseInt(process.env.FOG_RED_THRESHOLD || '2000', 10);
    const emergencyThreshold = parseInt(process.env.FOG_EMERGENCY_THRESHOLD || '500', 10);

    let fogStatus = 'GREEN';
    let refreshed = false;
    let action = null;

    if (tokensRemaining < emergencyThreshold) {
      fogStatus = 'EMERGENCY';
      action = 'EMERGENCY_RESET';
      // Trigger NOVA reset in emergency
      const novaResult = this.heapManager.novaReset('fog_emergency');
      refreshed = true;
      // Emit via WebSocket immediately
      await this.emitFogAlert(fogStatus, tokensRemaining, { novaReset: novaResult });
      return {
        fogStatus,
        tokensRemaining,
        refreshed,
        action,
        timestamp: Date.now(),
        essence: this.heapManager.getEssenceHash(),
        novaReset: novaResult,
      };
    } else if (tokensRemaining < redThreshold) {
      fogStatus = 'RED';
      action = 'SILENT_INJECT';
      // Archive current state and prepare silent inject payload
      const essence = this.heapManager.getEssenceHash();
      const payload = this.buildPreamble({ fogStatus: 'RED', tokensRemaining });
      refreshed = true;
      // Emit fog alert via WebSocket
      await this.emitFogAlert(fogStatus, tokensRemaining, { preamble: payload });
    } else if (tokensRemaining < yellowThreshold) {
      fogStatus = 'YELLOW';
      action = 'MONITOR';
      // Log warning but don't intervene
      console.warn(`[FOG_MONITOR] YELLOW: ${tokensRemaining} tokens remaining`);
      await this.emitFogAlert(fogStatus, tokensRemaining, {});
    } else {
      fogStatus = 'GREEN';
      // Normal operation
    }

    return {
      fogStatus,
      tokensRemaining,
      refreshed,
      action,
      timestamp: Date.now(),
      essence: this.heapManager.getEssenceHash(),
    };
  }

  // Emit fog alert via WebSocket (sub-100ms latency target)
  async emitFogAlert(fogStatus, tokensRemaining, extra = {}) {
    const payload = {
      __silent_inject: true,
      type: 'FOG_ALERT',
      fogStatus,
      tokensRemaining,
      essence_hash: this.heapManager.getEssenceHash(),
      timestamp: Date.now(),
      preamble: extra.preamble || null,
      novaReset: extra.novaReset || null,
    };

    // Check if WebSocket is available (for dashboard connection)
    if (global.dashboardSocket && typeof global.dashboardSocket.emit === 'function') {
      try {
        global.dashboardSocket.emit('fog_alert', payload);
        return { sent: true, via: 'websocket' };
      } catch (e) {
        console.warn('[FOG_MONITOR] WebSocket emit failed:', e.message);
      }
    }

    // Fallback: log to file for async pickup
    try {
      const logPath = path.join(process.cwd(), '.fog_alerts.jsonl');
      fs.appendFileSync(logPath, JSON.stringify(payload) + '\n', 'utf8');
      return { sent: true, via: 'file' };
    } catch (e) {
      console.error('[FOG_MONITOR] Failed to log fog alert:', e.message);
      return { sent: false, error: e.message };
    }
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

    const greekFrame = this.buildGreekmandellFrame();
    const personaFrame = this.buildPersonaFrame();
    return `${greekFrame}${personaFrame}${baseInstruction}${absoluteMandate}`;
  }

  buildGreekmandellFrame() {
    const roots = Object.keys(this.greekRegistry.roots || {}).slice(0, 8).join(', ');
    return `\n[Greekmandell_Frame]\nUse Greekmandell core semantics and root morphology for deep command structure.\nPreferred Greek root examples: ${roots}.\nAlways preserve hyphenated morpheme boundaries, and treat Greek-Latin hybrid blocks as atomic semantic units.\n`;
  }

  buildPersonaFrame() {
    const personaName = this.personaSnap.getCurrentPersona()?.name || 'Surgical';
    const lockStatus = this.personaSnap.isPersonaLocked ? this.personaSnap.isPersonaLocked() : false;
    return `\n[AbCC_Persona_Lock]\nCurrent persona: ${personaName}. Immutable lock: ${lockStatus}.\nAdhere to the locked persona matrix and do not deviate from surgical execution style unless explicitly unlocked.\n`;
  }

  serializePreamble(preamble) {
    return JSON.stringify(preamble, null, 2);
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

      // Estimate tokens and run fog monitor
      const tokensEstimated = this.estimateTokens(mandellCode);
      const tokensRemaining = Math.max(0, 8000 - tokensEstimated);
      await this.fogMonitorAndRefresh(tokensRemaining, { seed });

      // Build mandel preamble wrapper
      const preamble = this.buildPreamble({ tokensRemaining, tokensSpent: tokensEstimated, instructions: seed });

      return {
        status: 'EXECUTED',
        seed,
        preamble,
        mandellCode,
        timestamp: Date.now(),
        provider: aiResult.provider,
        model: aiResult.model,
        tokensEstimated,
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

  // Start BiSync heartbeat: persist warm memory and emit essence hash every 5s
  startBiSync() {
    if (this._bisimInterval) return { status: 'BISYNC_ALREADY_RUNNING' };
    this._bisimInterval = setInterval(() => {
      try {
        this.heapManager.saveWarmMemory();
        const essence = this.heapManager.getEssenceHash();
        // lightweight log for visibility
        console.log('[BISYNC] EssenceHash:', essence.slice(0, 12));
      } catch (e) {
        console.warn('[BISYNC] Error:', e.message);
      }
    }, 5000);
    return { status: 'BISYNC_STARTED' };
  }

  stopBiSync() {
    if (!this._bisimInterval) return { status: 'BISYNC_NOT_RUNNING' };
    clearInterval(this._bisimInterval);
    this._bisimInterval = null;
    return { status: 'BISYNC_STOPPED' };
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
