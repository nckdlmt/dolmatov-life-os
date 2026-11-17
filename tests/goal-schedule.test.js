import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { goalSchedule, goalScheduleError, goalScheduleRange, goalScheduleSegments, repeatedGoalEndDate, goalCalendarOccurrences } from '../goal-schedule.js';

const sleep = { id: 'sleep', date: '2027-01-10', time: '23:00', endTime: '07:00', title: 'Сон', initiativeId: 'sleep-container' };

test('overnight sleep is eight hours, without mutating or duplicating the goal', () => {
  const goal = Object.freeze({ ...sleep });
  assert.equal(goalScheduleError(goal), '');
  const segments = goalScheduleSegments(goal, ['2027-01-10', '2027-01-11']);
  assert.deepEqual(segments.map(({ date, start, end }) => [date, start, end]), [['2027-01-10',23,24], ['2027-01-11',0,7]]);
  assert.equal(segments.reduce((hours, s) => hours + s.end - s.start, 0), 8);
  assert.match(goalScheduleRange(goal), /11\.01\.2027/);
});

test('a week starting after the goal still contains its morning continuation', () => {
  assert.deepEqual(goalScheduleSegments(sleep, ['2027-01-11']).map(s => [s.start, s.end]), [[0,7]]);
  assert.deepEqual(goalScheduleSegments(sleep, ['2027-01-12']), []);
});

test('explicit multi-day goal covers intermediate days and keeps fractional times', () => {
  const goal = { ...sleep, time:'22:30', endTime:'08:15', endDate:'2027-01-13' };
  assert.deepEqual(goalScheduleSegments(goal, ['2027-01-10','2027-01-11','2027-01-12','2027-01-13']).map(s => [s.start,s.end]), [[22.5,24],[0,24],[0,24],[0,8.25]]);
  assert.equal(goalScheduleError({...goal, endDate:'2027-01-09'}).length > 0, true);
});

test('midnight, full-day, month/year/leap-day boundaries and daytime remain correct', () => {
  assert.deepEqual(goalScheduleSegments({...sleep, endTime:'00:00'}, ['2027-01-10','2027-01-11']).map(s => [s.start,s.end]), [[23,24]]);
  assert.equal(goalSchedule({...sleep, date:'2026-12-31'}).endDate, '2027-01-01');
  assert.equal(goalSchedule({...sleep, date:'2028-02-28'}).endDate, '2028-02-29');
  assert.equal(goalSchedule({...sleep, date:'2027-02-28'}).endDate, '2027-03-01');
  assert.equal(goalSchedule({...sleep, time:'07:00'}).endDate, '2027-01-11');
  assert.deepEqual(goalScheduleSegments({...sleep,time:'09:00',endTime:'10:30'}, ['2027-01-10']).map(s => [s.start,s.end]), [[9,10.5]]);
  assert.deepEqual(goalScheduleSegments({...sleep,time:'без времени'}, ['2027-01-10']), []);
});

test('daily repeats retain the explicit duration instead of a stale end date', () => {
  assert.equal(repeatedGoalEndDate({...sleep,endDate:'2027-01-12'},'2027-01-17'),'2027-01-19');
  assert.equal(repeatedGoalEndDate(sleep,'2027-01-17'),'');
});

test('calendar integration renders both parts with the same editable goal and completion state', () => {
  const source = readFileSync(new URL('../app.js',import.meta.url),'utf8');
  const functions = source.slice(source.indexOf('function calendarEventFromGoal('), source.indexOf('\nfunction ', source.indexOf('function calendarEventsByDate(') + 10));
  const state = {goals:[{...sleep,done:false}],events:[],recurringEvents:[]};
  const ctx = vm.createContext({state,goalScheduleSegments,goalCalendarOccurrences,goalHasScheduledTime:g=>!!goalSchedule(g),findInitiativeOrDirectionBlock:()=>({name:'Сон'}),recurringEventsForDate:()=>[]});
  vm.runInContext(functions,ctx);
  const events = vm.runInContext("calendarEventsByDate(['2027-01-10','2027-01-11'])",ctx);
  assert.equal(events.get('2027-01-10')[0].goalId,'sleep');
  assert.equal(events.get('2027-01-11')[0].goalId,'sleep');
  state.goals[0].done = true;
  assert.equal(vm.runInContext("calendarEventsByDate(['2027-01-11']).get('2027-01-11')[0].done",ctx),true);
  assert.equal(state.goals.length,1);
});
