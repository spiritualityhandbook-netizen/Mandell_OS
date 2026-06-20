# 03 - Context Horizon Architecture

Goal: Implement Hot/Warm/Cold memory tiers and the bi-sync protocol.

Tasks:
- validate `memory/heap_manager.js` tiers and add APIs for Hot/Warm/Cold
- implement periodic sync worker (every 5s) to persist warm->cold
- add essence hash calculation (SHA256) for integrity
