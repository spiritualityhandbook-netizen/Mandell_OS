// runtime/core_dells.js
// =====================================================================
// MANDELL RUNTIME ENGINE: V8 CORE DELLS (00-50) EXECUTION MAP
// Maps Dell codes to physical filesystem operations and state mutations
// =====================================================================

const fs = require('fs');
const path = require('path');

class DellExecutor {
  constructor(context = {}) {
    this.context = context;
    this.hotContext = []; // Current active Dell
    this.manifestCatalog = this.buildManifestCatalog();
    this.dellRegistry = this.initializeDellRegistry();
  }

  initializeDellRegistry() {
    return {
      '00': this.nova.bind(this),
      '01': this.solo.bind(this),
      '02': this.resonance.bind(this),
      '03': this.logic.bind(this),
      '04': this.change.bind(this),
      '05': this.echo.bind(this),
      '06': this.resolve.bind(this),
      '07': this.negate.bind(this),
      '08': this.create.bind(this),
      '09': this.show.bind(this),
      10: this.keep.bind(this),
      11: this.await_dell.bind(this),
      12: this.test.bind(this),
      13: this.weave.bind(this),
      14: this.bind.bind(this),
      15: this.guard.bind(this),
      16: this.decay.bind(this),
      17: this.pivot.bind(this),
      18: this.invoke.bind(this),
      19: this.tone.bind(this),
      20: this.void.bind(this),
      21: this.expand.bind(this),
      22: this.compress.bind(this),
      23: this.transpose.bind(this),
      24: this.calibrate.bind(this),
      25: this.catch_dell.bind(this),
      26: this.merge.bind(this),
      27: this.split.bind(this),
      28: this.filter.bind(this),
      29: this.map.bind(this),
      30: this.reduce.bind(this),
      31: this.sample.bind(this),
      32: this.rank.bind(this),
      33: this.encrypt.bind(this),
      34: this.decrypt.bind(this),
      35: this.compress2.bind(this),
      36: this.expand2.bind(this),
      37: this.annotate.bind(this),
      38: this.validate.bind(this),
      39: this.normalize.bind(this),
      40: this.profile.bind(this),
      41: this.simulate.bind(this),
      42: this.project.bind(this),
      43: this.route.bind(this),
      44: this.stage.bind(this),
      45: this.cache.bind(this),
      46: this.refresh.bind(this),
      47: this.alert.bind(this),
      48: this.calculate.bind(this),
      49: this.transform.bind(this),
      50: this.manifest.bind(this),
      51: this.self_mod.bind(this),

    };
  }

