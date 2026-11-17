import test from 'node:test';
import assert from 'node:assert/strict';
import { editCalendarGoal, calendarGoalBounds, calendarRangeFromBounds, adjustCalendarBounds } from '../calendar-goal-edit.js';
import { occursOnDate, defaultOccurrenceDate, goalCalendarOccurrences, goalScheduleSegments, setOccurrenceDone } from '../goal-schedule.js';

const breakfast = {id:'breakfast',title:'Завтрак и сборы',areaId:'physio',initiativeId:'food',activityId:'meal',
  date:'2027-01-13',time:'09:00',endTime:'10:00',recurrence:{frequency:'custom',unit:'week',interval:1,weekdays:[3,4,5,6]},
  checklist:[{id:'check',title:'Сборы',done:false}],done:false};
const edit = (goal, date, delta, scope='one', mode='move') => editCalendarGoal([goal], {goalId:goal.id,occurrenceDate:date,
  range:calendarRangeFromBounds(adjustCalendarBounds(calendarGoalBounds(goal,date),mode,delta)),scope,newId:goal.id+'-detached'});

test('moving one completed occurrence detaches it with its contents and excludes the old occurrence',()=>{
  const source = {...breakfast,doneDates:['2027-01-14'],completionDates:{'2027-01-14':'2027-01-14'},checklistDoneByDate:{'2027-01-14':{check:true}}};
  const before=JSON.stringify(source);
  const [series,one]=edit(source,'2027-01-14',2*1440+90);
  assert.equal(JSON.stringify(source),before);
  assert.equal(occursOnDate(series,'2027-01-14'),false);
  assert.equal(occursOnDate(series,'2027-01-21'),true);
  assert.equal(one.recurrence,undefined);
  assert.equal(one.date,'2027-01-16');assert.equal(one.time,'10:30');assert.equal(one.endTime,'11:30');
  assert.equal(one.done,true);assert.equal(one.checklist[0].done,true);
  assert.equal(one.activityId,'meal');assert.equal(one.title,source.title);
});

test('resizing one occurrence keeps all other occurrences and clamps to 15 minutes',()=>{
  const [series,one]=edit(breakfast,'2027-01-15',30,'one','end');
  assert.equal(one.time,'09:00');assert.equal(one.endTime,'10:30');assert.equal(series.endTime,'10:00');
  const [,short]=edit(breakfast,'2027-01-15',120,'one','start');
  assert.equal(short.time,'09:45');assert.equal(short.endTime,'10:00');
});

test('all occurrences shift dates, weekdays, history and repeat-until together',()=>{
  const [series]=edit({...breakfast,recurrence:{...breakfast.recurrence,until:'2027-02-13'},doneDates:['2027-01-13'],excludedDates:['2027-01-14']},'2027-01-20',1440+30,'all');
  assert.equal(series.id,breakfast.id);assert.equal(series.date,'2027-01-14');
  assert.equal(series.time,'09:30');assert.equal(series.endTime,'10:30');
  assert.deepEqual(series.recurrence.weekdays,[4,5,6,0]);
  assert.equal(series.recurrence.until,'2027-02-14');assert.deepEqual(series.doneDates,['2027-01-14']);
  assert.equal(occursOnDate(series,'2027-01-15'),false);assert.equal(occursOnDate(series,'2027-01-17'),true);
});

test('this and following split the series, preserve the past, and can be edited again',()=>{
  const [past,future]=edit(breakfast,'2027-01-15',30,'future');
  assert.equal(past.recurrence.until,'2027-01-14');assert.equal(past.time,'09:00');
  assert.equal(future.date,'2027-01-15');assert.equal(future.time,'09:30');
  for(const date of ['2027-01-13','2027-01-14','2027-01-15','2027-01-16','2027-01-20']) {
    assert.equal([past,future].filter(goal=>occursOnDate(goal,date)).length,1,date);
  }
  const [,single]=edit(future,'2027-01-20',-30,'one','start');
  assert.equal(single.date,'2027-01-20');assert.equal(single.time,'09:00');assert.equal(single.endTime,'10:30');
});

