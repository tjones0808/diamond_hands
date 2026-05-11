import type { RunState, WeekDay } from '../game/types';

const dayOrder: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export function advanceDay(run: RunState): RunState {
  const currentIndex = dayOrder.indexOf(run.day);
  if (currentIndex < dayOrder.length - 1) {
    return { ...run, day: dayOrder[currentIndex + 1] };
  }

  return {
    ...run,
    week: run.week + 1,
    day: 'MON',
    weekLog: [...run.weekLog, `Week ${run.week + 1} begins.`]
  };
}
