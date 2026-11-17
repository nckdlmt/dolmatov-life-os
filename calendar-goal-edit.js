import { goalSchedule, goalOccurrence, isRecurringGoal, occursOnDate, recurrenceSettings, defaultOccurrenceDate } from './goal-schedule.js?v=calendar-edit-2';

const DAY = 1440;
const dateMinute = date => Date.parse(`${date}T00:00:00Z`) / 60000;
const dateKey = minute => new Date(minute * 60000).toISOString().slice(0, 10);
const shiftDate = (date, days) => dateKey(dateMinute(date) + days * DAY);
const clock = minute => `${String(Math.floor(minute / 60)).padStart(2,'0')}:${String(minute % 60).padStart(2,'0')}`;

export function calendarGoalBounds(goal, occurrenceDate = goal.date) {
  const schedule = goalSchedule(goalOccurrence(goal, occurrenceDate));
  return schedule ? { start: schedule.firstDay * DAY + Math.round(schedule.start * 60), end: schedule.lastDay * DAY + Math.round(schedule.end * 60) } : null;
}

export function calendarRangeFromBounds({ start, end }) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('Окончание должно быть позже начала.');
  const date = dateKey(start), endDate = dateKey(end);
  return { date, time: clock(start - dateMinute(date)), endTime: clock(end - dateMinute(endDate)), endDate: endDate === date ? '' : endDate };
}

export function adjustCalendarBounds(bounds, mode, delta) {
  const step = Math.round(delta / 15) * 15;
  if (mode === 'start') return { start: Math.min(bounds.end - 15, bounds.start + step), end: bounds.end };
  if (mode === 'end') return { start: bounds.start, end: Math.max(bounds.start + 15, bounds.end + step) };
  return { start: bounds.start + step, end: bounds.end + step };
}

function cleanSeriesBackups(goal) {
  delete goal.seriesConversionBackup;
  delete goal.recurrenceMergeBackup;
  delete goal.occurrenceDate;
  return goal;
}

function dateState(goal, predicate, shift = 0) {
  const list = key => (goal[key] || []).filter(predicate).map(date => shiftDate(date,shift));
  const map = key => Object.fromEntries(Object.entries(goal[key] || {}).filter(([date]) => predicate(date)).map(([date,value]) => [shiftDate(date,shift),value]));
  return { doneDates:list('doneDates'), excludedDates:list('excludedDates'), completionDates:map('completionDates'), checklistDoneByDate:map('checklistDoneByDate') };
}

function shiftedSeries(goal, occurrenceDate, range, future) {
  const changed = calendarGoalBounds(range);
  const days = Math.round((dateMinute(range.date) - dateMinute(occurrenceDate)) / DAY);
  const newDate = future ? range.date : shiftDate(goal.date,days);
  const start = dateMinute(newDate) + changed.start - dateMinute(range.date);
  const updated = cleanSeriesBackups({ ...goal, ...calendarRangeFromBounds({start,end:start+changed.end-changed.start}),
    recurrence: { ...goal.recurrence, anchorDate:shiftDate(goal.recurrence.anchorDate || goal.date,days) },
    ...dateState(goal,date => !future || date >= occurrenceDate,days) });
  if (goal.recurrence.until) updated.recurrence.until = shiftDate(goal.recurrence.until,days);
  const settings = recurrenceSettings(goal);
  if (settings.basis === 'completion') updated.recurrence.nextDate = shiftDate(defaultOccurrenceDate(goal,occurrenceDate),days);
  if (days && settings.unit === 'week') {
    updated.recurrence = { ...updated.recurrence, frequency:'custom', unit:'week', interval:settings.interval,
      weekdays:settings.weekdays.map(day => ((day+days)%7+7)%7), weekPhaseOffset:(Number(goal.recurrence.weekPhaseOffset) || 0)+days };
  }
  // Moving a clamped month-end occurrence to a specific date establishes that day
  // for the series; a time-only resize keeps the original month/year anchor.
  if (days && ['month','year'].includes(settings.unit) && settings.basis !== 'completion' && !occursOnDate({...updated,excludedDates:[]},range.date)) {
    const anchor = new Date(`${updated.recurrence.anchorDate}T00:00:00Z`);
    const target = new Date(`${range.date}T00:00:00Z`);
    anchor.setUTCDate(1);
    if (settings.unit === 'year') anchor.setUTCMonth(target.getUTCMonth());
    anchor.setUTCDate(target.getUTCDate());
    updated.recurrence.anchorDate = anchor.toISOString().slice(0,10);
    if (!future) {
      const base = dateMinute(updated.recurrence.anchorDate) + start - dateMinute(newDate);
      Object.assign(updated,calendarRangeFromBounds({start:base,end:base+changed.end-changed.start}));
    }
  }
  return updated;
}

// Immutable transaction: a cancelled dialog never changes a goal, and a detached
// occurrence is excluded from its original series before it becomes standalone.
export function editCalendarGoal(goals, { goalId, occurrenceDate, range, scope = 'one', newId }) {
  const original = goals.find(goal => goal.id === goalId);
  if (!original || !calendarGoalBounds(range)) throw new Error('Цель или выбранное время недоступны.');
  const goal = structuredClone(original);
  if (!isRecurringGoal(goal)) return goals.map(item => item.id === goalId ? { ...goal, ...range } : item);
  if (!occursOnDate(goal,occurrenceDate)) throw new Error('Это повторение уже изменилось. Обновите календарь.');
  if (!['one','all','future'].includes(scope)) throw new Error('Выберите, какие повторения изменить.');
  if (scope === 'all' || (scope === 'future' && occurrenceDate === goal.date)) {
    const updated = shiftedSeries(goal,occurrenceDate,range,false);
    return goals.map(item => item.id === goalId ? updated : item);
  }
  if (!newId || goals.some(item => item.id === newId)) throw new Error('Не удалось создать отдельную цель.');
  if (scope === 'one') {
    const detached = cleanSeriesBackups({ ...goalOccurrence(goal,occurrenceDate), ...range, id:newId, type:'single',
      completedDate:goal.completionDates?.[occurrenceDate] || (goal.doneDates?.includes(occurrenceDate) ? occurrenceDate : null) });
    for (const key of ['recurrence','doneDates','excludedDates','completionDates','checklistDoneByDate']) delete detached[key];
    goal.excludedDates = [...new Set([...(goal.excludedDates || []),occurrenceDate])].sort();
    cleanSeriesBackups(goal);
    return goals.flatMap(item => item.id === goalId ? [goal,detached] : [item]);
  }
  const future = { ...shiftedSeries(goal,occurrenceDate,range,true), id:newId };
  goal.recurrence.until = shiftDate(occurrenceDate,-1);
  Object.assign(goal,dateState(goal,date => date < occurrenceDate));
  cleanSeriesBackups(goal);
  return goals.flatMap(item => item.id === goalId ? [goal,future] : [item]);
}