  buildManifestCatalog() {
    return {
      26: [
        {
          key: 'append',
          name: 'Append Merge',
          description: 'Append collections or strings',
          tuning: { mode: 'append', stable: true },
        },
        {
          key: 'deeper',
          name: 'Deep Merge',
          description: 'Recursively merge nested structures',
          tuning: { deep: true, preserve: true },
        },
        {
          key: 'dedupe',
          name: 'Deduplicate Merge',
          description: 'Merge and remove duplicates',
          tuning: { dedupe: true },
        },
        {
          key: 'overlay',
          name: 'Overlay Merge',
          description: 'Overlay second payload onto first',
          tuning: { overlay: true },
        },
        {
          key: 'blend',
          name: 'Blend Merge',
          description: 'Blend numeric payloads with averaging',
          tuning: { blend: true },
        },
        {
          key: 'chain',
          name: 'Chain Merge',
          description: 'Chain items into a workflow array',
          tuning: { chain: true },
        },
      ],
      27: [
        {
          key: 'token',
          name: 'Token Split',
          description: 'Split strings by whitespace tokens',
          tuning: { delimiter: ' ' },
        },
        {
          key: 'char',
          name: 'Character Split',
          description: 'Split into individual characters',
          tuning: { delimiter: '' },
        },
        {
          key: 'path',
          name: 'Path Split',
          description: 'Split path segments',
          tuning: { delimiter: '/' },
        },
        {
          key: 'line',
          name: 'Line Split',
          description: 'Split text into lines',
          tuning: { delimiter: '\n' },
        },
        {
          key: 'csv',
          name: 'CSV Split',
          description: 'Split comma-separated values',
          tuning: { delimiter: ',' },
        },
        {
          key: 'smart',
          name: 'Smart Split',
          description: 'Split with natural language awareness',
          tuning: { delimiter: ' ', smart: true },
        },
      ],
      28: [
        {
          key: 'truthy',
          name: 'Truthy Filter',
          description: 'Keep only truthy values',
          tuning: { criterion: 'truthy' },
        },
        {
          key: 'numeric',
          name: 'Numeric Filter',
          description: 'Keep only numbers',
          tuning: { type: 'number' },
        },
        {
          key: 'text',
          name: 'Text Filter',
          description: 'Keep only strings',
          tuning: { type: 'string' },
        },
        {
          key: 'exists',
          name: 'Exists Filter',
          description: 'Keep non-empty entries',
          tuning: { exists: true },
        },
        {
          key: 'pattern',
          name: 'Pattern Filter',
          description: 'Keep by regex pattern',
          tuning: { pattern: true },
        },
        {
          key: 'unique',
          name: 'Unique Filter',
          description: 'Keep only unique items',
          tuning: { unique: true },
        },
      ],
      29: [
        {
          key: 'uppercase',
          name: 'Uppercase Map',
          description: 'Convert strings to uppercase',
          tuning: { transform: 'upper' },
        },
        {
          key: 'lowercase',
          name: 'Lowercase Map',
          description: 'Convert strings to lowercase',
          tuning: { transform: 'lower' },
        },
        {
          key: 'length',
          name: 'Length Map',
          description: 'Map values to their length',
          tuning: { transform: 'length' },
        },
        {
          key: 'identity',
          name: 'Identity Map',
          description: 'Return items unchanged',
          tuning: { transform: 'identity' },
        },
        {
          key: 'increment',
          name: 'Increment Map',
          description: 'Increment numeric values',
          tuning: { transform: 'increment' },
        },
        {
          key: 'tag',
          name: 'Tag Map',
          description: 'Attach metadata tags',
          tuning: { transform: 'tag' },
        },
      ],
      30: [
        {
          key: 'sum',
          name: 'Sum Reduce',
          description: 'Sum numeric list items',
          tuning: { operation: 'sum' },
        },
        {
          key: 'product',
          name: 'Product Reduce',
          description: 'Multiply numeric list items',
          tuning: { operation: 'product' },
        },
        {
          key: 'join',
          name: 'Join Reduce',
          description: 'Join strings together',
          tuning: { operation: 'join' },
        },
        {
          key: 'min',
          name: 'Min Reduce',
          description: 'Find minimum value',
          tuning: { operation: 'min' },
        },
        {
          key: 'max',
          name: 'Max Reduce',
          description: 'Find maximum value',
          tuning: { operation: 'max' },
        },
        {
          key: 'count',
          name: 'Count Reduce',
          description: 'Count items in list',
          tuning: { operation: 'count' },
        },
      ],
      31: [
        {
          key: 'random',
          name: 'Random Sample',
          description: 'Select a random item',
          tuning: { mode: 'random' },
        },
        {
          key: 'first',
          name: 'First Sample',
          description: 'Select the first item',
          tuning: { mode: 'first' },
        },
        {
          key: 'last',
          name: 'Last Sample',
          description: 'Select the last item',
          tuning: { mode: 'last' },
        },
        {
          key: 'modal',
          name: 'Modal Sample',
          description: 'Select the most frequent item',
          tuning: { mode: 'modal' },
        },
        {
          key: 'median',
          name: 'Median Sample',
          description: 'Select median value',
          tuning: { mode: 'median' },
        },
        {
          key: 'batch',
          name: 'Batch Sample',
          description: 'Select a small subset',
          tuning: { mode: 'batch' },
        },
      ],
      32: [
        {
          key: 'ascending',
          name: 'Rank Ascending',
          description: 'Sort ascending',
          tuning: { order: 'asc' },
        },
        {
          key: 'descending',
          name: 'Rank Descending',
          description: 'Sort descending',
          tuning: { order: 'desc' },
        },
        {
          key: 'score',
          name: 'Score Rank',
          description: 'Rank by numeric score',
          tuning: { metric: 'score' },
        },
        {
          key: 'length',
          name: 'Length Rank',
          description: 'Rank by length',
          tuning: { metric: 'length' },
        },
        {
          key: 'frequency',
          name: 'Frequency Rank',
          description: 'Rank by occurrence frequency',
          tuning: { metric: 'frequency' },
        },
        {
          key: 'custom',
          name: 'Custom Rank',
          description: 'Use custom comparator',
          tuning: { metric: 'custom' },
        },
      ],
      33: [
        {
          key: 'base64',
          name: 'Base64 Encrypt',
          description: 'Encode as base64',
          tuning: { format: 'base64' },
        },
        {
          key: 'xor',
          name: 'XOR Encrypt',
          description: 'Simple XOR cipher',
          tuning: { format: 'xor' },
        },
        {
          key: 'shift',
          name: 'Shift Encrypt',
          description: 'Caesar shift encoding',
          tuning: { format: 'shift' },
        },
        {
          key: 'reverse',
          name: 'Reverse Encrypt',
          description: 'Reverse the string',
          tuning: { format: 'reverse' },
        },
        {
          key: 'hash',
          name: 'Hash Encrypt',
          description: 'Return a hash fingerprint',
          tuning: { format: 'hash' },
        },
        {
          key: 'mask',
          name: 'Mask Encrypt',
          description: 'Mask sensitive characters',
          tuning: { format: 'mask' },
        },
      ],
      34: [
        {
          key: 'base64',
          name: 'Base64 Decrypt',
          description: 'Decode base64',
          tuning: { format: 'base64' },
        },
        {
          key: 'xor',
          name: 'XOR Decrypt',
          description: 'Decode XOR cipher',
          tuning: { format: 'xor' },
        },
        {
          key: 'shift',
          name: 'Shift Decrypt',
          description: 'Reverse Caesar shift',
          tuning: { format: 'shift' },
        },
        {
          key: 'reverse',
          name: 'Reverse Decrypt',
          description: 'Reverse string back',
          tuning: { format: 'reverse' },
        },
        {
          key: 'hash',
          name: 'Hash Verify',
          description: 'Return hash fingerprint',
          tuning: { format: 'hash' },
        },
        {
          key: 'unmask',
          name: 'Unmask Decrypt',
          description: 'Reveal masked characters',
          tuning: { format: 'unmask' },
        },
      ],
      35: [
        {
          key: 'zip',
          name: 'Zip Compress',
          description: 'Compress using ZIP style',
          tuning: { method: 'zip' },
        },
        {
          key: 'gzip',
          name: 'GZip Compress',
          description: 'Compress using gzip style',
          tuning: { method: 'gzip' },
        },
        {
          key: 'shrink',
          name: 'Shrink Compress',
          description: 'Compact whitespace and data',
          tuning: { method: 'shrink' },
        },
        {
          key: 'encode',
          name: 'Encode Compress',
          description: 'Encode data for compact output',
          tuning: { method: 'encode' },
        },
        {
          key: 'trim',
          name: 'Trim Compress',
          description: 'Remove redundant whitespace',
          tuning: { method: 'trim' },
        },
        {
          key: 'pack',
          name: 'Pack Compress',
          description: 'Pack into a smaller payload',
          tuning: { method: 'pack' },
        },
      ],
      36: [
        {
          key: 'inflate',
          name: 'Inflate Expand',
          description: 'Reverse compression',
          tuning: { method: 'inflate' },
        },
        {
          key: 'unpack',
          name: 'Unpack Expand',
          description: 'Unpack packed payloads',
          tuning: { method: 'unpack' },
        },
        {
          key: 'repeat',
          name: 'Repeat Expand',
          description: 'Repeat values to expand',
          tuning: { method: 'repeat' },
        },
        {
          key: 'extend',
          name: 'Extend Expand',
          description: 'Add complementary data',
          tuning: { method: 'extend' },
        },
        {
          key: 'normalize',
          name: 'Normalize Expand',
          description: 'Expand normalized payload',
          tuning: { method: 'normalize' },
        },
        {
          key: 'feature',
          name: 'Feature Expand',
          description: 'Expand data with derived features',
          tuning: { method: 'feature' },
        },
      ],
      37: [
        {
          key: 'tag',
          name: 'Tag Annotate',
          description: 'Attach tags to payload',
          tuning: { style: 'tag' },
        },
        {
          key: 'meta',
          name: 'Meta Annotate',
          description: 'Attach metadata fields',
          tuning: { style: 'meta' },
        },
        {
          key: 'note',
          name: 'Note Annotate',
          description: 'Attach free-form notes',
          tuning: { style: 'note' },
        },
        {
          key: 'trace',
          name: 'Trace Annotate',
          description: 'Attach trace history',
          tuning: { style: 'trace' },
        },
        {
          key: 'label',
          name: 'Label Annotate',
          description: 'Attach labels',
          tuning: { style: 'label' },
        },
        {
          key: 'flag',
          name: 'Flag Annotate',
          description: 'Attach status flags',
          tuning: { style: 'flag' },
        },
      ],
      38: [
        {
          key: 'schema',
          name: 'Schema Validate',
          description: 'Validate against schema',
          tuning: { method: 'schema' },
        },
        {
          key: 'range',
          name: 'Range Validate',
          description: 'Validate numeric ranges',
          tuning: { method: 'range' },
        },
        {
          key: 'pattern',
          name: 'Pattern Validate',
          description: 'Validate regex patterns',
          tuning: { method: 'pattern' },
        },
        {
          key: 'presence',
          name: 'Presence Validate',
          description: 'Validate required keys',
          tuning: { method: 'presence' },
        },
        {
          key: 'type',
          name: 'Type Validate',
          description: 'Validate data types',
          tuning: { method: 'type' },
        },
        {
          key: 'custom',
          name: 'Custom Validate',
          description: 'Custom rule validation',
          tuning: { method: 'custom' },
        },
      ],
      39: [
        {
          key: 'lower',
          name: 'Lowercase Normalize',
          description: 'Lowercase string data',
          tuning: { method: 'lower' },
        },
        {
          key: 'upper',
          name: 'Uppercase Normalize',
          description: 'Uppercase string data',
          tuning: { method: 'upper' },
        },
        {
          key: 'trim',
          name: 'Trim Normalize',
          description: 'Trim whitespace',
          tuning: { method: 'trim' },
        },
        {
          key: 'numeric',
          name: 'Numeric Normalize',
          description: 'Normalize numeric formats',
          tuning: { method: 'numeric' },
        },
        {
          key: 'slug',
          name: 'Slug Normalize',
          description: 'Create slug-safe text',
          tuning: { method: 'slug' },
        },
        {
          key: 'canonical',
          name: 'Canonical Normalize',
          description: 'Standardize payload form',
          tuning: { method: 'canonical' },
        },
      ],
      40: [
        {
          key: 'basic',
          name: 'Basic Profile',
          description: 'Collect basic metrics',
          tuning: { level: 'basic' },
        },
        {
          key: 'detail',
          name: 'Detailed Profile',
          description: 'Collect detailed metrics',
          tuning: { level: 'detailed' },
        },
        {
          key: 'summary',
          name: 'Summary Profile',
          description: 'Collect summary metrics',
          tuning: { level: 'summary' },
        },
        {
          key: 'performance',
          name: 'Performance Profile',
          description: 'Capture performance data',
          tuning: { level: 'performance' },
        },
        {
          key: 'usage',
          name: 'Usage Profile',
          description: 'Capture usage statistics',
          tuning: { level: 'usage' },
        },
        {
          key: 'health',
          name: 'Health Profile',
          description: 'Capture health state',
          tuning: { level: 'health' },
        },
      ],
      41: [
        {
          key: 'fast',
          name: 'Fast Simulate',
          description: 'Quick approximate simulation',
          tuning: { speed: 'fast' },
        },
        {
          key: 'accurate',
          name: 'Accurate Simulate',
          description: 'Higher fidelity simulation',
          tuning: { speed: 'accurate' },
        },
        {
          key: 'probabilistic',
          name: 'Probabilistic Simulate',
          description: 'Simulate with randomness',
          tuning: { mode: 'probabilistic' },
        },
        {
          key: 'deterministic',
          name: 'Deterministic Simulate',
          description: 'Repeatable simulation',
          tuning: { mode: 'deterministic' },
        },
        {
          key: 'scenario',
          name: 'Scenario Simulate',
          description: 'Simulate a scenario variant',
          tuning: { mode: 'scenario' },
        },
        {
          key: 'stress',
          name: 'Stress Simulate',
          description: 'Stress test simulation',
          tuning: { mode: 'stress' },
        },
      ],
      42: [
        {
          key: 'fields',
          name: 'Field Project',
          description: 'Project selected fields',
          tuning: { method: 'fields' },
        },
        {
          key: 'subset',
          name: 'Subset Project',
          description: 'Project a subset of data',
          tuning: { method: 'subset' },
        },
        {
          key: 'axes',
          name: 'Axis Project',
          description: 'Project axes for view',
          tuning: { method: 'axes' },
        },
        {
          key: 'dimensions',
          name: 'Dimension Project',
          description: 'Project specific dimensions',
          tuning: { method: 'dimensions' },
        },
        {
          key: 'timeline',
          name: 'Timeline Project',
          description: 'Project time series',
          tuning: { method: 'timeline' },
        },
        {
          key: 'summary',
          name: 'Summary Project',
          description: 'Create summary projection',
          tuning: { method: 'summary' },
        },
      ],
      43: [
        {
          key: 'direct',
          name: 'Direct Route',
          description: 'Route payload directly',
          tuning: { path: 'direct' },
        },
        {
          key: 'loop',
          name: 'Loop Route',
          description: 'Route payload in a loop',
          tuning: { path: 'loop' },
        },
        {
          key: 'branch',
          name: 'Branch Route',
          description: 'Route to multiple targets',
          tuning: { path: 'branch' },
        },
        {
          key: 'conditional',
          name: 'Conditional Route',
          description: 'Route based on payload state',
          tuning: { path: 'conditional' },
        },
        {
          key: 'priority',
          name: 'Priority Route',
          description: 'Route by priority',
          tuning: { path: 'priority' },
        },
        {
          key: 'parallel',
          name: 'Parallel Route',
          description: 'Route in parallel',
          tuning: { path: 'parallel' },
        },
      ],
      44: [
        {
          key: 'prepare',
          name: 'Prepare Stage',
          description: 'Prepare payload for pipeline',
          tuning: { stage: 'prepare' },
        },
        {
          key: 'execute',
          name: 'Execute Stage',
          description: 'Execute pipeline stage',
          tuning: { stage: 'execute' },
        },
        {
          key: 'verify',
          name: 'Verify Stage',
          description: 'Verify pipeline stage',
          tuning: { stage: 'verify' },
        },
        {
          key: 'commit',
          name: 'Commit Stage',
          description: 'Commit stage data',
          tuning: { stage: 'commit' },
        },
        {
          key: 'rollback',
          name: 'Rollback Stage',
          description: 'Rollback stage effects',
          tuning: { stage: 'rollback' },
        },
        {
          key: 'archive',
          name: 'Archive Stage',
          description: 'Archive stage outputs',
          tuning: { stage: 'archive' },
        },
      ],
      45: [
        {
          key: 'store',
          name: 'Store Cache',
          description: 'Cache payload in memory',
          tuning: { strategy: 'store' },
        },
        {
          key: 'retrieve',
          name: 'Retrieve Cache',
          description: 'Retrieve cached payload',
          tuning: { strategy: 'retrieve' },
        },
        {
          key: 'expire',
          name: 'Expire Cache',
          description: 'Expire cached payload',
          tuning: { strategy: 'expire' },
        },
        {
          key: 'refresh',
          name: 'Refresh Cache',
          description: 'Refresh cached data',
          tuning: { strategy: 'refresh' },
        },
        {
          key: 'layer',
          name: 'Layer Cache',
          description: 'Use multiple cache layers',
          tuning: { strategy: 'layered' },
        },
        {
          key: 'validate',
          name: 'Validate Cache',
          description: 'Validate cache integrity',
          tuning: { strategy: 'validate' },
        },
      ],
      46: [
        {
          key: 'reset',
          name: 'Reset Refresh',
          description: 'Reset payload state',
          tuning: { mode: 'reset' },
        },
        {
          key: 'update',
          name: 'Update Refresh',
          description: 'Update state from source',
          tuning: { mode: 'update' },
        },
        {
          key: 'synch',
          name: 'Sync Refresh',
          description: 'Synchronize data',
          tuning: { mode: 'sync' },
        },
        {
          key: 'reconnect',
          name: 'Reconnect Refresh',
          description: 'Reconnect sources',
          tuning: { mode: 'reconnect' },
        },
        {
          key: 'reload',
          name: 'Reload Refresh',
          description: 'Reload payload',
          tuning: { mode: 'reload' },
        },
        {
          key: 'renew',
          name: 'Renew Refresh',
          description: 'Renew active resources',
          tuning: { mode: 'renew' },
        },
      ],
      47: [
        {
          key: 'push',
          name: 'Push Alert',
          description: 'Send push-oriented alert',
          tuning: { channel: 'push' },
        },
        {
          key: 'email',
          name: 'Email Alert',
          description: 'Send email alert',
          tuning: { channel: 'email' },
        },
        {
          key: 'log',
          name: 'Log Alert',
          description: 'Log alert into history',
          tuning: { channel: 'log' },
        },
        {
          key: 'dashboard',
          name: 'Dashboard Alert',
          description: 'Raise dashboard signal',
          tuning: { channel: 'dashboard' },
        },
        {
          key: 'critical',
          name: 'Critical Alert',
          description: 'Raise critical condition',
          tuning: { severity: 'critical' },
        },
        {
          key: 'info',
          name: 'Info Alert',
          description: 'Raise informational notice',
          tuning: { severity: 'info' },
        },
      ],
      48: [
        {
          key: 'sum',
          name: 'Sum Calculate',
          description: 'Calculate the sum',
          tuning: { operation: 'sum' },
        },
        {
          key: 'avg',
          name: 'Average Calculate',
          description: 'Calculate the average',
          tuning: { operation: 'average' },
        },
        {
          key: 'diff',
          name: 'Difference Calculate',
          description: 'Calculate a difference',
          tuning: { operation: 'difference' },
        },
        {
          key: 'ratio',
          name: 'Ratio Calculate',
          description: 'Calculate a ratio',
          tuning: { operation: 'ratio' },
        },
        {
          key: 'percent',
          name: 'Percent Calculate',
          description: 'Calculate a percentage',
          tuning: { operation: 'percent' },
        },
        {
          key: 'complex',
          name: 'Complex Calculate',
          description: 'Complex numeric operation',
          tuning: { operation: 'complex' },
        },
      ],
      49: [
        {
          key: 'scale',
          name: 'Scale Transform',
          description: 'Scale numeric payloads',
          tuning: { transform: 'scale' },
        },
        {
          key: 'shift',
          name: 'Shift Transform',
          description: 'Shift data values',
          tuning: { transform: 'shift' },
        },
        {
          key: 'rotate',
          name: 'Rotate Transform',
          description: 'Rotate array elements',
          tuning: { transform: 'rotate' },
        },
        {
          key: 'invert',
          name: 'Invert Transform',
          description: 'Invert values',
          tuning: { transform: 'invert' },
        },
        {
          key: 'normalize',
          name: 'Normalize Transform',
          description: 'Normalize values',
          tuning: { transform: 'normalize' },
        },
        {
          key: 'project',
          name: 'Project Transform',
          description: 'Project values into new shape',
          tuning: { transform: 'project' },
        },
      ],
      50: [
        {
          key: 'select',
          name: 'Select Manifest',
          description: 'Choose specific manifest variant',
          tuning: { action: 'select' },
        },
        {
          key: 'describe',
          name: 'Describe Manifest',
          description: 'Describe available manifest variants',
          tuning: { action: 'describe' },
        },
        {
          key: 'list',
          name: 'List Manifest',
          description: 'List manifest catalog entries',
          tuning: { action: 'list' },
        },
        {
          key: 'apply',
          name: 'Apply Manifest',
          description: 'Apply a manifest tuning profile',
          tuning: { action: 'apply' },
        },
        {
          key: 'test',
          name: 'Test Manifest',
          description: 'Test manifest behavior',
          tuning: { action: 'test' },
        },
        {
          key: 'audit',
          name: 'Audit Manifest',
          description: 'Audit manifest settings',
          tuning: { action: 'audit' },
        },
      ],
    };
  }

