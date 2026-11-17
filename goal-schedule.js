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

export function isRecurringGoal(goal) {
  return Boolean(goal?.recurrence && ['daily','weekdays','weekly','monthly','yearly','custom'].includes(goal.recurrence.frequency));
}

export function recurrenceSettings(goal) {
  const rule = goal.recurrence || {};
  const units = {daily:'day',weekdays:'week',weekly:'week',monthly:'month',yearly:'year'};
  const unit = units[rule.frequency] || (['day','week','month','year'].includes(rule.unit) ? rule.unit : 'day');
  const interval = rule.frequency === 'custom' ? Math.max(1,Math.min(999,Math.floor(Number(rule.interval) || 1))) : 1;
  const weekday = new Date(`${goal.date}T00:00:00Z`).getUTCDay();
  const weekdays = rule.frequency === 'weekdays' ? [1,2,3,4,5] : rule.frequency === 'custom' && rule.weekdays?.length ? [...new Set(rule.weekdays.map(Number))].filter(n=>n>=0&&n<7) : [weekday];
  return {unit,interval,weekdays,basis:rule.basis === 'completion' ? 'completion' : 'scheduled'};
}

export function recurrenceLabel(goal) {
  if (!isRecurringGoal(goal)) return '';
  const labels = {daily:'Ежедневно', weekdays:'Каждый будний день', weekly:'Еженедельно',monthly:'Ежемесячно',yearly:'Ежегодно'};
  if (goal.recurrence.frequency !== 'custom') return labels[goal.recurrence.frequency];
  const rule = recurrenceSettings(goal);
  return `Каждые ${rule.interval} ${({day:'дн.',week:'нед.',month:'мес.',year:'г.'})[rule.unit]}${rule.basis === 'completion' ? ' после выполнения' : ''}`;
}

function addPeriod(date, interval, unit) {
  const d = new Date(`${date}T00:00:00Z`);
  if (unit === 'day' || unit === 'week') return dayKey(dayNumber(date)+interval*(unit==='week'?7:1));
  const month = d.getUTCMonth()+(unit==='month'?interval:0);
  const year = d.getUTCFullYear()+(unit==='year'?interval:0);
  const last = new Date(Date.UTC(year,month+1,0)).getUTCDate();
  return new Date(Date.UTC(year,month,Math.min(d.getUTCDate(),last))).toISOString().slice(0,10);
}

function monday(day) { return day - (new Date(day * DAY).getUTCDay()+6)%7; }

