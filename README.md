# Mandell OS: Pure Mandellamatrix Operating System

## Overview

Mandell OS is a pure Mandell compiler and execution engine. It operates without external state machine integrations by default, focusing on Greekmandell syntax, internal lexicon expansion, bounded orbit coherence, and deterministic runtime execution.

Mandell OS transforms hyphenated linguistic inputs into executable operations through a sophisticated pipeline of lexical analysis, AST parsing, and runtime execution.

## Quick Start

### Installation

```bash
cd Mandell_OS
npm install
```

### Basic Execution

```bash
# Run with test seed
node run.js

# Run with custom seed
node run.js "00[Nova] >>> 08[MyFile.txt] >>> 09[Show]"

# Interactive mode
node run.js --interactive
```

## Architecture Overview

### Phase 1: Foundation

- ✅ Directory structure: `lexicon/`, `engine/`, `runtime/`, `memory/`, `visualizer/`, `persona/`
- ✅ NPM package initialization with dependencies

### Phase 2: Compiler Pipeline

- ✅ **Lexer** (`engine/mandell_lexer.js`): Tokenizes Mandell syntax with BPE extraction
- ✅ **Dictionary** (`lexicon/MandellDictionary.js`): Comprehensive morpheme registry
- ✅ **Parser** (`engine/mandell_parser.js`): Builds AST with coherence validation
- ✅ **Bounded Orbit Equation**: $C_{n+1} = C_n^2 + \Delta_c$ prevents semantic drift

### Phase 3: Runtime Engine

- ✅ **Core Dells (00-25)** (`runtime/core_dells.js`): All 26 operations mapped to physical actions
  - `00[Nova]`: Clear state
  - `08[Create]`: Generate files
  - `09[Show]`: Terminal output
  - `20[Void]`: Sandbox isolation
  - And 22 more...
- ✅ **Router** (`runtime/rupat_router.js`): Flows payload through sequence with `>>>` arrows

### Phase 4: Memory Management

- ✅ **Hot Memory**: Active RAM context
- ✅ **Warm Memory**: Session history (session_history.json)
- ✅ **Cold Memory**: Vector-search RAG archive
- ✅ **Hypo-Thermia**: Predictive next-state layers

### Phase 5: Inter-AI Protocol

- ✅ **Terminal Architect** (`engine/terminal_architect.js`): Gemini API bridge
- ✅ Loads `Gemini.md` as system instruction
- ✅ Mock mode when API unavailable

### Phase 6: Spatial Visualizer

- ✅ **Grid Renderer** (`visualizer/grid_render.js`): Terminal (X,Y) coordinates
- ✅ Visual symbols: `🌟`=Nova, `🎯`=Show, `⚫`=Void, `⬛`=OpBox
- ✅ Flow arrows: `⇶` `⇷` `⇅` `⇳` `↯`

### Phase 7: Persona System

- ✅ **Persona Snap** (`persona/persona_snap.js`): Tone matrix binding
- ✅ **Default Tones**: Surgical (deterministic), Harmonious (balanced)
- ✅ **PoofPulse**: Zero-imprint context override

### Phase 8: Master Unification

- ✅ **run.js**: Complete 7-step pipeline orchestration

## Mandell Syntax

### English-Friendly Commands

Mandell OS supports natural English command aliases and sentence-style flow.

Examples:

```bash
node run.js "Nova -> Create Hello_World.txt -> Show"
node run.js "Start create \"My Notes.txt\" and then show it"
node run.js "Origin write \"Project Plan.txt\" finally display"
```

Supported English commands:

- `Nova`, `Origin`, `Start` → `00[Nova]`
- `Solo` → `01[Solo]`
- `Create`, `Make`, `Write` → `08[Create]`
- `Show`, `Display`, `Output` → `09[Show]`
- `Change`, `Edit`, `Update` → `04[Change]`
- `Test`, `Check` → `12[Test]`
- `Bind` → `14[Bind]`
- `Keep`, `Remember` → `10[Keep]`
- `Void` → `20[Void]`
- `Clear`, `Reset` → `00[Nova]`

Supported sentence connectors:

- `and then`
- `then`
- `finally`

### OpBox Structure

```
[Dell_Code][Context⟨Name⟩[Container]
```

Example:

```
00[Nova_Start] ⇶ 08[Create_File] ⇶ 09[Show_Result]
```

### Flow Arrows