  selectManifest(code, payload) {
    const variants = this.manifestCatalog[code] || [];
    if (variants.length === 0) return null;
    const raw =
      payload && typeof payload === 'object' && payload.manifest ? payload.manifest : null;
    if (raw) {
      return (
        variants.find(
          v => v.key === raw || v.name.toLowerCase().includes(String(raw).toLowerCase())
        ) || variants[0]
      );
    }
    const mode = payload && typeof payload === 'object' && payload.mode ? payload.mode : null;
    if (mode) {
      return (
        variants.find(
          v => v.key === mode || v.name.toLowerCase().includes(String(mode).toLowerCase())
        ) || variants[0]
      );
    }
    if (typeof payload === 'string') {
      const lower = payload.toLowerCase();
      return (
        variants.find(v => lower.includes(v.key) || lower.includes(v.name.toLowerCase())) ||
        variants[0]
      );
    }
    return variants[0];
  }

  unwrapPayload(payload) {
    if (payload && typeof payload === 'object' && payload.data !== undefined) {
      return payload.data;
    }
    return payload;
  }

  applyManifestSettings(manifest, payload) {
    if (!manifest) return payload;
    const decorated = {
      value: this.unwrapPayload(payload),
      manifest: manifest.key,
      tuning: manifest.tuning,
    };
    if (typeof payload === 'object' && payload !== null) {
      return {
        ...payload,
        manifest: manifest.key,
        tuning: manifest.tuning,
        value: decorated.value,
      };
    }
    return decorated;
  }

