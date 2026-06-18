// mandell_lexer.js
// =====================================================================
// MANDELLISTICS COMPILER: V1 LEXER ENGINE (TOKENIZER)
// Processes structural strings and extracts single-token visual Mojis
// =====================================================================

const MandellDictionary = require('./MandellDictionary.js');

class MandellLexer {
  constructor(inputString) {
    this.input = inputString;
    this.tokens = [];
    this.cursor = 0;
    this.lexicon = MandellDictionary;

    this.prefixKeys = this.getOrderedKeys(this.lexicon.prefixes);
    this.suffixKeys = this.getOrderedKeys(this.lexicon.suffixes);
    this.rootKeys = this.getOrderedKeys(this.lexicon.roots);
    this.lexicon.dynamicRoots = this.lexicon.dynamicRoots || {};

    // Ordered tokenizer rules matching syntactic hierarchy
    this.rules = [
      { type: 'FLOW_FORWARD', regex: /^>>>/ },
      { type: 'FLOW_FORWARD', regex: /^=>/ },
      { type: 'FLOW_BACK', regex: /^<</ },
      { type: 'FLOW_TO', regex: /^->/ },
      { type: 'FLOW_TO', regex: /^>/ },
      { type: 'FLOW_BY', regex: /^:/ },
      { type: 'FLOW_FORWARD', regex: /^(and then|then|finally)\b/i },
      { type: 'FLOW_FORWARD', regex: /^⇶/ },
      { type: 'FLOW_BACK', regex: /^⇷/ },
      { type: 'FLOW_UPDOWN', regex: /^⇅/ },
      { type: 'FLOW_INOUT', regex: /^⇳/ },
      { type: 'FLOW_PULSE', regex: /^↯/ },
      { type: 'FLOW_RECURSIVE', regex: /^⟲/ },
      { type: 'FLOW_CYCLE', regex: /^↺/ },
      { type: 'DELL', regex: /^(0[0-9]|[1-4][0-9]|50)(?=\[|⟨|\s|$|\{)/ },
      { type: 'MANOR_OPEN', regex: /^\[/ },
      { type: 'MANOR_CLOSE', regex: /^\]/ },
      { type: 'CONTEXT_OPEN', regex: /^⟨/ },
      { type: 'CONTEXT_CLOSE', regex: /^⟩/ },
      { type: 'SCOPE_OPEN', regex: /^\{/ },
      { type: 'SCOPE_CLOSE', regex: /^\}/ },
      { type: 'QUOTED_STRING', regex: /^"([^"\\]*(?:\\.[^"\\]*)*)"/ },
      // Capture English commands before general identifiers
      {
        type: 'ENGLISH_COMMAND',
        regex:
          /^(Nova|Origin|Start|Solo|Create|Make|Write|Show|Display|Output|Change|Edit|Update|Test|Check|Bind|Keep|Remember|Void|Clear|Reset|Merge|Split|Filter|Map|Reduce|Sample|Rank|Encrypt|Decrypt|Compress|Expand|Annotate|Validate|Normalize|Profile|Simulate|Project|Route|Stage|Cache|Refresh|Alert|Calculate|Transform|Manifest)\b/i,
      },
      // Captures known visual MandellMojis directly
      { type: 'MOJI', regex: /^(⟐M|⟐|➿|△|❀|♔|♟|❤️|🌱|⬛|∞b|📐|🔄)/ },
      { type: 'WORD', regex: /^[A-Za-z0-9_\-\.\/\\]+/ },
      { type: 'SPACE', regex: /^\s+/ },
    ];
  }

  getOrderedKeys(dictionary) {
    return Object.keys(dictionary || {}).sort((a, b) => b.length - a.length);
  }

  dissectWord(word) {
    const cleanWord = word.replace(/-/g, '').toLowerCase();
    const result = { prefix: null, roots: [], suffix: null, unknownRoots: [] };
    let remaining = cleanWord;

    // 1. Identify the longest matching prefix first
    for (const prefix of this.prefixKeys) {
      if (remaining.startsWith(prefix)) {
        result.prefix = {
          morpheme: prefix,
          def: this.lexicon.prefixes[prefix].d,
          vectors: this.lexicon.prefixes[prefix].v,
        };
        remaining = remaining.slice(prefix.length);
        break;
      }
    }

    // 2. Identify the longest matching suffix first (ensures -dell precedence)
    for (const suffix of this.suffixKeys) {
      if (remaining.endsWith(suffix)) {
        result.suffix = {
          morpheme: suffix,
          def: this.lexicon.suffixes[suffix].d,
          vectors: this.lexicon.suffixes[suffix].v,
        };
        remaining = remaining.slice(0, -suffix.length);
        break;
      }
    }

    // 3. Extract known roots in order of decreasing length
    let progress = true;
    const rootCandidates = [...this.rootKeys, ...this.getOrderedKeys(this.lexicon.dynamicRoots)];

    while (progress && remaining.length > 0) {
      progress = false;
      for (const root of rootCandidates) {
        if (root && remaining.includes(root)) {
          const source = this.lexicon.roots[root] || this.lexicon.dynamicRoots[root];
          result.roots.push({
            morpheme: root,
            def: source.d,
            vectors: source.v,
          });
          remaining = remaining.replace(root, '');
          progress = true;
          break;
        }
      }
    }

    // 4. If unknown fragments remain, register them as new Leight roots
    if (remaining && remaining.length > 0) {
      const fallback = remaining.replace(/[^a-z0-9]/g, '');
      if (fallback.length > 0) {
        result.unknownRoots.push(fallback);
        this.lexicon.dynamicRoots[fallback] = this.lexicon.dynamicRoots[fallback] || {
          d: 'NEW_LEIGHT_ROOT',
          v: ['dynamic_root', 'leight', 'unknown'],
        };
      }
    }

    if (
      result.prefix ||
      result.roots.length > 0 ||
      result.suffix ||
      result.unknownRoots.length > 0
    ) {
      return {
        type: 'LATIN_MANDELL',
        value: word,
        decoded: result,
      };
    }

    return { type: 'IDENTIFIER', value: word };
  }

  tokenize() {
    while (this.cursor < this.input.length) {
      let matchFound = false;
      const currentString = this.input.substring(this.cursor);

      for (let rule of this.rules) {
        const match = currentString.match(rule.regex);

        if (match) {
          const matchedValue = match[0];

          if (rule.type === 'WORD') {
            const wordToken = this.dissectWord(matchedValue);
            wordToken.position = this.cursor;
            this.tokens.push(wordToken);
          } else if (rule.type === 'QUOTED_STRING') {
            const quotedValue = match[1] || matchedValue.slice(1, -1);
            this.tokens.push({ type: 'QUOTED_STRING', value: quotedValue, position: this.cursor });
          } else if (rule.type === 'ENGLISH_COMMAND') {
            const command = matchedValue.toLowerCase();
            const commandData = this.lexicon.commands[command];
            this.tokens.push({
              type: 'ENGLISH_COMMAND',
              value: matchedValue,
              mappedDell: commandData ? commandData.code : null,
              commandName: commandData ? commandData.name : null,
              position: this.cursor,
            });
          } else if (rule.type === 'MOJI') {
            const mojiData = this.lexicon.mojis[matchedValue] || { d: 'Undefined visual token' };
            this.tokens.push({
              type: 'MANDELL_MOJI',
              value: matchedValue,
              definition: mojiData.d || null,
              position: this.cursor,
            });
          } else if (rule.type !== 'SPACE') {
            this.tokens.push({
              type: rule.type,
              value: matchedValue,
              position: this.cursor,
            });
          }

          this.cursor += matchedValue.length;
          matchFound = true;
          break;
        }
      }

      if (!matchFound) {
        throw new Error(
          `CompileError: Unrecognized character sequence at position ${this.cursor}: "${this.input[this.cursor]}"`
        );
      }
    }
    return this.tokens;
  }
}

module.exports = MandellLexer;
