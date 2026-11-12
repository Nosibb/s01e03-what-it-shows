// One ticket per problem in a merged ticket. Builds on causes.ts and adds the problem it cannot see:
// the desk's own footnote: reports read as a one-day move (desk-notes.json `oneDayMove`), counted
// under the cause they are filed in, by tenant.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export const PROBLEMS: Record<Problem, { title: string; what: string }> = {
  parser: {
    title: 'Shared parser reads day-first dates month first',
    what: 'Day and month swap: 7 April comes out as 4 July. Every day-first tenant, app and email, and the booking-v2 form.',
  },
  hint: {
    title: 'booking-v3 form hints MM/DD/YYYY but reads the tenant’s day first',
    what: 'People type what the hint tells them, month first; the form reads it day first. Only the form channel of booking-v3 tenants.',
  },
  'one-day': {
    title: 'Dates move by one day, not flipped',
    what: 'Tuesday shows as Monday; the same meeting lands on different days in Lisbon and Toronto. Looks like a time-zone bug, not a parser one.',
  },
  unplaced: { title: 'No cause on file', what: 'Tenant unknown or writes month first.' },
};

// The desk's view, as exported: every report is counted where causes.ts files it (by tenant).
// The one-day moves stay counted under the cause they are filed in and are footnoted there.
export type ProblemRow = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string; alsoIn?: Problem; readAsOneDay: number };

function row(problem: Problem, rs: Report[], oneDayMove: readonly string[], alsoIn?: Problem): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1],
    alsoIn, readAsOneDay: problem === 'one-day' ? 0 : rs.filter((r) => oneDayMove.includes(r.id)).length,
  };
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: ProblemRow[]; total: number; rawRows: number } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const c: Problem = causeOf(r, tenantOf(r)) ?? 'unplaced';
    by.set(c, [...(by.get(c) ?? []), r]);
  }
  const rows = [...by.entries()].map(([p, rs]) => row(p, rs, oneDayMove)).sort((a, b) => b.reports.length - a.reports.length);
  return { rows, total: merged.length, rawRows: all.filter((r) => r.mergedInto === ticket).length };
}