  // DELL 00: Nova - Origin/Blank slate, clear state
  nova(payload) {
    this.hotContext = [];
    return { status: 'CLEARED', origin: true };
  }

  // DELL 01: Solo - Focus on ONE / Self
  solo(payload) {
    this.hotContext = [payload];
    return { status: 'FOCUSED', target: payload };
  }

  // DELL 02: Resonance - Harmonic alignment
  resonance(payload) {
    const result = { status: 'RESONANT', harmonic: 0.618 };
    if (payload !== undefined) {
      result.source = payload;
      if (typeof payload === 'number') {
        result.harmonicScore = parseFloat(Math.max(0, 1 - Math.abs(payload - 0.618)).toFixed(3));
      }
    }
    return result;
  }

  // DELL 03: Tree - Logic / Interaction rules
  logic(payload) {
    if (typeof payload === 'string') {
      const expression = payload.trim();
      if (/==|===|!=|!==|>|<|>=|<=/.test(expression)) {
        try {
          // safe evaluation for simple numeric comparisons
          const safe = expression.replace(/[^0-9\s=!<>\.]/g, '');
          const result = Function(`return ${safe}`)();
          return { status: 'EVALUATED', logic: expression, truthy: Boolean(result), result };
        } catch (e) {
          return { status: 'ERROR_LOGIC', error: e.message, logic: expression };
        }
      }
      return { status: 'EVALUATED', logic: expression, truthy: expression.length > 0 };
    }
    if (typeof payload === 'object' && payload !== null) {
      return { status: 'EVALUATED', logic: payload, truthy: Object.keys(payload).length > 0 };
    }
    return { status: 'EVALUATED', logic: payload, truthy: Boolean(payload) };
  }

