import type { WeekDay } from '../game/types';

const days: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const labels: Record<WeekDay, string> = {
  MON: 'Read',
  TUE: 'Build',
  WED: 'Shock',
  THU: 'Risk',
  FRI: 'Expiry'
};

export function MarketWeekStrip({ currentDay, week }: { currentDay: WeekDay; week: number }) {
  return (
    <section className="week-strip" aria-label="Market week">
      <div className="section-heading">
        <h2>Week {week}</h2>
        <span>Friday expiry is the judgment day.</span>
      </div>
      <div className="day-track">
        {days.map((day) => (
          <div className={day === currentDay ? 'day-card active' : 'day-card'} key={day}>
            <strong>{day}</strong>
            <span>{labels[day]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
