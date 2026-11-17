import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {isRecurringGoal,occursOnDate,defaultOccurrenceDate,goalOccurrence,goalCalendarOccurrences,goalScheduleSegments,goalSchedule,setOccurrenceDone,mergeGoalCopies,restoreMergedGoalCopies,matchingGoalCopies} from '../goal-schedule.js';
import {renderRecurrenceControls,recurrenceError} from '../recurrence-ui.js';

const goal = (overrides={})=>({id:'sleep',title:'Сон',areaId:'physio',initiativeId:'sleep',date:'2027-01-10',time:'23:00',endTime:'07:00',description:'',checklist:[],done:false,recurrence:{frequency:'daily',until:''},...overrides});

test('one recurring goal creates calendar occurrences without stored copies, including overnight spillover',()=>{
  const template=Object.freeze(goal());
  const dates=['2027-01-11','2027-01-12','2027-01-13','2027-01-14','2027-01-15','2027-01-16','2027-01-17'];
  const occurrences=goalCalendarOccurrences(template,dates);
  assert.equal(occurrences.length,8);
  assert.equal(new Set(occurrences.map(g=>g.id)).size,1);
  assert.equal(occurrences.flatMap(g=>goalScheduleSegments(g,dates)).length,14);
  assert.equal(template.date,'2027-01-10');
  assert.equal(goalCalendarOccurrences(template,['2027-02-01']).length,2);
});

test('completion and checklist reset per occurrence; undo affects only the selected date',()=>{
  const template=goal({checklist:[{id:'a',title:'A',done:false}]});
  setOccurrenceDone(template,'2027-01-11',true,'2027-01-11');
  assert.equal(template.done,false);
  assert.equal(goalOccurrence(template,'2027-01-11').done,true);
  assert.equal(goalOccurrence(template,'2027-01-12').done,false);
  assert.equal(goalOccurrence(template,'2027-01-12').checklist[0].done,false);
  setOccurrenceDone(template,'2027-01-12',true);
  setOccurrenceDone(template,'2027-01-11',false);
  assert.deepEqual(template.doneDates,['2027-01-12']);
});

test('changing one template changes every occurrence after serialization',()=>{
  const template=goal();template.title='Сон изменён';template.endTime='08:00';
  const persisted=JSON.parse(JSON.stringify(template));
  const instances=goalCalendarOccurrences(persisted,['2027-01-11','2027-01-12']);
  assert.ok(instances.every(g=>g.title==='Сон изменён'&&g.endTime==='08:00'));
});

test('all recurrence presets and optional end date',()=>{
  assert.equal(occursOnDate(goal({recurrence:{frequency:'weekdays'}}),'2027-01-16'),false);
  assert.equal(occursOnDate(goal({recurrence:{frequency:'weekdays'}}),'2027-01-11'),true);
  assert.equal(occursOnDate(goal({recurrence:{frequency:'weekly'}}),'2027-01-17'),true);
  assert.equal(occursOnDate(goal({recurrence:{frequency:'weekly'}}),'2027-01-18'),false);
  assert.equal(occursOnDate(goal({date:'2027-01-31',recurrence:{frequency:'monthly'}}),'2027-02-28'),true);
  assert.equal(occursOnDate(goal({date:'2028-02-29',recurrence:{frequency:'yearly'}}),'2029-02-28'),true);
  assert.equal(occursOnDate(goal({recurrence:{frequency:'daily',until:'2027-01-17'}}),'2027-01-18'),false);
});

test('custom intervals and selected weekdays anchor weeks on Monday',()=>{
  const weekly=goal({date:'2027-01-11',recurrence:{frequency:'custom',unit:'week',interval:2,weekdays:[1,3,5]}});
  assert.equal(occursOnDate(weekly,'2027-01-13'),true);
  assert.equal(occursOnDate(weekly,'2027-01-20'),false);
  assert.equal(occursOnDate(weekly,'2027-01-29'),true);
  assert.equal(defaultOccurrenceDate(weekly,'2027-01-16'),'2027-01-25');
  assert.equal(occursOnDate(goal({recurrence:{frequency:'custom',unit:'day',interval:3}}),'2027-01-13'),true);
  assert.equal(occursOnDate(goal({recurrence:{frequency:'custom',unit:'month',interval:2}}),'2027-03-10'),true);
  assert.equal(occursOnDate(goal({recurrence:{frequency:'custom',unit:'year',interval:2}}),'2029-01-10'),true);
  assert.equal(defaultOccurrenceDate(goal({date:'2027-01-31',recurrence:{frequency:'monthly'}}),'2027-02-01'),'2027-02-28');
});

