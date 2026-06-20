# 09 - Mandel JSON Preamble Binding

Goal: Enforce payload preamble structure and insertion when missing.

Tasks:
- create a `preamble` builder in `engine/terminal_architect.js`
- validate incoming/outgoing payloads for preamble presence
- auto-insert preamble if absent and log event
