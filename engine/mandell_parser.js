// mandell_parser.js
// =====================================================================
// MANDELLISTICS COMPILER: V1 PARSER ENGINE (AST GENERATOR)
// Validates grammar trees and checks bounded orbit limits for stability
// =====================================================================

const MandellDictionary = require('../lexicon/MandellDictionary.js');
const GreekmandellRegistry = require('../lexicon/greekmandell_registry.js');

class MandellParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.cursor = 0;
    this.coherenceHistory = [1.0]; // Initial seed coherence
    this.deltaOffset = 0.125; // Bounded offset (Delta_c)
    this.maxZoomDepth = 3; // Hypo-thermia depth cap
  }

  peek() {
    return this.tokens[this.cursor];
  }

  consume(expectedType) {
    const token = this.peek();
    if (!token) {
      throw new Error(`ParseError: Unexpected end of input. Expected: ${expectedType}`);
    }
    if (expectedType && token.type !== expectedType) {
      throw new Error(
        `ParseError at position ${token.position}: Expected type "${expectedType}", got "${token.type}" ("${token.value}")`
      );
    }
    this.cursor++;
    return token;
  }

  parse() {
    const ast = {
      type: 'MandellProgram',
      body: [],
      coherenceOrbits: [],
      flowGraph: [],
    };

    this.validateGreekmandellFrame();

    while (this.cursor < this.tokens.length) {
      const token = this.peek();

      if (token.type === 'DELL') {
        const node = this.parseOpBox();
        this.validateNodeMorphemes(node);
        this.evaluateBoundedOrbit(node);
        ast.body.push(node);
      } else if (
        token.type === 'MANOR_OPEN' ||
        token.type === 'CONTEXT_OPEN' ||
        token.type === 'SCOPE_OPEN'
      ) {
        const node = this.parseUnboundBlock();
        this.validateNodeMorphemes(node);
        ast.body.push(node);
      } else if (token.type === 'ENGLISH_COMMAND') {
        const node = this.parseEnglishCommand();
        this.validateNodeMorphemes(node);
        this.evaluateBoundedOrbit(node);
        ast.body.push(node);
      } else if (token.type === 'MANOR_BLOCK') {
        const node = this.parseManorBlock(token);
        this.validateNodeMorphemes(node);
        ast.body.push(node);
      } else if (token.type.startsWith('FLOW_')) {
        ast.body.push({
          type: 'FlowOperator',
          flowType: token.type,
          value: token.value,
          symbol: this.normalizeFlowSymbol(token),
        });
        this.cursor++;
      } else if (token.type === 'MANDELL_MOJI') {
        ast.body.push({
          type: 'MojiNode',
          value: token.value,
          definition: token.definition,
        });
        this.cursor++;
      } else if (
        ['IDENTIFIER', 'LATIN_MANDELL', 'NEW_LEIGHT_ROOT', 'QUOTED_STRING'].includes(token.type)
      ) {
        this.validateMorphemeToken(token, 'LooseNode');
        ast.body.push({
          type: 'LooseNode',
          value: token.value,
          decoded: token.decoded || null,
        });
        this.cursor++;
      } else {
        throw new Error(
          `ParseError at position ${token.position}: Loose element outside execution frame: "${token.value}"`
        );
      }
    }

    ast.coherenceOrbits = [...this.coherenceHistory];
    ast.flowGraph = this.buildFlowGraph(ast.body);
    return ast;
  }

  normalizeFlowSymbol(token) {
    const mapping = {
      FLOW_FORWARD: '⇶',
      FLOW_TO: '⇶',
      FLOW_BACK: '⇷',
      FLOW_UPDOWN: '⇅',
      FLOW_INOUT: '⇳',
      FLOW_PULSE: '↯',
      FLOW_RECURSIVE: '⟲',
      FLOW_CYCLE: '↺',
    };
    return mapping[token.type] || token.value;
  }

  buildFlowGraph(body) {
    const graph = [];
    let previousDell = null;
    let recordedFlow = '⇶';

    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      if (item.type === 'FlowOperator') {
        recordedFlow = item.symbol || item.value || this.normalizeFlowSymbol(item);
        continue;
      }
      if (item.dell) {
        if (previousDell) {
          graph.push({
            from: previousDell,
            to: item.dell,
            flow: this.findFlowBetween(previousDell, item.dell, body) || recordedFlow,
          });
        }
        previousDell = item.dell;
        recordedFlow = '⇶';
      }
    }
    return graph;
  }

  findFlowBetween(fromDell, toDell, body) {
    let searching = false;

    for (let index = 0; index < body.length; index++) {
      const entry = body[index];

      if (!searching && entry.dell === fromDell) {
        searching = true;
        continue;
      }

      if (searching) {
        if (entry.type === 'FlowOperator') {
          return entry.symbol || entry.value || this.normalizeFlowSymbol(entry);
        }
        if (entry.dell === toDell) {
          // No explicit flow operator found between the nodes.
          return '⇶';
        }
      }
    }

    return '⇶';
  }

  validateGreekmandellFrame() {
    const firstToken = this.peek();
    if (!firstToken) {
      throw new Error(
        'AbCC_Violation: Execution sequence is empty. Provide a valid start command.'
      );
    }

    const validStart =
      firstToken.value === '00' ||
      firstToken.value === '01' ||
      (firstToken.type === 'ENGLISH_COMMAND' && ['00', '01'].includes(firstToken.mappedDell));
    if (!validStart) {
      throw new Error(
        'AbCC_Violation: Every execution sequence must begin with 00[Nova], 01[Solo], or an equivalent English start command.'
      );
    }
  }

  isMorphemeValid(morpheme, type = 'root') {
    if (!morpheme) return true;
    const key = typeof morpheme === 'string' ? morpheme : morpheme.morpheme || morpheme;
    if (type === 'prefix') {
      return Boolean(MandellDictionary.prefixes[key] || GreekmandellRegistry.prefixes[key]);
    }
    if (type === 'suffix') {
      return Boolean(MandellDictionary.suffixes[key] || GreekmandellRegistry.suffixes[key]);
    }
    return Boolean(MandellDictionary.roots[key] || GreekmandellRegistry.roots[key]);
  }

  isGreekRoot(root) {
    return Boolean(GreekmandellRegistry.roots[root]);
  }

  validateMorphemeToken(token, context = 'token') {
    if (!token || !token.decoded) return;
    const decoded = token.decoded;

    if (decoded.unknownRoots && decoded.unknownRoots.length > 0) {
      throw new Error(
        `GreekmandellValidationError: ${context} contains unknown root(s): ${decoded.unknownRoots.join(', ')}`
      );
    }

    if (decoded.prefix && !this.isMorphemeValid(decoded.prefix, 'prefix')) {
      throw new Error(
        `GreekmandellValidationError: ${context} contains invalid prefix: ${decoded.prefix.morpheme}`
      );
    }
    if (decoded.suffix && !this.isMorphemeValid(decoded.suffix, 'suffix')) {
      throw new Error(
        `GreekmandellValidationError: ${context} contains invalid suffix: ${decoded.suffix.morpheme}`
      );
    }

    if (Array.isArray(decoded.roots)) {
      decoded.roots.forEach(root => {
        if (!this.isMorphemeValid(root.morpheme, 'root')) {
          throw new Error(
            `GreekmandellValidationError: ${context} contains invalid root: ${root.morpheme}`
          );
        }
      });
    }

    const hasGreek = Array.isArray(decoded.roots) && decoded.roots.some(r => this.isGreekRoot(r.morpheme));
    const hasLatin = Array.isArray(decoded.roots) && decoded.roots.some(r => !this.isGreekRoot(r.morpheme));
    if (hasGreek && hasLatin && token.type === 'LATIN_MANDELL') {
      throw new Error(
        `GreekmandellValidationError: ${context} contains Greek roots but was classified as LATIN_MANDELL.`
      );
    }
    if (!hasGreek && token.type === 'GREEK_MANDELL') {
      throw new Error(
        `GreekmandellValidationError: ${context} was classified as GREEK_MANDELL but contains no Greek roots.`
      );
    }
  }

  validateNodeMorphemes(node) {
    if (!node) return;
    if (node.morphemes) {
      if (Array.isArray(node.morphemes)) {
        node.morphemes.forEach(part => this.validateMorphemeToken(part, 'ManorBlock part'));
      } else {
        this.validateMorphemeToken(node.morphemes, 'Node morphemes');
      }
    }
    if (node.args) {
      node.args.forEach(arg => {
        if (arg && arg.decoded) {
          this.validateMorphemeToken(arg, 'Argument');
        }
      });
    }
  }

  parseManorBlock(token) {
    this.cursor++;
    const node = {
      type: 'ManorBlock',
      value: token.value,
      parts: token.parts,
      morphemes: token.parts,
    };
    token.parts.forEach(part => this.validateMorphemeToken(part, 'MANOR_BLOCK part'));
    return node;
  }

  parseOpBox() {
    const dellToken = this.consume('DELL');
    const nodes = [];
    let zoomDepth = 0;

    while (this.peek() && ['MANOR_OPEN', 'CONTEXT_OPEN', 'SCOPE_OPEN'].includes(this.peek().type)) {
      zoomDepth += 1;
      if (zoomDepth > this.maxZoomDepth) {
        throw new Error(
          `ZoomDepthException: Hypo-thermia zoom depth exceeded (max=${this.maxZoomDepth}).`
        );
      }
      nodes.push(this.parseBlockContent(dellToken.value, zoomDepth));
    }

    if (nodes.length === 0) {
      throw new Error(
        `ParseError at position ${dellToken.position}: Dell code "${dellToken.value}" must be bound to at least one container.`
      );
    }

    return nodes.length === 1
      ? nodes[0]
      : {
          type: 'MultiManorBlock',
          dell: dellToken.value,
          modes: this.extractManorModes(nodes),
          nodes: nodes,
        };
  }

  parseEnglishCommand() {
    const commandToken = this.consume('ENGLISH_COMMAND');
    const dellCode = commandToken.mappedDell || null;
    const commandName = commandToken.commandName || commandToken.value;
    const args = [];

    while (
      this.peek() &&
      !this.peek().type.startsWith('FLOW_') &&
      this.peek().type !== 'ENGLISH_COMMAND'
    ) {
      const next = this.consume();
      if (next.type === 'QUOTED_STRING') {
        args.push(next.value);
      } else if (
        ['WORD', 'IDENTIFIER', 'LATIN_MANDELL', 'GREEK_MANDELL', 'NEW_LEIGHT_ROOT', 'MANDELL_MOJI'].includes(
          next.type
        )
      ) {
        args.push(next.value);
      } else {
        break;
      }
    }

    const target = args.length > 0 ? args.join(' ') : null;
    return {
      type: 'OpBox',
      dell: dellCode,
      command: commandName,
      value: target,
      friendly: commandToken.value,
      args,
    };
  }

  parseUnboundBlock() {
    return this.parseBlockContent(null, 1);
  }

  parseBlockContent(dellValue, zoomDepth) {
    const openToken = this.peek();
    let closeType = '';
    let blockType = '';

    if (openToken && openToken.type === 'MANOR_OPEN') {
      this.consume('MANOR_OPEN');
      closeType = 'MANOR_CLOSE';
      blockType = 'ManorBlock';
    } else if (openToken && openToken.type === 'CONTEXT_OPEN') {
      this.consume('CONTEXT_OPEN');
      closeType = 'CONTEXT_CLOSE';
      blockType = 'ContextBlock';
    } else if (openToken && openToken.type === 'SCOPE_OPEN') {
      this.consume('SCOPE_OPEN');
      closeType = 'SCOPE_CLOSE';
      blockType = 'ScopeBlock';
    } else {
      throw new Error(`ParseError: Expected container start, got ${openToken?.type}`);
    }

    const contentToken = this.consume();
    if (
      ![
        'IDENTIFIER',
        'LATIN_MANDELL',
        'GREEK_MANDELL',
        'NEW_LEIGHT_ROOT',
        'ENGLISH_COMMAND',
        'QUOTED_STRING',
      ].includes(contentToken.type)
    ) {
      throw new Error(
        `ParseError at position ${contentToken.position}: Invalid container node target: "${contentToken.value}"`
      );
    }

    this.validateMorphemeToken(contentToken, 'Container node');

    // 1. Strip structural fluff quotes/apostrophes for resilience against AI-generated payloads
    const cleanTarget = String(contentToken.value).replace(/['"]/g, '');
    const validTargetRegex = /^[a-zA-Z0-9_\-\.]+$/;
    if (!validTargetRegex.test(cleanTarget)) {
      throw new Error(
        `ParseError at position ${contentToken.position}: Invalid container node target: "${contentToken.value}"`
      );
    }

    // 2. Bind the sanitized target back into the AST
    contentToken.value = cleanTarget;

    this.consume(closeType);

    const clarity = 1.0 / (1 + zoomDepth);
    if (zoomDepth > 1 && clarity < 0.25) {
      throw new Error(
        'ClarityException: Nested execution clarity dropped below allowable threshold.'
      );
    }

    return {
      type: blockType,
      dell: dellValue,
      value: contentToken.value,
      morphemes: contentToken.decoded || null,
      zoomDepth,
      clarity,
    };
  }

  extractManorModes(nodes) {
    return {
      core: 'Dell_Manor',
      depth: nodes.length,
      linguistic: nodes.some(n => n.morphemes) ? 'Latinmandell' : 'Tokenized',
      focus: 'Greekmandell',
    };
  }

  evaluateBoundedOrbit(node) {
    const lastCoherence = this.coherenceHistory[this.coherenceHistory.length - 1];
    const compressionFactor = node.morphemes ? 0.22 : 0.86;
    const nextCoherence = Math.pow(lastCoherence, 2) * compressionFactor + this.deltaOffset;

    if (Math.abs(nextCoherence) >= 2.0) {
      throw new Error(
        `BoundaryException: Semantic drift detected at node "${node.value || node.dell}". Orbit diverged.`
      );
    }

    this.coherenceHistory.push(parseFloat(nextCoherence.toFixed(4)));
  }
}

module.exports = MandellParser;
