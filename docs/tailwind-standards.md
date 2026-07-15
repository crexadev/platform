# Tailwind CSS Standards

CREXA uses Tailwind CSS v4 for styling. These conventions keep the design system consistent as the platform grows.

## Framework rules

- **Use Tailwind CSS v4 conventions.** Import Tailwind once in `src/app/globals.css` with `@import "tailwindcss";`
- **Keep the main Tailwind import in `globals.css`.** Do not scatter Tailwind imports across component files.
- **Do not create a Tailwind config file without a verified need.** Tailwind v4 supports theme configuration in CSS via `@theme`.
- **Prefer utilities for component styling.** Compose layout, spacing, and typography with Tailwind classes in components.
- **Use global CSS only for resets, tokens, and true global behavior.** Avoid moving component-specific styles into `globals.css`.

## Token rules

- **Use semantic tokens** such as `background`, `foreground`, `surface`, `border`, `primary`, and `destructive`.
- **Do not hard-code repeated colors** when an approved token exists. Prefer `text-muted-foreground` over ad hoc gray values.
- **Do not create feature-specific global tokens unnecessarily.** Add tokens when multiple components share a concept.
- **Brand colors require product approval.** The current primary accent is provisional.
- **Verify contrast in light and dark modes** before relying on a token for text or interactive elements.
- **Token foreground/background pairs must meet WCAG AA contrast** (at least 4.5:1 for normal-size text) in both light and dark modes.

## Component rules

- **Keep styles close to components.** Colocate Tailwind classes with the component that uses them.
- **Avoid large unreadable class strings** when meaningful extraction is justified, but do not abstract one-off styling.
- **Do not create abstractions for one-time styling.**
- **Use responsive mobile-first utilities** (`sm:`, `md:`, etc.) when layout needs to adapt.
- **Preserve visible focus states** on interactive elements.
- **Support reduced motion** when adding animations or transitions.
- **Use semantic HTML before styling.** Structure comes first; utilities enhance it.

## Class rules

- **Do not dynamically construct incomplete Tailwind class names.** Class names must be statically analyzable.
- **Avoid arbitrary values** when a standard utility or token is appropriate.
- **Use arbitrary values only for genuine design requirements** that tokens and utilities do not cover.
- **Do not use `!important`.**
- **Avoid conflicting utility classes** on the same element.
- **Keep class ordering readable and consistent** within a component.

## Future guidance

- **Final CREXA branding has not been chosen.** The current color palette is a neutral foundation with a provisional accent.
- **The current accent is provisional** and may change after brand approval.
- **Component libraries require separate approval** before installation.
- **A theme toggle may be added later** as a separate feature. Dark mode currently follows the operating-system preference.
- **Product UI should be built from approved design specifications** once branding and feature designs are finalized.