test('a future split preserves two-week phase across a week boundary when moved',()=>{
  const goal={...breakfast,recurrence:{frequency:'custom',unit:'week',interval:2,weekdays:[3,6]}};
  const [past,future]=edit(goal,'2027-01-16',2*1440,'future');
  assert.equal(occursOnDate(past,'2027-01-13'),true);
  assert.equal(occursOnDate(future,'2027-01-18'),true);
  assert.equal(occursOnDate(future,'2027-01-22'),false);
  assert.equal(occursOnDate(future,'2027-01-29'),true);
  assert.equal(defaultOccurrenceDate(future,'2027-01-19'),'2027-01-29');
});

test('month-end and leap-year phase survive time-only future splits',()=>{
  const monthly={...breakfast,date:'2027-01-31',recurrence:{frequency:'monthly'}};
  const [,future]=edit(monthly,'2027-02-28',30,'future','end');
  assert.equal(occursOnDate(future,'2027-03-31'),true);assert.equal(occursOnDate(future,'2027-03-28'),false);
  const yearly={...breakfast,date:'2024-02-29',recurrence:{frequency:'yearly'}};
  const [,later]=edit(yearly,'2027-02-28',30,'future');
  assert.equal(occursOnDate(later,'2028-02-29'),true);
});

test('overnight goal can move via its morning continuation or resize across midnight',()=>{
  const sleep={...breakfast,date:'2027-01-10',time:'23:00',endTime:'07:00',recurrence:{frequency:'daily'}};
  const [,one]=edit(sleep,'2027-01-12',60);
  assert.equal(one.date,'2027-01-13');assert.equal(one.time,'00:00');assert.equal(one.endTime,'08:00');
  const [,resized]=edit(sleep,'2027-01-12',-30,'one','start');
  assert.equal(resized.time,'22:30');assert.equal(resized.endDate,'2027-01-13');
  assert.deepEqual(goalScheduleSegments(resized,['2027-01-12','2027-01-13']).map(s=>[s.start,s.end]),[[22.5,24],[0,7]]);
});

test('excluded occurrences disappear from the calendar and default selection, including completion-based repeats',()=>{
  for(const recurrence of [{frequency:'daily'},{frequency:'custom',unit:'day',interval:1,basis:'completion'}]) {
    const [series]=edit({...breakfast,recurrence},'2027-01-13',30);
    assert.equal(defaultOccurrenceDate(series,'2027-01-13'),'2027-01-14');
    assert.deepEqual(goalCalendarOccurrences(series,['2027-01-13','2027-01-14']).map(g=>g.date),['2027-01-14']);
  }
});

test('single goals preserve their identity, full multi-day duration and metadata',()=>{
  const source={...breakfast,recurrence:null,endDate:'2027-01-16'};
  const [goal]=edit(source,source.date,-1440);
  assert.equal(goal.id,source.id);assert.equal(goal.date,'2027-01-12');assert.equal(goal.endDate,'2027-01-15');
  assert.deepEqual(goal.checklist,source.checklist);
});

test('moving a completion-based series moves the pending event then resumes from actual completion',()=>{
  const source={...breakfast,recurrence:{frequency:'custom',unit:'day',interval:2,basis:'completion'},doneDates:['2027-01-13'],completionDates:{'2027-01-13':'2027-01-14'}};
  const [series]=edit(source,'2027-01-16',1440,'all');
  assert.equal(occursOnDate(series,'2027-01-16'),false);
  assert.equal(occursOnDate(series,'2027-01-17'),true);
  setOccurrenceDone(series,'2027-01-17',true,'2027-01-18');
  assert.equal(defaultOccurrenceDate(series,'2027-01-19'),'2027-01-20');
});

test('invalid scopes, stale occurrences, duplicate identities and invalid ranges do not mutate data',()=>{
  const before=JSON.stringify(breakfast);
  assert.throws(()=>edit(breakfast,'2027-01-18',15));
  assert.throws(()=>edit(breakfast,'2027-01-13',15,'bad'));
  assert.throws(()=>editCalendarGoal([breakfast],{goalId:breakfast.id,occurrenceDate:breakfast.date,range:{date:'oops'},newId:'new'}));
  assert.equal(JSON.stringify(breakfast),before);
});
