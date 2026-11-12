// One ticket per problem in a merged ticket. Builds on causes.ts and adds the problem it cannot see:
// reports whose dates moved by one day, not flipped (desk-notes.json `oneDayMove`). The desk filed
// those under `parser` by tenant; their bodies show a one-day shift, so they are their own problem.
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

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemRow = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: ProblemRow[]; total: number; rawRows: number } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const rows = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { rows, total: merged.length, rawRows: all.filter((r) => r.mergedInto === ticket).length };
}
