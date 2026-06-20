// memory/heap_manager.js
// =====================================================================
// MANDELL MEMORY MANAGEMENT: HYPO-THERMIA EXECUTION GRID
// Hot Memory: Current active context
// Warm Memory: Recent session history
// Cold Memory: Vector search RAG archive
// =====================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class HeapManager {
  constructor(workspaceRoot = './') {
    this.workspaceRoot = workspaceRoot;

    // Hot Memory: Active RAM variables
    this.hotMemory = {
      focus: null, // Current focus node
      context: [], // Active context stack
      temperature: 26, // Ambient heat level
    };

    // Warm Memory: Recent history log
    this.warmMemoryFile = path.join(workspaceRoot, 'memory', 'session_history.json');
    this.warmMemory = this.loadWarmMemory();

    // Cold Memory: Archive for RAG
    this.coldMemoryFile = path.join(workspaceRoot, 'memory', 'archive.json');
    this.coldMemory = this.loadColdMemory();

    // Temperature layers for hypo-thermia
    this.tempLayers = {
      hot: 26, // Immediate next (Temp[C])
      warm: 50, // Two ahead (Temp[W])
      hypo: 100, // Highest probability path (Temp[H])
    };
  }

  // NOVA: Absolute reset — clears HotContext and records a warm checkpoint
  novaReset(reason = 'manual') {
    const prevHot = { ...this.hotMemory };
    this.clearHotMemory();
    const checkpoint = {
      type: 'NOVA_RESET',
      reason,
      previousHot: prevHot,
      timestamp: Date.now(),
    };
    // Archive the checkpoint into warm memory and cold archive
    this.warmMemory.sessions = this.warmMemory.sessions || [];
    this.warmMemory.sessions.push(checkpoint);
    this.saveWarmMemory();
    this.archiveData('nova_reset_' + Date.now(), JSON.stringify(checkpoint));
    return { status: 'NOVA_RESET_COMPLETE', checkpoint };
  }

  // ============ HOT MEMORY OPERATIONS ============
  setFocus(node) {
    this.hotMemory.focus = node;
    return { status: 'FOCUS_SET', node };
  }

  getFocus() {
    return this.hotMemory.focus;
  }

  pushContext(value) {
    this.hotMemory.context.push(value);
    return { status: 'CONTEXT_PUSHED', depth: this.hotMemory.context.length };
  }

  popContext() {
    const value = this.hotMemory.context.pop();
    return { status: 'CONTEXT_POPPED', value };
  }

  peekContext() {
    return this.hotMemory.context[this.hotMemory.context.length - 1] || null;
  }

  getHotContext() {
    return [...this.hotMemory.context];
  }

  clearHotMemory() {
    this.hotMemory.context = [];
    this.hotMemory.focus = null;
    return { status: 'HOT_CLEARED' };
  }

  // ============ WARM MEMORY OPERATIONS ============
  loadWarmMemory() {
    try {
      if (fs.existsSync(this.warmMemoryFile)) {
        const data = fs.readFileSync(this.warmMemoryFile, 'utf8');
        return JSON.parse(data);
      }
    } catch {
      // Fallback: empty history
    }
    return { sessions: [], rupats: [] };
  }

  logRupat(dellCode, input, output) {
    const rupat = {
      timestamp: Date.now(),
      dell: dellCode,
      input,
      output,
    };
    this.warmMemory.rupats.push(rupat);
    this.saveWarmMemory();
    return rupat;
  }

  saveWarmMemory() {
    try {
      const dir = path.dirname(this.warmMemoryFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.warmMemoryFile, JSON.stringify(this.warmMemory, null, 2), 'utf8');
      return { status: 'WARM_SAVED' };
    } catch (err) {
      return { status: 'ERROR_SAVE_WARM', error: err.message };
    }
  }

  getWarmHistory(limit = 10) {
    return this.warmMemory.rupats.slice(-limit);
  }

  // ============ COLD MEMORY / RAG OPERATIONS ============
  loadColdMemory() {
    try {
      if (fs.existsSync(this.coldMemoryFile)) {
        const data = fs.readFileSync(this.coldMemoryFile, 'utf8');
        return JSON.parse(data);
      }
    } catch {
      // Fallback: empty archive
    }
    return { vectors: [], archive: [] };
  }

  vectorizeContent(content) {
    // Simple BPE-like vectorization: split into tokens
    const tokens = content.toString().split(/\s+/).slice(0, 10);
    return tokens.map(t => t.charCodeAt(0) || 0);
  }

  archiveData(label, content, vectors = null) {
    const entry = {
      label,
      content,
      vectors: vectors || this.vectorizeContent(content),
      timestamp: Date.now(),
    };
    this.coldMemory.archive.push(entry);
    this.saveColdMemory();
    return entry;
  }

  saveColdMemory() {
    try {
      const dir = path.dirname(this.coldMemoryFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.coldMemoryFile, JSON.stringify(this.coldMemory, null, 2), 'utf8');
      return { status: 'COLD_SAVED' };
    } catch (err) {
      return { status: 'ERROR_SAVE_COLD', error: err.message };
    }
  }

  // Vector search: find similar entries by cosine similarity
  searchCold(query, topK = 5) {
    const queryVectors = this.vectorizeContent(query);

    const scored = this.coldMemory.archive.map(entry => {
      const similarity = this.cosineSimilarity(queryVectors, entry.vectors);
      return { ...entry, score: similarity };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return normA && normB ? dotProduct / (normA * normB) : 0;
  }

  // ============ HYPO-THERMIA PREDICTION ============
  predictNextDell(currentContext) {
    // Immediate next: Hot layer
    const hotPrediction = this.predictAtLayer(currentContext, this.tempLayers.hot);

    // Two steps ahead: Warm layer
    const warmPrediction = this.predictAtLayer(currentContext, this.tempLayers.warm);

    // Highest probability: Hypo layer
    const hypoPrediction = this.predictAtLayer(currentContext, this.tempLayers.hypo);

    return {
      immediate: hotPrediction,
      twoAhead: warmPrediction,
      highest: hypoPrediction,
    };
  }

  predictAtLayer(context, temp) {
    // Simple prediction: based on recent rupat history
    const recent = this.warmMemory.rupats.slice(-5);
    if (recent.length === 0) return null;

    return {
      probable: recent[recent.length - 1].dell,
      confidence: temp / 100,
      temperature: temp,
    };
  }

  // ============ STATE INSPECTION ============
  getMemoryState() {
    return {
      hot: this.hotMemory,
      warm: {
        sessionCount: this.warmMemory.sessions.length,
        rupatCount: this.warmMemory.rupats.length,
      },
      cold: { archiveCount: this.coldMemory.archive.length },
    };
  }

  // Essence hash: SHA256 of hot+warm top-level summary
  getEssenceHash() {
    const essence = JSON.stringify({ hot: this.hotMemory, warmSummary: { sessions: this.warmMemory.sessions.length, rupats: this.warmMemory.rupats.length } });
    return crypto.createHash('sha256').update(essence).digest('hex');
  }
}

module.exports = HeapManager;
