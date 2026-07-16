# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single Next.js 16 app (`platform`, App Router under `src/app/`) using React 19, TypeScript, and Tailwind CSS v4. It is managed with **pnpm**. There is no backend, database, or external service — the web app is the only service.

Standard commands (see `package.json` scripts):

- Dev server: `pnpm dev` (Next.js dev with Turbopack, serves on `http://localhost:3000`).
- Lint: `pnpm lint` (ESLint flat config in `eslint.config.mjs`).
- Build: `pnpm build`; production start: `pnpm start` (requires a prior build).

Non-obvious notes:

- `pnpm-workspace.yaml` disables native build scripts for `sharp` and `unrs-resolver` (`allowBuilds`/`ignoredBuiltDependencies`), so `pnpm install` does not run those postinstall builds — this is intentional and does not need approval prompts.
- No environment variables or secrets are required to run, build, or test the app.
- There is no automated test suite configured.
