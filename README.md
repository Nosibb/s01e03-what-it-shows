# S01E03 · what it shows

The support desk merged 412 reports about dates into one ticket, #4471, and marked it known.
#4471 holds two problems. Each has one ticket (GitHub issue) here, with how many reports it covers:

| issue | problem | reports |
|---|---|---|
| [#1](../../issues/1) | `parser`: shared parser reads day-first dates month first | 379 (5 read as a one-day move, footnoted) |
| [#2](../../issues/2) | `hint`: booking-v3 form hints `MM/DD/YYYY` but reads day first | 33 |
| | total (unique report ids, counted the desk's way, by tenant) | 412 |

## The page

- Source: [`support-kb/src/routes/kb/incidents/4471-split/+page.svx`](support-kb/src/routes/kb/incidents/4471-split/+page.svx), signed `Nosibb` (desk ref `DR-AWR2-72PE`)
- Logic: [`support-kb/src/lib/kb/split.ts`](support-kb/src/lib/kb/split.ts), [`SplitTable.svelte`](support-kb/src/lib/kb/SplitTable.svelte)
- As the desk will see it: [`rendered/kb/incidents/4471-split.html`](rendered/kb/incidents/4471-split.html)

## Layout

- `support-kb/`: the desk's kb export, unchanged, plus the page above and the build config (SvelteKit + mdsvex) the export did not ship.
- `rendered/`: the static build of the kb (`cd support-kb && npm ci && npm run build`, then `build/` → `rendered/`).
