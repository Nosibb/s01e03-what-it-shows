<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, splitTicket, type Problem } from '#lib/kb/split';

  // tickets: problem → link to the ticket filed for it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.total}</strong> reports in #{ticket} ({split.rawRows} rows in the export; {split.rawRows - split.total} are the same report twice) ·
  <strong>{split.rows.length}</strong> problems · one ticket each · counted the desk's way, by tenant
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each split.rows as row (row.problem)}
      <tr>
        <td><code>{row.problem}</code> {PROBLEMS[row.problem].title}<br /><span class="what">{PROBLEMS[row.problem].what}</span></td>
        <td>{row.reports.length}{#if row.alsoIn}<sup>*</sup>{/if}</td>
        <td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
        <td>{#if tickets[row.problem]}<a href={tickets[row.problem]}>{tickets[row.problem]?.replace(/^.*\/issues\//, '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.rows as row (row.problem)}
  {#if row.readAsOneDay}
    <p class="note">{row.readAsOneDay} of the {row.reports.length} <code>{row.problem}</code> reports read as a one-day move; filed under <code>{row.problem}</code> by tenant.</p>
  {/if}
  {#if row.alsoIn}
    <p class="note"><sup>*</sup> the same {row.reports.length} reports, counted under <code>{row.alsoIn}</code> above: the desk files them there by tenant.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .what { color: var(--muted); font-size: 0.85em; }
</style>