- `⇶` (`>>>`) - Forward procedural flow
- `⇷` (`<<`) - Backward retrieval
- `⇅` (`↕`) - Macro-to-micro shift
- `⇳` (`⟶`) - Scope transition
- `↯` - Radial pulse broadcast

### Dell Registry (00-25)

| Code | Name   | Purpose              |
| ---- | ------ | -------------------- |
| 00   | Nova   | Clear state, origin  |
| 01   | Solo   | Focus single element |
| 03   | Logic  | Evaluate conditions  |
| 04   | Change | Mutate state         |
| 07   | Negate | Logical inversion    |
| 08   | Create | Generate files/dirs  |
| 09   | Show   | Terminal output      |
| 10   | Keep   | Pin to context       |
| 12   | Test   | Validate/verify      |
| 14   | Bind   | Create edges         |
| 16   | Decay  | Garbage collect      |
| 20   | Void   | Sandbox isolation    |
| 25   | Catch  | Error handler        |

## Audit Workflow

Mandell OS now includes a SUSX50 audit harness for repeatable validation.

### Run audit

```bash
npm run audit
```

This executes the suite of audit seeds and validates:

- tokenization stability
- AST and flow graph construction
- coherence threshold checks
- memory logging (warm + cold)
- execution correctness

### Automated testing

```bash
npm test
```

This runs:

- lexer/parser flow tests
- router execution tests
- audit harness pass validation

## Memory Architecture

### Hot Memory

```javascript
hotMemory = {
  focus: current_node,
  context: [stack_of_active_items],
  temperature: 26,
};
```

### Warm Memory

Persistent JSON log at `memory/session_history.json`:

```json
{
  "sessions": [...],
  "rupats": [
    { "timestamp": 1234567, "dell": "08", "input": {...}, "output": {...} }
  ]
}
```

### Cold Memory

Vector-searchable archive at `memory/archive.json` for RAG retrieval.

## Bounded Orbit Coherence

Prevents semantic drift through the equation:
$$C_{n+1} = C_n^2 + \Delta_c$$

Where:

- $|C_n| < 2.0$ = bounded (valid)
- $|C_n| \geq 2.0$ = divergent (error)

## Configuration

### Environment (.env)

```env
GEMINI_API_KEY=your_key_here
NODE_ENV=development
DEBUG=false
```

### Tone Matrices (`persona/`)

Create custom JSON files for different personas:

```json
{
  "name": "CustomTone",
  "description": "Your custom tone",
  "matrix": {
    "communication": "...",
    "logic": "...",
    "rules": [...]
  }
}
```

## Testing

### Test Seed

```
00[Nova_Test] >>> 08⟨Tone:Surgical⟩[Hello_World.txt] >>> 09[Show]
```

### Expected Output

1. **Lexer**: Tokenizes input
2. **Parser**: Builds AST with coherence validation
3. **Router**: Executes Dells in sequence
4. **Memory**: Logs execution to warm/cold storage
5. **Visualizer**: Renders terminal grid with OpBox positions
6. **Output**: File created + terminal display

## File Structure

```
Mandell_OS/
├── run.js                          # Master execution switch
├── package.json                    # Dependencies
├── .env.example                    # Environment template
├── Gemini.md                       # System persona lock
├── engine/
│   ├── mandell_lexer.js           # Tokenizer
│   ├── mandell_parser.js          # AST builder
│   ├── terminal_architect.js      # Gemini bridge
│   └── MandellDictionary.js       # Morpheme registry
├── runtime/
│   ├── core_dells.js              # Dell implementations (00-25)
│   └── rupat_router.js            # Flow engine
├── memory/
│   ├── heap_manager.js            # Hot/Warm/Cold memory
│   ├── session_history.json       # Warm log
│   └── archive.json               # Cold RAG
├── visualizer/
│   └── grid_render.js             # Terminal grid
├── persona/
│   └── persona_snap.js            # Tone matrices
└── lexicon/
    └── MandellDictionary.js       # (Mirror copy)
```

## Error Handling

### BoundaryException

Thrown when coherence exceeds 2.0 (semantic drift).

### ParseError

Thrown for invalid Mandell syntax.

### DellError

Thrown when Dell execution fails.

## Future Enhancements

- [ ] Real Gemini API full integration
- [ ] Streaming output support
- [ ] Multi-threaded Dell execution
- [ ] Network-based Dell distribution
- [ ] Advanced UI with web dashboard
- [ ] Recursive pattern discovery
- [ ] Self-modifying code execution

## License

MIT

## Author

Mandell Architect
