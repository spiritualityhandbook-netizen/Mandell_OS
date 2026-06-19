const { inspect } = require('util');

class PatternDiscovery {
  constructor() {
    this.visited = new Set();
  }

  findRecursivePatterns(node, context = []) {
    if (node == null || typeof node !== 'object') return [];

    const signature = this.buildSignature(node);
    if (this.visited.has(signature)) {
      return [{ pattern: 'recursive', signature, context }];
    }

    this.visited.add(signature);
    let results = [];

    for (const key of Object.keys(node)) {
      const child = node[key];
      results = results.concat(this.findRecursivePatterns(child, [...context, key]));
    }

    return results;
  }

  buildSignature(value) {
    if (typeof value === 'string' || typeof value === 'number') {
      return `${typeof value}:${value}`;
    }
    if (Array.isArray(value)) {
      return `array:[${value.map(v => this.buildSignature(v)).join(',')}]`;
    }
    if (typeof value === 'object') {
      return `object:{${Object.keys(value).sort().map(k => `${k}:${this.buildSignature(value[k])}`).join(',')}}`;
    }
    return `unknown:${String(value)}`;
  }

  reset() {
    this.visited.clear();
  }
}

module.exports = PatternDiscovery;
