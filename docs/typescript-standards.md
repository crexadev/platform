# TypeScript Standards

CREXA uses strict TypeScript across the Next.js application. These conventions keep the codebase safe, readable, and consistent as the platform grows.

## Core rules

- **Strict TypeScript is required.** The project runs with `"strict": true` in `tsconfig.json`.
- **Avoid `any`.** It disables type checking and hides bugs.
- **Prefer `unknown` when a value is not yet understood.** Narrow it with validation before use.
- **Validate external data before trusting it.** Treat API responses, form input, and third-party payloads as untrusted until checked.
- **Prefer inferred types when they are clear.** Let TypeScript infer local variables and simple return types.
- **Add explicit types at public boundaries.** Export functions, API handlers, and shared utilities should declare their inputs and outputs.
- **Type component props.** Use explicit prop types for components that accept arguments.

## Types and interfaces

- **Use `type` by default** for simple object shapes, unions, and aliases.
- **Use `interface` when declaration merging or extension is genuinely beneficial.** Do not default to `interface` for every object shape.
- **Keep types close to the feature that owns them.** Colocate types with the module or component that uses them.
- **Create shared types only when genuinely shared.** Avoid premature `types/` folders or global type files.

## Safety

- **Avoid unsafe type assertions.** Do not use `as SomeType` to silence errors without evidence the assertion is correct.
- **Avoid `@ts-ignore` and `@ts-nocheck`.** Fix the underlying type problem instead.
- **Type API responses, database results, forms, and external-service inputs** when those systems are added later.

## Imports

- **Use the `@/*` import alias** to reference files under `src/`.

  ```ts
  import { example } from "@/lib/example";
  ```

- Prefer `@/*` over long relative paths such as `../../../`.

## Workflow

- **Run `pnpm typecheck` before committing** to catch type errors early.
- `pnpm typecheck` runs `tsc --noEmit` and complements `pnpm lint` and `pnpm build`.
