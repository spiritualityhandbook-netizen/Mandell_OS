const fs = require('fs');
const path = require('path');

class SelfModifyingEngine {
  constructor(runtimePath = path.resolve(__dirname, 'core_dells.js')) {
    this.runtimePath = runtimePath;
  }

  readRuntimeSource() {
    return fs.readFileSync(this.runtimePath, 'utf8');
  }

  writeRuntimeSource(source) {
    fs.writeFileSync(this.runtimePath, source, 'utf8');
  }

  ensureSelfModStub() {
    let source = this.readRuntimeSource();
    if (source.includes('self_mod(payload)')) {
      return { status: 'ALREADY_PRESENT' };
    }

    const registryMarker = '      50: this.manifest.bind(this),';
    const registryInsert = '      51: this.self_mod.bind(this),\n';
    if (!source.includes(registryInsert)) {
      source = source.replace(registryMarker, `${registryMarker}\n${registryInsert}`);
    }

    const functionMarker = '// Execute a Dell by code';
    const insertIndex = source.indexOf(functionMarker);
    if (insertIndex === -1) {
      throw new Error('Runtime marker not found for self-modification.');
    }

    const definition = `  // DELL 51: Self Mod - Runtime self-modification hook\n  self_mod(payload) {\n    if (payload && payload.command === 'patch') {\n      return { status: 'SELF_MODIFIED', applied: true, patch: payload.patch };\n    }\n    return { status: 'SELF_MODIFIED', payload };\n  }\n\n  `;
    source = source.slice(0, insertIndex) + definition + source.slice(insertIndex);
    this.writeRuntimeSource(source);

    return { status: 'UPDATED', runtimePath: this.runtimePath };
  }
}

module.exports = SelfModifyingEngine;
