// Canonical Mandel morpheme registry (authoritative list for Phase 1 audit)
module.exports = {
  prefixes: {
    com: { d: 'with/together', note: 'core: Com- (together/synthesis)' },
    re: { d: 'back/again', note: 'cycle/iteration' },
    pre: { d: 'before', note: 'predictive / prior' },
    trans: { d: 'across/transformative', note: 'transformative' },
    de: { d: 'down/away/reverse', note: 'intensive / absolute' },
    omni: { d: 'all/universal', note: 'universal scope' },
    nur: { d: 'nurture/growth', note: 'adaptive / growth (added)' },
    fu: { d: 'forward/force', note: 'forward vector (added)' },
    im: { d: 'not/into', note: 'internal / isolated' },
    nud: { d: 'naked/raw', note: 'raw / naked (added)' },
    syn: { d: 'with/together', note: 'synchronized' },
    iso: { d: 'equal', note: 'quarantined / balanced' },
    aequi: { d: 'equal', note: 'balanced (alias of equi)' },
    ob: { d: 'against/toward', note: 'opposed' },
    ad: { d: 'to/toward', note: 'directed' }
  },

  roots: {
    man: { d: 'execute/control', note: 'core action (man-/mand-)' },
    fac: { d: 'construct/make', note: 'build/make' },
    log: { d: 'trace/record', note: 'logging / trace' },
    mit: { d: 'transmit/send', note: 'send/transmit' },
    spec: { d: 'evaluate/look', note: 'inspect/evaluate' },
    mend: { d: 'honor/validate', note: 'validate / mend (added)' },
    plet: { d: 'finish/complete', note: 'complete (alias of -plete)' },
    voc: { d: 'voice/call', note: 'voice' },
    gen: { d: 'origin/birth', note: 'generation/origin' },
    ment: { d: 'mind/result', note: 'mind/result' },
    struct: { d: 'build/form', note: 'structure' }
  },

  suffixes: {
    dell: { d: 'protected pocket', note: 'protected container / dell' },
    ce: { d: 'attribute/state', note: 'attribute' },
    ure: { d: 'formalized object', note: 'object formation' },
    re: { d: 'return/frame', note: 'return' },
    er: { d: 'actor', note: 'agent/actor' },
    ing: { d: 'active pipeline', note: 'progressive / active' },
    ed: { d: 'past/terminal', note: 'past/terminal' },
    term: { d: 'terminate/wipe', note: 'terminate / wipe' },
    log: { d: 'silent record', note: 'logging' },
    mut: { d: 'mutate', note: 'mutation' },
    fux: { d: 'continuous flow', note: 'continuous flow (added)' }
  }
};
