# Mandell OS: Pure Mandellamatrix Operating System

## Overview

Mandell OS is a pure Mandell compiler and execution engine. It is designed to be AI-agnostic, supporting any external AI bridge with optional `AI.md` or `Gemini.md` system instruction files. It focuses on Greekmandell syntax, internal lexicon expansion, bounded orbit coherence, and deterministic runtime execution.

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

# Streaming output
node run.js --stream

# Parallel Dell execution with worker pool
node run.js --workers=4

# Start a Dell distribution server
node run.js --distributed

# Enable recursive pattern discovery on parsed ASTs
node run.js --discover

# Prepare a self-modifying runtime stub
node run.js --selfmod
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

- ✅ **Core Dells (00-50)** (`runtime/core_dells.js`): Full 51-operation registry for advanced workflow control
  - `00[Nova]`: Clear state
  - `01[Solo]`: Focus a single object
  - `02[Resonance]`: Harmonic alignment and dual focus
  - `03[Tree]`: Logic and decision branches
  - `08[Create]`: Generate files
  - `09[Show]`: Terminal output
  - `20[Void]`: Sandbox isolation
  - And 43 more...
- ✅ **Router** (`runtime/rupat_router.js`): Flows payload through sequence with `>>>` arrows

### Phase 4: Memory Management

- ✅ **Hot Memory**: Active RAM context
- ✅ **Warm Memory**: Session history (session_history.json)
- ✅ **Cold Memory**: Vector-search RAG archive
- ✅ **Hypo-Thermia**: Predictive next-state layers

### Phase 5: Inter-AI Protocol

- ✅ **Terminal Architect** (`engine/terminal_architect.js`): AI bridge supporting any external model via `AI_API_KEY` and optional `AI.md` instructions
- ✅ Loads `AI.md` or `Gemini.md` as system instruction for compatibility
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
- `Duo`, `Resonate` → `02[Resonance]`
- `Tree`, `Logic` → `03[Tree]`
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

### Dell Registry (00-50)

| Code | Name      | Purpose                                    |
| ---- | --------- | ------------------------------------------ |
| 00   | Nova      | Clear state, origin                        |
| 01   | Solo      | Focus single element                       |
| 02   | Resonance | Harmonic dual focus and alignment          |
| 03   | Tree      | Evaluate logic and decision branches       |
| 04   | Change    | Mutate state                               |
| 07   | Negate    | Logical inversion                          |
| 08   | Create    | Generate files/dirs                        |
| 09   | Show      | Terminal output                            |
| 10   | Keep      | Pin to context                             |
| 12   | Test      | Validate/verify                            |
| 14   | Bind      | Create edges                               |
| 16   | Decay     | Garbage collect                            |
| 20   | Void      | Sandbox isolation                          |
| 25   | Catch     | Error handler                              |

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
AI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here   # optional fallback for Gemini compatibility
NODE_ENV=development
DEBUG=false
```
### AI Instruction File

Create an `AI.md` file at the repository root to provide system-level guidance for any AI model. If `AI.md` is not present, Mandell OS will fall back to `Gemini.md` for compatibility.

Example `AI.md` content:

```text
You are the Mandell OS Architect.
Interpret the input as a Mandell seed or natural-language Mandell command.
Prefer explicit Dell sequences over vague responses.
Return valid Mandell code when asked to execute or generate seeds.
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
├── AI.md                           # AI instruction file for any model
├── Gemini.md                       # Legacy fallback system persona lock
├── 00Mandell/                      # Archive, notes, and legacy resources
│   ├── archives/
│   │   ├── outputs/                # Archived example outputs
│   │   └── temp/                   # Hidden temp archive folders
│   ├── docs/                       # PDF/text design and reference docs
│   ├── manual/                     # Full Mandell manual resources
│   ├── notes/                      # Developer notes and drafts
│   └── visuals/                    # Visual artifacts and diagrams
├── engine/
│   ├── mandell_lexer.js           # Tokenizer
│   ├── mandell_parser.js          # AST builder
│   ├── terminal_architect.js      # AI bridge
│   └── MandellDictionary.js       # Morpheme registry
├── runtime/
│   ├── core_dells.js              # Dell implementations (00-50)
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

- [ ] Real AI API full integration
- [x] Streaming output support
- [x] Multi-threaded Dell execution
- [x] Network-based Dell distribution
- [ ] Advanced UI with web dashboard
- [x] Recursive pattern discovery
- [x] Self-modifying code execution

## License

MIT

## Author

Mandell Architect
