export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Day = typeof DAYS[number];

export interface SubjectSlot {
  id: string;
  name: string;
  color: string;
  class_time?: string;
}

export function buildTimetableGrid(
  subjects: { id: string; name: string; color: string; schedule_days: string[]; class_time?: string }[]
): Record<Day, SubjectSlot[]> {
  const grid = Object.fromEntries(DAYS.map((d) => [d, []])) as unknown as Record<Day, SubjectSlot[]>;

  for (const subject of subjects) {
    for (const day of subject.schedule_days ?? []) {
      const normalized = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
      if (DAYS.includes(normalized as Day)) {
        grid[normalized as Day].push({
          id: subject.id,
          name: subject.name,
          color: subject.color,
          class_time: subject.class_time,
        });
      }
    }
  }

  return grid;
}

export function getTodayName(): Day {
  return DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}