function matchesSchedule(goal,date) {
  const first=dayNumber(goal.date), day=dayNumber(date), rule=recurrenceSettings(goal);
  if (rule.unit==='day') return (day-first)%rule.interval===0;
  if (rule.unit==='week') return ((monday(day)-monday(first))/7)%rule.interval===0 && rule.weekdays.includes(new Date(day*DAY).getUTCDay());
  const a=new Date(first*DAY), b=new Date(day*DAY);
  const months=(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth();
  if (rule.unit==='month') return months%rule.interval===0 && addPeriod(goal.date,months,'month')===date;
  const years=b.getUTCFullYear()-a.getUTCFullYear();
  return years%rule.interval===0 && addPeriod(goal.date,years,'year')===date;
}

function nextScheduledDate(goal, after) {
  const rule=recurrenceSettings(goal), first=dayNumber(goal.date), from=dayNumber(after<goal.date?goal.date:after);
  if (!Number.isFinite(first)||!Number.isFinite(from)) return goal.date;
  if (rule.unit==='day') return dayKey(first+Math.ceil((from-first)/rule.interval)*rule.interval);
  if (rule.unit==='week') {
    const week=monday(first), cycle=Math.floor((monday(from)-week)/(7*rule.interval));
    const weekdays=[...rule.weekdays].sort((a,b)=>(a+6)%7-(b+6)%7);
    for(let n=cycle;n<=cycle+1;n++) for(const weekday of weekdays) {
      const day=week+n*rule.interval*7+(weekday+6)%7;
      if(day>=first&&day>=from) return dayKey(day);
    }
  }
  const a=new Date(first*DAY),b=new Date(from*DAY);
  const distance=rule.unit==='month' ? (b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth() : b.getUTCFullYear()-a.getUTCFullYear();
  let n=Math.max(0,Math.floor(distance/rule.interval));
  let next=addPeriod(goal.date,n*rule.interval,rule.unit);
  if(dayNumber(next)<from) next=addPeriod(goal.date,(n+1)*rule.interval,rule.unit);
  return next;
}

function nextCompletionDate(goal) {
  const completed=(goal.doneDates || []).map(date=>({date,on:goal.completionDates?.[date] || date})).sort((a,b)=>a.on.localeCompare(b.on)||a.date.localeCompare(b.date));
  if(!completed.length) return nextScheduledDate(goal,goal.date);
  const rule=recurrenceSettings(goal),last=completed.at(-1);
  let next=addPeriod(last.on,rule.interval,rule.unit);
  if(rule.unit==='week') {
    for(let i=0;i<7;i++) {const candidate=dayKey(dayNumber(next)+i);if(rule.weekdays.includes(new Date(`${candidate}T00:00:00Z`).getUTCDay())) return candidate;}
  }
  return next;
}

export function occursOnDate(goal, date) {
  if (!isRecurringGoal(goal)) return goal.date === date;
  const first=dayNumber(goal.date),day=dayNumber(date);
  if(!Number.isFinite(first)||!Number.isFinite(day)||day<first||(goal.recurrence.until&&date>goal.recurrence.until)) return false;
  if(recurrenceSettings(goal).basis==='completion') return (goal.doneDates || []).includes(date)||nextCompletionDate(goal)===date;
  return matchesSchedule(goal,date);
}

export function defaultOccurrenceDate(goal,today) {
  if(!isRecurringGoal(goal)) return goal.date;
  const next=recurrenceSettings(goal).basis==='completion'?nextCompletionDate(goal):nextScheduledDate(goal,today);
  return goal.recurrence.until&&next>goal.recurrence.until ? goal.date : next;
}

export function goalOccurrence(goal, date) {
  if (!isRecurringGoal(goal)) return goal;
  const checks = goal.checklistDoneByDate?.[date] || {};
  return { ...goal, date, endDate: repeatedGoalEndDate(goal,date), occurrenceDate:date,
    done: (goal.doneDates || []).includes(date),
    checklist: (goal.checklist || []).map(item => ({...item,done:Boolean(checks[item.id])})) };
}

export function setOccurrenceDone(goal, date, done, completedOn = date) {
  if (!isRecurringGoal(goal) || !occursOnDate(goal,date)) return;
  const dates = new Set(goal.doneDates || []);
  if (done) dates.add(date); else dates.delete(date);
  goal.doneDates = [...dates].sort();
  goal.completionDates ||= {};
  if (done) goal.completionDates[date] = completedOn; else delete goal.completionDates[date];
  goal.done = false;
  goal.completedDate = null;
  if (done) {
    goal.checklistDoneByDate ||= {};
    goal.checklistDoneByDate[date] = Object.fromEntries((goal.checklist || []).map(item => [item.id,true]));
  }
}

export function goalCalendarOccurrences(goal, visibleDates) {
  if (!isRecurringGoal(goal)) return [goal];
  const days = visibleDates.map(dayNumber).filter(Number.isFinite);
  if (!days.length || !Number.isFinite(dayNumber(goal.date))) return [];
  const schedule = goalSchedule(goal);
  const durationDays = schedule ? schedule.lastDay - schedule.firstDay : 0;
  const start = Math.max(dayNumber(goal.date), Math.min(...days) - durationDays);
  const last = Math.min(Math.max(...days), goal.recurrence.until ? dayNumber(goal.recurrence.until) : Infinity);
  const result = [];
  for (let day = start; day <= last; day++) {
    const key = dayKey(day);
    if (occursOnDate(goal,key)) result.push(goalOccurrence(goal,key));
  }
  return result;
}

function mergeKey(goal) {
  const schedule = goalSchedule(goal);
  return JSON.stringify([goal.title,goal.areaId,goal.initiativeId || '',goal.activityId || '',goal.directionBlockId || '',goal.time,goal.endTime,
    schedule ? schedule.lastDay - schedule.firstDay : 0,goal.description || '',(goal.checklist || []).map(item => item.title)]);
}

export function matchingGoalCopies(goals, template) {
  const key = mergeKey(template);
  return goals.filter(goal => (goal.id === template.id || !isRecurringGoal(goal)) && /^\d{4}-\d{2}-\d{2}$/.test(goal.date || '') && mergeKey(goal) === key);
}

export function mergeGoalCopies(goals, templateId) {
  const template = goals.find(goal => goal.id === templateId);
  if (!template || !isRecurringGoal(template)) return goals;
  const copies = matchingGoalCopies(goals,template);
  if (copies.length < 2) return goals;
  const backup = copies.map(goal => JSON.parse(JSON.stringify(goal.id === templateId && goal.seriesConversionBackup ? goal.seriesConversionBackup : goal)));
  const date = copies.map(goal => goal.date).sort()[0];
  const merged = { ...template, date, endDate: repeatedGoalEndDate(template,date), done:false, completedDate:null,
    recurrenceMergeBackup:backup, doneDates:[...new Set([...(template.doneDates || []),...copies.filter(goal => goal.done).map(goal => goal.date)])].sort() };
  delete merged.seriesConversionBackup;
  merged.checklistDoneByDate = {...template.checklistDoneByDate};
  merged.completionDates = {...template.completionDates};
  copies.filter(goal=>goal.done).forEach(goal=>{merged.completionDates[goal.date]=goal.completedDate || goal.date;});
  for (const copy of copies) {
    if (!isRecurringGoal(copy)) merged.checklistDoneByDate[copy.date] = Object.fromEntries((copy.checklist || []).map((item,index)=>[merged.checklist[index]?.id,Boolean(item.done)]));
  }
  const ids = new Set(copies.map(goal => goal.id));
  return goals.flatMap(goal => goal.id === templateId ? [merged] : ids.has(goal.id) ? [] : [goal]);
}

export function restoreMergedGoalCopies(goals, templateId) {
  const template = goals.find(goal => goal.id === templateId);
  if (!template?.recurrenceMergeBackup?.length) return goals;
  const existing = new Set(goals.filter(goal=>goal.id !== templateId).map(goal=>goal.id));
  return goals.flatMap(goal=>goal.id === templateId ? template.recurrenceMergeBackup.filter(copy=>!existing.has(copy.id)) : [goal]);
}
