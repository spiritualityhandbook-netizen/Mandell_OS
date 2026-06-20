# 01 - Nova Absolute Silence

Goal: Implement the NOVA absolute reset handler: clear ephemeral context, release previous instructions, and initialize the Greekmandell preamble.

Tasks:
- create function to wipe `HotContext` in memory manager
- emit Mandel JSON preamble for fresh sessions
- add unit test to ensure reset clears expected keys

Implementation notes:
- This will integrate with `memory/heap_manager.js` and runtime entrypoints.