test('after-completion repeat waits for completion and uses actual completion date',()=>{
  const template=goal({recurrence:{frequency:'custom',unit:'day',interval:2,basis:'completion'}});
  assert.equal(occursOnDate(template,'2027-01-12'),false);
  setOccurrenceDone(template,'2027-01-10',true,'2027-01-12');
  assert.equal(defaultOccurrenceDate(template,'2027-01-13'),'2027-01-14');
  assert.equal(occursOnDate(template,'2027-01-14'),true);
  assert.equal(occursOnDate(template,'2027-01-16'),false);
  assert.equal(occursOnDate(template,'2027-01-10'),true);
});

test('merging identical daily goals retains one identity, references, completion and reversible backup',()=>{
  const originals=Array.from({length:8},(_,i)=>goal({id:`sleep-${i}`,date:`2027-01-${10+i}`,recurrence:null,done:i===1,completedDate:i===1?'2027-01-11':null}));
  const before=JSON.stringify(originals);
  const source=JSON.parse(before);
  source[0].seriesConversionBackup=JSON.parse(JSON.stringify(source[0]));
  source[0].recurrence={frequency:'daily'};
  const unrelated=goal({id:'different',initiativeId:'another',recurrence:null});
  const merged=mergeGoalCopies([...source,unrelated],'sleep-0');
  assert.equal(merged.length,2);
  assert.equal(merged[0].initiativeId,'sleep');assert.deepEqual(merged[0].doneDates,['2027-01-11']);
  assert.equal(matchingGoalCopies(merged,merged[0]).length,1);
  assert.deepEqual(mergeGoalCopies(merged,'sleep-0'),merged);
  assert.equal(JSON.stringify(restoreMergedGoalCopies(merged,'sleep-0').slice(0,8)),before);
});

test('calendar events share the template id but have distinct occurrence dates and completion',()=>{
  const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  const code=source.slice(source.indexOf('function calendarEventFromGoal('),source.indexOf('\nfunction ',source.indexOf('function calendarEventsByDate(')+10));
  const template=goal();setOccurrenceDone(template,'2027-01-11',true);
  const ctx=vm.createContext({state:{goals:[template],events:[]},goalScheduleSegments,goalCalendarOccurrences,goalHasScheduledTime:g=>!!goalSchedule(g),findInitiativeOrDirectionBlock:()=>({name:'Сон'}),recurringEventsForDate:()=>[]});
  vm.runInContext(code,ctx);
  const events=vm.runInContext("calendarEventsByDate(['2027-01-11','2027-01-12'])",ctx);
  assert.equal(events.get('2027-01-12').find(e=>e.occurrenceDate==='2027-01-11').done,true);
  assert.equal(events.get('2027-01-12').find(e=>e.occurrenceDate==='2027-01-12').done,false);
  assert.ok(events.get('2027-01-12').every(e=>e.goalId==='sleep'));
});

test('repeat controls include all requested choices and reject invalid custom configuration',()=>{
  const html=renderRecurrenceControls(goal());
  for(const label of ['Нет','Ежедневно','Еженедельно','Ежемесячно','Ежегодно','Каждый будний день','Произвольно'])assert.ok(html.includes(label));
  assert.ok(recurrenceError({frequency:'custom',unit:'week',interval:1,weekdays:[]},'2027-01-11'));
  assert.ok(recurrenceError({frequency:'custom',unit:'day',interval:0},'2027-01-11'));
  assert.ok(recurrenceError({frequency:'daily',until:'2027-01-01'},'2027-01-11'));
});
