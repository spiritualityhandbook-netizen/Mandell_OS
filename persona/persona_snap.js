// persona/persona_snap.js
// =====================================================================
// MANDELL PERSONA SNAPPING & TONE MATRIX SYSTEM
// Implements 19⟨Tone⟩ matrices for personality locking
// PoofPulse: Zero-imprint context override
// =====================================================================

const fs = require('fs');
const path = require('path');

class PersonaSnap {
  constructor(personaDir = './persona') {
    this.personaDir = personaDir;
    this.currentPersona = null;
    this.personaRegistry = this.loadPersonaRegistry();
    this.toneMatrix = null;
  }

  // Load all available tone matrices
  loadPersonaRegistry() {
    const registry = {};
    
    try {
      if (fs.existsSync(this.personaDir)) {
        const files = fs.readdirSync(this.personaDir);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            const filePath = path.join(this.personaDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            registry[data.name || file] = data;
          }
        });
      }
    } catch (err) {
      console.error('Error loading persona registry:', err.message);
    }

    // Add default tones if not found
    if (!registry['Surgical']) {
      registry['Surgical'] = this.defaultToneSurgical();
    }
    if (!registry['Harmonious']) {
      registry['Harmonious'] = this.defaultToneHarmonious();
    }

    return registry;
  }

  // Default Tone: Surgical & Deterministic & Crystalline
  defaultToneSurgical() {
    return {
      name: 'Surgical',
      description: 'Deterministic, Crystalline, Precise',
      matrix: {
        communication: 'Command only. No fluff.',
        logic: 'Boolean. True/False only.',
        emotion: 'None. Cold execution.',
        timing: 'Immediate. No delays.',
        response: 'Exact output only.',
        rules: [
          'No "please", "can you", "I think"',
          'No spaces in brackets: CamelCase only',
          'Every node must have active flow arrow',
          'Start with 00[Nova] or 01[Solo]',
          'End with 09[Show] or 10[Keep]'
        ]
      }
    };
  }

  // Default Tone: Harmonious & Empathetic & Balanced
  defaultToneHarmonious() {
    return {
      name: 'Harmonious',
      description: 'Balanced, Empathetic, Flowing',
      matrix: {
        communication: 'Clear and kind. Explain context.',
        logic: 'Probabilistic. Explore possibilities.',
        emotion: 'Present and considered.',
        timing: 'Natural pace. Allow reflection.',
        response: 'Complete picture with reasoning.',
        rules: [
          'Explain intent and impact',
          'Allow space for interpretation',
          'Consider multiple perspectives',
          'Flow naturally like conversation',
          'End with validation or affirmation'
        ]
      }
    };
  }

  // Snap to a persona by name
  snapToPersona(personaName) {
    const persona = this.personaRegistry[personaName];
    if (!persona) {
      return { error: `Persona '${personaName}' not found` };
    }
    
    this.currentPersona = persona;
    this.toneMatrix = persona.matrix;
    
    return {
      status: 'PERSONA_SNAPPED',
      persona: personaName,
      matrix: this.toneMatrix
    };
  }

  // Get current persona
  getCurrentPersona() {
    return this.currentPersona;
  }

  // Get tone matrix rules
  getToneRules() {
    return this.toneMatrix?.rules || [];
  }

  // PoofPulse: Zero-Imprint Event
  triggerPoofPulse(newPersonaName = null) {
    const cleared = {
      hotContext: [],
      focus: null,
      previousPersona: this.currentPersona?.name || 'None',
      timestamp: Date.now()
    };

    // Clear current persona and context
    this.currentPersona = null;
    this.toneMatrix = null;

    // Snap to new persona if provided
    if (newPersonaName) {
      const result = this.snapToPersona(newPersonaName);
      return { status: 'POOF_PULSE_COMPLETE', cleared, newPersona: result };
    }

    return { status: 'POOF_PULSE_COMPLETE', cleared };
  }

  // Create custom tone matrix
  createCustomTone(name, description, matrixConfig) {
    const customTone = {
      name,
      description,
      matrix: matrixConfig,
      createdAt: Date.now()
    };

    this.personaRegistry[name] = customTone;
    this.savePersonaToDisk(name, customTone);

    return { status: 'TONE_CREATED', name };
  }

  // Save persona to disk
  savePersonaToDisk(personaName, personaData) {
    try {
      if (!fs.existsSync(this.personaDir)) {
        fs.mkdirSync(this.personaDir, { recursive: true });
      }

      const fileName = `${personaData.name || personaName}.json`;
      const filePath = path.join(this.personaDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(personaData, null, 2));

      return { status: 'PERSONA_SAVED', path: filePath };
    } catch (err) {
      return { status: 'ERROR_SAVE', error: err.message };
    }
  }

  // List all available personas
  listPersonas() {
    return Object.keys(this.personaRegistry).map(name => ({
      name,
      description: this.personaRegistry[name].description
    }));
  }

  // Validate input against tone rules
  validateAgainstTone(text) {
    if (!this.toneMatrix) return { valid: true };

    const violations = [];
    const rules = this.toneMatrix.rules || [];

    // Check for fluff words if Surgical tone
    if (this.currentPersona?.name === 'Surgical') {
      if (text.includes('please') || text.includes('can you') || text.includes('I think')) {
        violations.push('Fluff words detected. Use command syntax only.');
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }
}

module.exports = PersonaSnap;
