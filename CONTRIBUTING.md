# Contributing to agent-receipts

This is a minimalist project. We value simplicity, high clarity, and zero dependencies.

## Structure

- `src/core/` — The receipt engine and logic.
- `src/react/` — UI components and hooks.
- `examples/` — Standalone usage guides.

## Setup

```bash
git clone https://github.com/realalonw/agent-receipts
cd agent-receipts
npm install
```

## Making Changes

1. **Keep it minimal**: Don't add a library if 5 lines of pure TypeScript will do.
2. **Pedagogical code**: Code should be readable and educational.
3. **No magic**: Avoid complex abstractions. Standard objects and functions preferred.

## Workflow

```bash
# Typecheck
npm run typecheck

# Test the hello world example
npm test
```

By contributing, you agree that your work will be licensed under the MIT License.
