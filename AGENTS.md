# AGENTS.md — niyom-mobile-app

Expo SDK 57 + React Native field client for Niyom.

## Stack

- Expo (TypeScript)
- React Native Paper (MD3) for UI — theme in `src/theme/paper.ts`, wrappers in `src/components/ui.tsx`
- React Navigation (`native-stack` + JS `@react-navigation/bottom-tabs` for Expo Go)
- `@shopify/flash-list` for virtualized lists
- TanStack Query
- Axios + Bearer access JWT + opaque refresh in `expo-secure-store`
- Mobile OTP login via `/api/mobile/auth/otp/*` (not web cookie `/api/auth/login`)

## Layout

```
src/
  api/           # httpClient + mobile API wrappers
  hooks/         # TanStack Query hooks (useGetZones, useGetUnits, …)
  utils/
    query-key-manager/  # defineKey + QueryKeyManager (same as web)
    query-keys/         # zoneKeys / customerKeys / unitKeys / transactionKeys
  context/       # Auth + Work (zone/month/type)
  navigation/    # Root / tabs / stacks
  screens/       # Package A screens (Thai UI)
  components/    # Screen shell + small UI primitives
  theme/         # colors + Paper theme
  types/         # API types
```

### Data flow

1. `api/mobile.ts` — raw axios calls
2. `utils/query-keys/<domain>.ts` via `defineKey` + `QueryKeyManager.create` — never inline query key arrays
3. `hooks/use*.ts` — `useQuery` / `useMutation` wrappers
4. Screens consume hooks only

## Commands

Package manager: **pnpm** (Node `>=24.11.1`, see `packageManager` in `package.json`).

```bash
pnpm install
pnpm start
pnpm ios
pnpm android
pnpm expo install <pkg>   # Expo-compatible native deps

pnpm biome:check          # biome check .
pnpm biome:fix            # biome check --write --unsafe .
pnpm typecheck            # tsc --noEmit
pnpm pre-commit           # husky pre-commit (Biome on staged files)
pnpm pre-push             # husky pre-push: typecheck
```

- **Biome** is the primary linter/formatter.
- Husky (`.husky/`): **pre-commit** Biome on staged files; **pre-push** runs `pnpm typecheck`.
- Always run `pnpm biome:fix` then `pnpm typecheck` before considering a change done.
## Conventions

- Thai UI copy for field workers
- Person-centric unit/pay flows (list → detail)
- Do not call web cookie `/api/auth/login` — use `/api/mobile/auth/*`
- Keep business rules on the API; mobile stays a thin client

## Cursor / Claude agent setup

| Kind | Path | Role |
|------|------|------|
| Project memory | `AGENTS.md` / `CLAUDE.md` | Architecture + commands |
| Skills | `.cursor/skills/*/SKILL.md`, `.agents/skills/` | Agent workflows |
| Claude Code twin | `.claude/skills/` | Same skills for Claude Code |

When a skill matches the task, **read and follow that `SKILL.md` first**.

Installed: `vercel-react-native-skills` — React Native / Expo performance best practices (lists, animations, navigation, UI). Use when building or optimizing RN/Expo code. Full guide: `.agents/skills/vercel-react-native-skills/AGENTS.md`.
