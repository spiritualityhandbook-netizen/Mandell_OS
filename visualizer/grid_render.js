// visualizer/grid_render.js
// =====================================================================
// MANDELL SPATIAL VISUALIZER: TERMINAL GRID RENDERING ENGINE
// Maps Dells to (X,Y) coordinates
// Renders flow arrows and OpBoxes as terminal visual elements
// =====================================================================

class GridRenderer {
  constructor(width = 80, height = 24) {
    this.width = width;
    this.height = height;
    this.grid = this.initializeGrid();
    this.nodeMap = {}; // Maps Dells to coordinates
    this.pathHistory = []; // Track executed paths
  }

  initializeGrid() {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(' ');
      }
      grid.push(row);
    }
    return grid;
  }

  // Map Dell code to starting coordinates
  placeDell(dellCode, x, y) {
    const box = this.dellToBox(dellCode);
    this.nodeMap[dellCode] = { x, y, box };

    // Place the box on grid
    if (x < this.width && y < this.height) {
      this.grid[y][x] = box;
    }
    return { x, y, box };
  }

  // Convert Dell code to visual box
  dellToBox(dellCode) {
    const dellNum = parseInt(dellCode);
    if (dellNum === 0) return '🌟'; // Nova
    if (dellNum === 9) return '🎯'; // Show
    if (dellNum === 20) return '⚫'; // Void
    return '⬛'; // Generic OpBox
  }

  // Draw flow arrow and update coordinates
  drawFlowArrow(fromCode, toCode, flowType) {
    const from = this.nodeMap[fromCode];
    const to = this.nodeMap[toCode];

    if (!from || !to) return null;

    const arrow = this.flowSymbol(flowType);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;
      const x = Math.round(from.x + dx * ratio);
      const y = Math.round(from.y + dy * ratio);

      if (x >= 0 && x < this.width && y >= 0 && y < this.height && this.grid[y][x] === ' ') {
        this.grid[y][x] = arrow;
      }
    }

    this.pathHistory.push({ from: fromCode, to: toCode, arrow });
    return { path: `${fromCode} ${arrow} ${toCode}`, coordinates: { from: from, to: to } };
  }

  flowSymbol(flowType) {
    const map = {
      FLOW_FORWARD: '⇶',
      FLOW_OVER: '⇶',
      FLOW_BACK: '⇷',
      FLOW_UPDOWN: '⇅',
      FLOW_INOUT: '⇳',
      FLOW_PULSE: '↯',
      FLOW_RECURSIVE: '⟲',
      FLOW_CYCLE: '↺',
    };
    return map[flowType] || '→';
  }

  // Layout Dells in grid automatically with visible symbol flow
  autoLayout(astBody = []) {
    this.clear();
    let x = 2;
    let y = 2;
    let previousDell = null;

    astBody.forEach(node => {
      if (node.type === 'FlowOperator') {
        return;
      }

      if (node.dell) {
        this.placeDell(node.dell, x, y);
        if (previousDell) {
          const flow = this.findFlowBetween(previousDell, node.dell, astBody) || 'FLOW_FORWARD';
          this.drawFlowArrow(previousDell, node.dell, flow);
        }
        previousDell = node.dell;
        x += 6;
        if (x > this.width - 5) {
          x = 2;
          y += 3;
        }
      }
    });
  }

  findFlowBetween(fromDell, toDell, astBody) {
    let searching = false;

    for (let i = 0; i < astBody.length; i++) {
      const entry = astBody[i];

      if (!searching && entry.dell === fromDell) {
        searching = true;
        continue;
      }

      if (searching) {
        if (entry.type === 'FlowOperator') {
          return entry.flowType || 'FLOW_FORWARD';
        }
        if (entry.dell === toDell) {
          return 'FLOW_FORWARD';
        }
      }
    }

    return 'FLOW_FORWARD';
  }

  // Render grid to terminal output
  render() {
    let output = '';
    output += '╔' + '═'.repeat(this.width - 2) + '╗\n';

    for (let y = 0; y < this.height; y++) {
      output += '║ ';
      output += this.grid[y].join('');
      output += ' ║\n';
    }

    output += '╚' + '═'.repeat(this.width - 2) + '╝';
    return output;
  }

  // Print legend
  renderLegend() {
    const legend = `
╔══════════════════════════════════╗
║     MANDELL GRID LEGEND          ║
╠══════════════════════════════════╣
║ 🌟 = 00[Nova]  (Start)           ║
║ 🎯 = 09[Show]  (Output)          ║
║ ⚫ = 20[Void]   (Sandbox)         ║
║ ⬛ = OpBox      (Operation)       ║
║ ⇶  = Flow>>>   (Forward)         ║
║ ⇷  = Flow<<    (Back)            ║
║ ⇅  = Flow↕     (Macro-Micro)     ║
║ ⇳  = Flow⟶    (Scope)            ║
║ ↯  = Pulse     (Broadcast)       ║
╚══════════════════════════════════╝
    `;
    return legend;
  }

  // Clear grid
  clear() {
    this.grid = this.initializeGrid();
    this.nodeMap = {};
    this.pathHistory = [];
  }

  // Get visual representation with metrics
  getMetrics() {
    return {
      width: this.width,
      height: this.height,
      nodesPlaced: Object.keys(this.nodeMap).length,
      pathsDrawn: this.pathHistory.length,
    };
  }
}

module.exports = GridRenderer;
