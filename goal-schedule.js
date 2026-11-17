// Calendar dates are civil dates, so daylight-saving changes must not alter their length.
const DAY = 86400000;

function dayNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return NaN;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time / DAY : NaN;
}

function dayKey(day) {
  return new Date(day * DAY).toISOString().slice(0, 10);
}

function hourValue(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return NaN;
  const hour = Number(match[1]), minute = Number(match[2]);
  return minute < 60 && (hour < 24 || (hour === 24 && minute === 0)) ? hour + minute / 60 : NaN;
}

export function goalSchedule(goal) {
  const firstDay = dayNumber(goal.date);
  const start = hourValue(goal.time);
  if (!Number.isFinite(firstDay) || !Number.isFinite(start) || start >= 24) return null;
  const parsedEnd = hourValue(goal.endTime);
  const end = Number.isFinite(parsedEnd) ? parsedEnd : Math.min(24, start + 1);
  const lastDay = goal.endDate ? dayNumber(goal.endDate) : firstDay + (Number.isFinite(parsedEnd) && end <= start ? 1 : 0);
  if (!Number.isFinite(lastDay) || lastDay < firstDay || (lastDay === firstDay && end <= start)) return null;
  return { firstDay, lastDay, start, end, endDate: dayKey(lastDay) };
}

export function goalScheduleError(goal) {
  if (goal.endDate && (!goal.date || dayNumber(goal.endDate) < dayNumber(goal.date))) return "Дата окончания должна быть не раньше даты начала.";
  if (goal.date && goal.time && goal.endTime && !goalSchedule(goal)) return "Окончание должно быть позже начала. Для другой даты укажите дату окончания.";
  return "";
}

export function goalScheduleRange(goal) {
  const range = goal.endTime ? `${goal.time}–${goal.endTime}` : goal.time;
  const schedule = goalSchedule(goal);
  if (!schedule || schedule.lastDay === schedule.firstDay) return range;
  return `${range} (до ${schedule.endDate.split("-").reverse().join(".")})`;
}

export function goalScheduleSegments(goal, visibleDates) {
  const schedule = goalSchedule(goal);
  if (!schedule) return [];
  const { firstDay, lastDay, start, end } = schedule;
  // Only materialize visible dates, even for an event spanning many months.
  return [...new Set(visibleDates)].flatMap(date => {
    const day = dayNumber(date);
    if (!Number.isFinite(day) || day < firstDay || day > lastDay) return [];
    const segmentStart = day === firstDay ? start : 0;
    const segmentEnd = day === lastDay ? end : 24;
    if (segmentEnd <= segmentStart) return [];
    return [{ date, start: segmentStart, end: segmentEnd,
      continuesBefore: day > firstDay, continuesAfter: day < lastDay,
      scheduleRange: goalScheduleRange(goal) }];
  });
}

export function repeatedGoalEndDate(goal, newStartDate) {
  if (!goal.endDate) return "";
  return dayKey(dayNumber(newStartDate) + dayNumber(goal.endDate) - dayNumber(goal.date));
}
