// runtime/rupat_router.js
// =====================================================================
// MANDELL FLOW ENGINE: RUPAT ROUTER & VOID ISOLATOR
// Routes payload flows through sequential Dells with >>> arrows
// Implements Void Sandbox mode for isolated computation
// =====================================================================

const DellExecutor = require('./core_dells.js');

class RupaTRouter {
  constructor({ workerPool = null, patternDiscovery = null, selfModEngine = null } = {}) {
    this.dellExecutor = new DellExecutor();
    this.workerPool = workerPool;
    this.patternDiscovery = patternDiscovery;
    this.selfModEngine = selfModEngine;
    this.voidMode = false; // Void Isolator state
    this.outputBuffer = []; // Accumulated outputs (cleared by 09[Show])
    this.flowHistory = []; // Tracks all executed flows
  }

  // Main router: pipes AST through sequence
  async route(ast) {
    try {
      this.clearFlowHistory();
      if (this.patternDiscovery) {
        this.patternDiscovery.reset();
        const patterns = this.patternDiscovery.findRecursivePatterns(ast);
        if (patterns.length > 0) {
          console.log(`🔎 Recursive patterns detected: ${patterns.length}`);
          patterns.slice(0, 4).forEach(p => {
            console.log(`   - ${p.signature} @ ${p.context.join('.')}`);
          });
        }
      }
      return await this.executeSequence(ast.body);
    } catch (error) {
      return this.dellExecutor.catch_dell(error);
    }
  }

  // Execute a sequence of Dell nodes
  async executeSequence(nodes) {
    let payload = null;
    let lastResult = null;
    let currentFlowType = null;
    const payloadHistory = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Skip spaces and flow operators for routing
      if (!node || node.type === 'SPACE' || node.type === 'FLOW_THRU') {
        continue;
      }

      // Handle flow operators and route payload semantics
      if (node.type === 'FlowOperator') {
        currentFlowType = node.flowType;
        payload = this.applyFlowRule(node.flowType, payload, payloadHistory);
        continue;
      }

      // Handle actual Dell execution
      if (
        node.type === 'OpBox' ||
        node.type === 'MultiBlockNode' ||
        node.type === 'ManorBlock' ||
        node.type === 'ContextBlock'
      ) {
        const dellCode = node.dell;
        const dellPayload = this.normalizePayload(node, payload, lastResult);

        // Execute Dell
        lastResult = await this.runDell(dellCode, dellPayload);

        // Handle output suppression in Void mode
        if (!this.voidMode) {
          if (dellCode === '09') {
            this.outputBuffer.forEach(item => console.log(item));
            this.outputBuffer = [];
          } else {
            this.outputBuffer.push(lastResult);
          }
        }

        // Record flow
        this.flowHistory.push({
          dell: dellCode,
          flow: currentFlowType || 'FLOW_FORWARD',
          input: dellPayload,
          output: lastResult,
          timestamp: Date.now(),
        });

        if (dellCode === '20') {
          this.voidMode = true;
          this.outputBuffer = [];
        }

        payloadHistory.push(lastResult);
        payload = lastResult;
        currentFlowType = null;
      }
    }

    return lastResult || { status: 'COMPLETE' };
  }

  applyFlowRule(flowType, payload, history) {
    if (['FLOW_FORWARD', 'FLOW_TO', 'FLOW_OVER'].includes(flowType)) {
      return payload;
    }
    if (flowType === 'FLOW_BACK') {
      return history.length >= 2 ? history[history.length - 2] : payload;
    }
    if (flowType === 'FLOW_PULSE') {
      return payload !== null ? [payload, payload] : payload;
    }
    if (['FLOW_UPDOWN', 'FLOW_INOUT', 'FLOW_RECURSIVE', 'FLOW_CYCLE'].includes(flowType)) {
      return payload;
    }
    return payload;
  }

  normalizePayload(node, payload, lastResult) {
    const dellCode = node.dell;
    let candidate =
      node.args && node.args.length > 0 ? node.args : node.container || node.value || payload;

    if (dellCode === '09') {
      const target = typeof candidate === 'string' ? candidate.trim().toLowerCase() : null;
      if (!target || /^(it|them|that)$/.test(target)) {
        return lastResult;
      }
    }

    if (dellCode === '08' && typeof candidate === 'string') {
      return this.cleanCreateTarget(candidate);
    }

    return candidate;
  }

  async runDell(dellCode, payload) {
    if (this.workerPool) {
      return this.workerPool.run(dellCode, payload);
    }
    return this.dellExecutor.execute(dellCode, payload);
  }

  cleanCreateTarget(value) {
    let cleaned = value.trim();
    cleaned = cleaned.replace(/^a file called\s+/i, '');
    cleaned = cleaned.replace(/^create\s+/i, '');
    cleaned = cleaned.replace(/^my\s+/i, '');
    cleaned = cleaned.replace(/^file\s+/i, '');
    return cleaned;
  }

  // Execute isolated void computation
  executeVoid(dellCode, payload) {
    const previousVoidState = this.voidMode;
    this.voidMode = true;
    this.outputBuffer = [];

    const result = this.dellExecutor.execute(dellCode, payload);

    this.voidMode = previousVoidState;
    this.outputBuffer = [];

    return result;
  }

  // Get flow history
  getFlowHistory() {
    return this.flowHistory;
  }

  // Clear flow history
  clearFlowHistory() {
    this.flowHistory = [];
  }
}

module.exports = RupaTRouter;