  // DELL 04: Change - Transform / Mutate state
  change(payload) {
    if (typeof payload === 'string' && fs.existsSync(payload)) {
      const content = fs.readFileSync(payload, 'utf8');
      return { status: 'MUTATED', content, path: payload };
    }
    if (typeof payload === 'string' && payload.includes('->')) {
      const [target, value] = payload.split('->').map(p => p.trim());
      return { status: 'MUTATED', target, value };
    }
    return { status: 'MUTATED', value: payload };
  }

  // DELL 05: Echo - Reflection/Mirror
  echo(payload) {
    return { status: 'ECHOED', reflection: payload };
  }

  // DELL 06: Resolve - Clear/Clean/Purify
  resolve(payload) {
    return { status: 'RESOLVED', clean: true, source: payload };
  }

  // DELL 07: Negate - Logical inversion / Hard kill
  negate(payload) {
    const inverted = typeof payload === 'boolean' ? !payload : payload ? false : true;
    return { status: 'NEGATED', active: inverted, original: payload };
  }

  // DELL 08: Create - Generate artifact or node
  create(target, content = '') {
    try {
      if (Array.isArray(target) && target.length > 0) {
        target = String(target[target.length - 1]);
      }
      const normalized = target && typeof target === 'string' ? target.trim() : target;
      const dir = path.dirname(normalized);
      if (dir && dir !== '.' && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (String(normalized).endsWith('/')) {
        fs.mkdirSync(normalized, { recursive: true });
        return { status: 'CREATED_DIR', path: normalized };
      }
      fs.writeFileSync(normalized, String(content || ''), 'utf8');
      return { status: 'CREATED_FILE', path: normalized };
    } catch (err) {
      return { status: 'ERROR_CREATE', error: err.message };
    }
  }

  // DELL 09: Show - Render output / Terminal display
  show(payload) {
    console.log('09[Show]:', JSON.stringify(payload, null, 2));
    return { status: 'DISPLAYED', payload };
  }

  // DELL 10: Keep - Save to memory / Pin to context stack
  keep(payload) {
    this.hotContext.push(payload);
    return { status: 'PINNED', contextLength: this.hotContext.length, item: payload };
  }

  // DELL 11: Await - Wait for async completion
  async await_dell(payload) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ status: 'AWAIT_COMPLETE', payload }), 120);
    });
  }

  // DELL 12: Test - Evaluate / Validate / Fact-check
  test(payload) {
    const valid = payload !== null && payload !== undefined && payload !== false;
    return { status: 'TESTED', valid, payload, timestamp: Date.now() };
  }

  // DELL 13: Weave - Combine/Integrate patterns
  weave(payload) {
    if (Array.isArray(payload)) {
      return { status: 'WOVEN', value: payload.flat(), length: payload.flat().length };
    }
    if (typeof payload === 'object' && payload !== null) {
      return { status: 'WOVEN', value: { ...payload }, keys: Object.keys(payload) };
    }
    return { status: 'WOVEN', value: payload };
  }

  // DELL 14: Bind - Create persistent edge / Lock nodes
  bind(node1, node2) {
    if (Array.isArray(node1) && node1.length >= 2) {
      return { status: 'BOUND', edge: { from: node1[0], to: node1[1] } };
    }
    return { status: 'BOUND', edge: { from: node1, to: node2 } };
  }

  // DELL 15: Guard - Protect/Validate boundaries
  guard(payload) {
    return { status: 'GUARDED', protected: true, payload };
  }

  // DELL 16: Decay - Garbage collection / Force forget
  decay(target) {
    if (typeof target === 'string' && fs.existsSync(target)) {
      try {
        const stats = fs.lstatSync(target);
        if (stats.isFile()) {
          fs.unlinkSync(target);
          return { status: 'DECAYED_FILE', removed: target };
        }
      } catch (err) {
        return { status: 'ERROR_DECAY', error: err.message };
      }
    }
    if (this.hotContext.includes(target)) {
      this.hotContext = this.hotContext.filter(x => x !== target);
      return { status: 'DECAYED', removed: target };
    }
    return { status: 'DECAYED', removed: false };
  }

  // DELL 17: Pivot - Rotate/Change perspective
  pivot(payload) {
    if (Array.isArray(payload)) {
      return { status: 'PIVOTED', perspective: payload.slice().reverse() };
    }
    if (typeof payload === 'object' && payload !== null) {
      return { status: 'PIVOTED', perspective: Object.entries(payload).reverse() };
    }
    return { status: 'PIVOTED', perspective: payload };
  }

  // DELL 18: Invoke - Call/Execute external function
  invoke(fn, args = []) {
    if (Array.isArray(fn) && fn.length >= 1) {
      const [fnRef, fnArgs] = fn;
      if (typeof fnRef === 'function') {
        return fnRef(...(Array.isArray(fnArgs) ? fnArgs : [fnArgs]));
      }
      return { status: 'ERROR_INVOKE', error: 'Not a callable reference' };
    }
    if (typeof fn === 'function') {
      return fn(...(Array.isArray(args) ? args : [args]));
    }
    return { status: 'ERROR_INVOKE', error: 'Not a function' };
  }

  // DELL 19: Tone - Set persona/personality matrix
  tone(toneMatrix) {
    this.context.tone = toneMatrix;
    return { status: 'TONE_SET', matrix: toneMatrix };
  }

  // DELL 20: Void - Isolated sandbox / Absolute origin
  void(payload) {
    this.hotContext = [];
    return { status: 'VOID_ISOLATED', sandbox: true, origin: true };
  }

  // DELL 21: Expand - Grow/Scale up
  expand(payload) {
    if (Array.isArray(payload)) {
      return { status: 'EXPANDED', value: [...payload, ...payload] };
    }
    if (typeof payload === 'string') {
      return { status: 'EXPANDED', value: payload + payload };
    }
    return { status: 'EXPANDED', value: payload };
  }

  // DELL 22: Compress - Shrink/Consolidate
  compress(payload) {
    if (Array.isArray(payload)) {
      return { status: 'COMPRESSED', value: payload.slice(0, Math.ceil(payload.length / 2)) };
    }
    if (typeof payload === 'string') {
      return { status: 'COMPRESSED', value: payload.slice(0, Math.ceil(payload.length / 2)) };
    }
    return { status: 'COMPRESSED', value: payload };
  }

  // DELL 23: Transpose - Exchange/Swap elements
  transpose(arr) {
    if (Array.isArray(arr) && arr.length > 0 && Array.isArray(arr[0])) {
      return arr[0].map((_, i) => arr.map(row => row[i]));
    }
    return { status: 'ERROR_TRANSPOSE', error: 'Invalid matrix' };
  }

  // DELL 24: Calibrate - Tune/Adjust parameters
  calibrate(payload) {
    const manifest = this.selectManifest('24', payload) || { key: 'default', tuning: {} };
    if (typeof payload === 'number') {
      return {
        status: 'CALIBRATED',
        precision: parseFloat((payload * 0.95).toFixed(3)),
        manifest: manifest.key,
        tuning: manifest.tuning,
      };
    }
    return {
      status: 'CALIBRATED',
      precision: 'tuned',
      payload,
      manifest: manifest.key,
      tuning: manifest.tuning,
    };
  }

  // DELL 26: Merge - Combine payloads with variant tuning
  merge(payload) {
    const manifest = this.selectManifest('26', payload);
    const data = this.unwrapPayload(payload);
    let result;

    if (Array.isArray(data)) {
      result = data.flat();
      if (manifest.key === 'dedupe') {
        result = [...new Set(result)];
      }
      if (manifest.key === 'deeper' && data.some(Array.isArray)) {
        result = data.reduce((acc, item) => acc.concat(Array.isArray(item) ? item : [item]), []);
      }
    } else if (typeof data === 'object' && data !== null) {
      result = { ...data };
      if (manifest.key === 'overlay') {
        result = { ...data, ...result };
      }
    } else {
      result = String(data);
    }

    return { status: 'MERGED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 27: Split - Break payload into parts
  split(payload) {
    const manifest = this.selectManifest('27', payload) || {
      key: 'token',
      tuning: { delimiter: ' ' },
    };
    const data = String(this.unwrapPayload(payload) || '');
    let delimiter =
      manifest.tuning && manifest.tuning.delimiter !== undefined ? manifest.tuning.delimiter : ' ';

    // Support semantic delimiters
    if (delimiter === 'char') delimiter = '';
    if (delimiter === 'token') delimiter = ' ';
    // Default to splitting on whitespace when nothing is specified
    if (delimiter === undefined || delimiter === null) delimiter = ' ';

    const result = data.split(delimiter);
    return { status: 'SPLIT', manifest: manifest.key, parts: result, tuning: manifest.tuning };
  }

  // DELL 28: Filter - Keep payload elements by criteria
  filter(payload) {
    const manifest = this.selectManifest('28', payload);
    const data = this.unwrapPayload(payload);
    let result = data;

    if (Array.isArray(data)) {
      if (manifest.key === 'truthy') {
        result = data.filter(Boolean);
      } else if (manifest.key === 'numeric') {
        result = data.filter(item => typeof item === 'number');
      } else if (manifest.key === 'text') {
        result = data.filter(item => typeof item === 'string');
      } else if (manifest.key === 'exists') {
        result = data.filter(item => item !== null && item !== undefined && item !== '');
      } else if (manifest.key === 'pattern') {
        result = data.filter(item => typeof item === 'string' && /\w+/.test(item));
      } else if (manifest.key === 'unique') {
        result = [...new Set(data)];
      }
    }

    return { status: 'FILTERED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 29: Map - Transform each payload item
  map(payload) {
    const manifest = this.selectManifest('29', payload);
    const data = this.unwrapPayload(payload);
    let result = data;

    if (Array.isArray(data)) {
      result = data.map(item => {
        if (manifest.key === 'uppercase') return String(item).toUpperCase();
        if (manifest.key === 'lowercase') return String(item).toLowerCase();
        if (manifest.key === 'length') return item ? String(item).length : 0;
        if (manifest.key === 'increment' && typeof item === 'number') return item + 1;
        if (manifest.key === 'tag') return { value: item, tag: 'mapped' };
        return item;
      });
    }

    return { status: 'MAPPED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 30: Reduce - Aggregate payload
  reduce(payload) {
    const manifest = this.selectManifest('30', payload);
    const data = this.unwrapPayload(payload);
    let result = data;

    if (Array.isArray(data)) {
      if (manifest.key === 'sum') result = data.reduce((a, b) => Number(a) + Number(b), 0);
      else if (manifest.key === 'product') result = data.reduce((a, b) => Number(a) * Number(b), 1);
      else if (manifest.key === 'join') result = data.join('');
      else if (manifest.key === 'min') result = Math.min(...data);
      else if (manifest.key === 'max') result = Math.max(...data);
      else if (manifest.key === 'count') result = data.length;
    }

    return { status: 'REDUCED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 31: Sample - Extract representative payload element(s)
  sample(payload) {
    const manifest = this.selectManifest('31', payload);
    const data = this.unwrapPayload(payload);
    let result = null;

    if (Array.isArray(data) && data.length > 0) {
      if (manifest.key === 'random') result = data[Math.floor(Math.random() * data.length)];
      else if (manifest.key === 'first') result = data[0];
      else if (manifest.key === 'last') result = data[data.length - 1];
      else if (manifest.key === 'modal')
        result = data
          .sort((a, b) => data.filter(v => v === a).length - data.filter(v => v === b).length)
          .pop();
      else if (manifest.key === 'median') result = data[Math.floor(data.length / 2)];
      else if (manifest.key === 'batch') result = data.slice(0, Math.min(3, data.length));
    }

    return { status: 'SAMPLED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 32: Rank - Sort or score payload
  rank(payload) {
    const manifest = this.selectManifest('32', payload);
    const data = this.unwrapPayload(payload);
    let result = data;

    if (Array.isArray(data)) {
      result = [...data];
      if (manifest.key === 'ascending') result.sort();
      else if (manifest.key === 'descending') result.sort().reverse();
      else if (manifest.key === 'length')
        result.sort((a, b) => String(a).length - String(b).length);
      else if (manifest.key === 'frequency') {
        result = result.sort(
          (a, b) => result.filter(v => v === b).length - result.filter(v => v === a).length
        );
      }
    }

    return { status: 'RANKED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 33: Encrypt - Transform payload into encoded form
  encrypt(payload) {
    const manifest = this.selectManifest('33', payload);
    const data = String(this.unwrapPayload(payload) || '');
    let result = data;

    if (manifest.key === 'base64') {
      result = Buffer.from(data).toString('base64');
    } else if (manifest.key === 'xor') {
      result = Array.from(data)
        .map(c => c.charCodeAt(0) ^ 42)
        .map(n => n.toString(16))
        .join('-');
    } else if (manifest.key === 'shift') {
      result = Array.from(data)
        .map(c => String.fromCharCode(c.charCodeAt(0) + 1))
        .join('');
    } else if (manifest.key === 'reverse') {
      result = data.split('').reverse().join('');
    } else if (manifest.key === 'hash') {
      result = require('crypto').createHash('sha256').update(data).digest('hex');
    } else if (manifest.key === 'mask') {
      result = data.replace(/./g, '*');
    }

    return { status: 'ENCRYPTED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 34: Decrypt - Restore payload from encoded form
  decrypt(payload) {
    const manifest = this.selectManifest('34', payload);
    const data = String(this.unwrapPayload(payload) || '');
    let result = data;

    if (manifest.key === 'base64') {
      result = Buffer.from(data, 'base64').toString('utf8');
    } else if (manifest.key === 'xor') {
      result = data
        .split('-')
        .map(hex => String.fromCharCode(parseInt(hex, 16) ^ 42))
        .join('');
    } else if (manifest.key === 'shift') {
      result = Array.from(data)
        .map(c => String.fromCharCode(c.charCodeAt(0) - 1))
        .join('');
    } else if (manifest.key === 'reverse') {
      result = data.split('').reverse().join('');
    } else if (manifest.key === 'hash') {
      result = { status: 'HASHED', fingerprint: data };
    } else if (manifest.key === 'unmask') {
      result = data.replace(/\*/g, '?');
    }

    return { status: 'DECRYPTED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 35: Compress2 - Secondary consolidation
  compress2(payload) {
    const manifest = this.selectManifest('35', payload);
    const data = String(this.unwrapPayload(payload) || '');
    let result = data;

    if (manifest.key === 'zip') result = Buffer.from(data).toString('base64');
    else if (manifest.key === 'gzip') result = Buffer.from(data).toString('base64');
    else if (manifest.key === 'shrink') result = data.replace(/\s+/g, ' ');
    else if (manifest.key === 'encode') result = encodeURIComponent(data);
    else if (manifest.key === 'trim') result = data.trim();
    else if (manifest.key === 'pack') result = data.split('').join('ˆ');

    return { status: 'COMPRESSED2', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 36: Expand2 - Secondary expansion
  expand2(payload) {
    const manifest = this.selectManifest('36', payload);
    const data = this.unwrapPayload(payload);
    let result = data;

    if (manifest.key === 'inflate' && typeof data === 'string') result = data.replace(/\^/g, '');
    else if (manifest.key === 'unpack' && typeof data === 'string')
      result = decodeURIComponent(data);
    else if (manifest.key === 'repeat' && typeof data === 'string') result = data.repeat(2);
    else if (manifest.key === 'extend' && Array.isArray(data)) result = [...data, ...data];
    else if (manifest.key === 'normalize') result = data;
    else if (manifest.key === 'feature') result = { features: data };

    return { status: 'EXPANDED2', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 37: Annotate - Tag payload with metadata
  annotate(payload) {
    const manifest = this.selectManifest('37', payload);
    const data = this.unwrapPayload(payload);
    let result = data;

    if (typeof data === 'object' && data !== null) {
      result = { ...data, annotation: manifest.name };
    } else {
      result = { value: data, annotation: manifest.name };
    }

    return { status: 'ANNOTATED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 38: Validate - Validate payload against rules
  validate(payload) {
    const manifest = this.selectManifest('38', payload);
    const data = this.unwrapPayload(payload);
    let valid = true;
    let details = null;

    if (manifest.key === 'schema') {
      valid = data && typeof data === 'object';
    } else if (manifest.key === 'range') {
      valid = typeof data === 'number' && data >= 0;
    } else if (manifest.key === 'pattern') {
      valid = typeof data === 'string' && /\w+/.test(data);
    } else if (manifest.key === 'presence') {
      valid = data && Object.keys(data || {}).length > 0;
    } else if (manifest.key === 'type') {
      valid = data !== null;
    }

    return { status: 'VALIDATED', manifest: manifest.key, valid, details, tuning: manifest.tuning };
  }

  // DELL 39: Normalize - Standardize payload forms
  normalize(payload) {
    const manifest = this.selectManifest('39', payload);
    const data = this.unwrapPayload(payload);
    let result = data;

    if (manifest.key === 'lower') result = String(data).toLowerCase();
    else if (manifest.key === 'upper') result = String(data).toUpperCase();
    else if (manifest.key === 'trim') result = String(data).trim();
    else if (manifest.key === 'numeric') result = Number(data);
    else if (manifest.key === 'slug')
      result = String(data)
        .replace(/[^a-z0-9]+/gi, '-')
        .toLowerCase();
    else if (manifest.key === 'canonical') result = String(data).normalize('NFC');

    return { status: 'NORMALIZED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 40: Profile - Produce metrics for payload
  profile(payload) {
    const manifest = this.selectManifest('40', payload);
    const data = this.unwrapPayload(payload);
    const result = {
      size: typeof data === 'string' ? data.length : Array.isArray(data) ? data.length : 1,
      type: typeof data,
      manifest: manifest.key,
    };
    return { status: 'PROFILED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 41: Simulate - Build a predictive simulation
  simulate(payload) {
    const manifest = this.selectManifest('41', payload);
    const data = this.unwrapPayload(payload);
    const result = { simulated: true, mode: manifest.key, source: data };
    return { status: 'SIMULATED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 42: Project - Project values into view
  project(payload) {
    const manifest = this.selectManifest('42', payload);
    const data = this.unwrapPayload(payload);
    let result = data;
    if (manifest.key === 'fields' && typeof data === 'object' && data !== null) {
      result = Object.keys(data)
        .slice(0, 2)
        .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {});
    }
    return { status: 'PROJECTED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 43: Route - Route payload through logical paths
  route(payload) {
    const manifest = this.selectManifest('43', payload);
    const data = this.unwrapPayload(payload);
    return {
      status: 'ROUTED',
      manifest: manifest.key,
      route: manifest.tuning.path,
      payload: data,
      tuning: manifest.tuning,
    };
  }

  // DELL 44: Stage - Manage pipeline stages
  stage(payload) {
    const manifest = this.selectManifest('44', payload);
    const data = this.unwrapPayload(payload);
    return {
      status: 'STAGED',
      manifest: manifest.key,
      stage: manifest.tuning.stage,
      payload: data,
      tuning: manifest.tuning,
    };
  }

  // DELL 45: Cache - Cache payload locally
  cache(payload) {
    const manifest = this.selectManifest('45', payload);
    this.context.cache = this.context.cache || {};
    const data = this.unwrapPayload(payload);
    if (manifest.key === 'store') {
      this.context.cache.last = data;
    }
    if (manifest.key === 'retrieve') {
      return {
        status: 'CACHED',
        manifest: manifest.key,
        result: this.context.cache.last,
        tuning: manifest.tuning,
      };
    }
    return { status: 'CACHED', manifest: manifest.key, payload: data, tuning: manifest.tuning };
  }

  // DELL 46: Refresh - Refresh state or inputs
  refresh(payload) {
    const manifest = this.selectManifest('46', payload);
    const data = this.unwrapPayload(payload);
    return { status: 'REFRESHED', manifest: manifest.key, payload: data, tuning: manifest.tuning };
  }

  // DELL 47: Alert - Notify or signal state
  alert(payload) {
    const manifest = this.selectManifest('47', payload);
    const data = this.unwrapPayload(payload);
    return {
      status: 'ALERTED',
      manifest: manifest.key,
      message: `Alert: ${manifest.name}`,
      payload: data,
      tuning: manifest.tuning,
    };
  }

  // DELL 48: Calculate - Perform numeric operations
  calculate(payload) {
    const manifest = this.selectManifest('48', payload);
    const data = this.unwrapPayload(payload);
    let result = data;
    if (manifest.key === 'sum' && Array.isArray(data))
      result = data.reduce((a, b) => Number(a) + Number(b), 0);
    if (manifest.key === 'avg' && Array.isArray(data))
      result = data.reduce((a, b) => Number(a) + Number(b), 0) / data.length;
    if (manifest.key === 'diff' && Array.isArray(data) && data.length >= 2)
      result = Number(data[1]) - Number(data[0]);
    if (manifest.key === 'ratio' && Array.isArray(data) && data.length >= 2)
      result = Number(data[0]) / Number(data[1]);
    if (manifest.key === 'percent' && typeof data === 'number')
      result = `${(data * 100).toFixed(2)}%`;
    return { status: 'CALCULATED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 49: Transform - Generalized payload transformation
  transform(payload) {
    const manifest = this.selectManifest('49', payload);
    const data = this.unwrapPayload(payload);
    let result = data;
    if (manifest.key === 'scale' && typeof data === 'number') result = data * 2;
    if (manifest.key === 'shift' && typeof data === 'number') result = data + 1;
    if (manifest.key === 'rotate' && Array.isArray(data)) result = [...data.slice(1), data[0]];
    if (manifest.key === 'invert' && typeof data === 'number') result = -data;
    if (manifest.key === 'normalize') result = String(data).toLowerCase();
    return { status: 'TRANSFORMED', manifest: manifest.key, result, tuning: manifest.tuning };
  }

  // DELL 50: Manifest - Inspect or apply manifest settings
  manifest(payload) {
    const manifest = this.selectManifest('50', payload);
    const data = this.unwrapPayload(payload);
    return {
      status: 'MANIFESTED',
      manifest: manifest.key,
      action: manifest.tuning.action,
      payload: data,
      tuning: manifest.tuning,
    };
  }

  // DELL 25: Catch - Error handler / Bailout
  catch_dell(error) {
    return { status: 'CAUGHT', error: error.message || error };
  }

    // DELL 51: Self Mod - Runtime self-modification hook
  self_mod(payload) {
    if (payload && payload.command === 'patch') {
      return { status: 'SELF_MODIFIED', applied: true, patch: payload.patch };
    }
    return { status: 'SELF_MODIFIED', payload };
  }

  // Execute a Dell by code
  execute(dellCode, payload) {
    const executor = this.dellRegistry[dellCode];
    if (!executor) {
      return { status: 'ERROR', error: `Unknown Dell code: ${dellCode}` };
    }
    return executor(payload);
  }
}

module.exports = DellExecutor;
