import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {goalCalendarOccurrences,goalScheduleSegments} from '../goal-schedule.js';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const extract=name=>{const start=source.indexOf(`function ${name}(`);return source.slice(start,source.indexOf('\nfunction ',start+10));};
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const goal=(id,extra={})=>({id,title:id,date:'2026-12-01',time:'без времени',areaId:'other',...extra});
const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const startOfDay=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
function setup(goals,mode='seven') {
  const nodes={'#calendarCanvas':{innerHTML:''},'#calendarTitle':{},'#calendarModeSelect':{}};
  const days=['2026-11-30','2026-12-01','2026-12-02'].map(key=>({key,date:Number(key.slice(-2)),label:'День',isToday:false}));
  const state={goals,events:[],recurringEvents:[],calendarMode:mode,calendarAnchor:new Date(2026,11,1)};
  const ctx=vm.createContext({state,goalCalendarOccurrences,goalScheduleSegments,escapeHtml,
    findArea:()=>({color:'#a65d70'}),findInitiativeOrDirectionBlock:()=>({name:'Дела (Горящие)'}),recurringEventsForDate:()=>[],
    qs:id=>nodes[id] || {},calendarVisibleDays:()=>mode==='day'?[days[1]]:days,
    formatCalendarTitle:()=>'',formatMonthYear:()=>'',layoutCalendarEvents:e=>e,
    renderCalendarEvent:e=>`<div class="timed">${e.title}</div>`,renderMonthEvent:e=>`<div class="timed">${e.title}</div>`,
    bindCalendarEventActions(){},bindCalendarSlotSelection(){},bindCalendarGoalGestures(){},scrollCalendarToHour(){},requestCalendarGoalChange(){},
    dateKey,startOfDay,addDays,getWeekStart:d=>addDays(d,-(d.getDay()+6)%7),createCalendarDay:d=>({label:'День'}),getToday:()=>new Date(2026,10,25)
  });
  for(const name of ['timeToCalendarValue','goalHasScheduledTime','calendarEventFromGoal','calendarEventsByDate','calendarUntimedGoalsByDate','renderUntimedCalendarGoal','renderUntimedCalendarStrip','renderCalendar','renderMonthCalendar']) vm.runInContext(extract(name),ctx);
  return {ctx,state,nodes};
}

test('dated untimed goals are shown on their date only, never in the time grid',()=>{
  const goals=[goal('Купить билеты в Липецк'),goal('Без даты',{date:''}),goal('В полночь',{time:'00:00',endTime:'01:00'}),goal('Пустое время',{time:''})];
  const before=JSON.stringify(goals),{ctx}=setup(goals);
  const result=ctx.calendarUntimedGoalsByDate(['2026-11-30','2026-12-01','2026-12-02','2026-12-01']);
  assert.deepEqual(Array.from(result.get('2026-12-01'),g=>g.title),['Купить билеты в Липецк','Пустое время']);
  assert.equal(result.get('2026-11-30').length,0);assert.equal(result.get('2026-12-02').length,0);
  assert.deepEqual(Array.from(ctx.calendarEventsByDate(['2026-12-01']).get('2026-12-01'),e=>e.title),['В полночь']);
  assert.equal(JSON.stringify(goals),before);
});

test('untimed repeats respect exclusions, their end date and individual completion',()=>{
  const {ctx}=setup([goal('Ежедневная',{recurrence:{frequency:'daily',until:'2026-12-03'},doneDates:['2026-12-01'],excludedDates:['2026-12-02']})]);
  const result=ctx.calendarUntimedGoalsByDate(['2026-12-01','2026-12-02','2026-12-03','2026-12-04']);
  assert.equal(result.get('2026-12-01')[0].done,true);
  assert.equal(result.get('2026-12-01')[0].occurrenceDate,'2026-12-01');
  assert.equal(result.get('2026-12-02').length,0);
  assert.equal(result.get('2026-12-03')[0].done,false);
  assert.equal(result.get('2026-12-04').length,0);
});

test('day, three-day and week renders put the compact task strip before the scrollable hours',()=>{
  for(const mode of ['day','three','seven']) {
    const {ctx,nodes}=setup([goal('Купить билеты в Липецк'),goal('Работа',{time:'12:00',endTime:'19:00'})],mode);
    ctx.renderCalendar();const html=nodes['#calendarCanvas'].innerHTML;
    assert.ok(html.indexOf('calendar-untimed-strip')<html.indexOf('calendar-time-scroll'));
    assert.match(html,/<div class="calendar-untimed-day" data-untimed-date="2026-12-01"><button[^>]+data-calendar-goal-open="Купить билеты в Липецк"/);
    assert.match(html,/<div class="timed">Работа<\/div>/);
    assert.doesNotMatch(html,/<div class="timed">Купить билеты в Липецк/);
  }
});

test('empty strip does not reserve header space; long titles are safe native buttons',()=>{
  const {ctx,nodes}=setup([goal('Без даты',{date:''})]);ctx.renderCalendar();
  assert.doesNotMatch(nodes['#calendarCanvas'].innerHTML,/calendar-untimed-strip|has-untimed-goals/);
  const html=ctx.renderUntimedCalendarGoal(goal('safe',{title:'Купить <билеты> & "ещё"',done:true}));
  assert.match(html,/^<button type="button"/);assert.match(html,/data-occurrence-date="2026-12-01"/);
  assert.match(html,/&lt;билеты&gt; &amp; &quot;ещё&quot;/);assert.doesNotMatch(html,/<билеты>/);
  assert.match(html,/calendar-untimed-goal done/);
});

test('month view includes the date-only task before timed events in its own date cell',()=>{
  const {ctx,nodes}=setup([goal('Купить билеты в Липецк'),goal('Работа',{time:'12:00',endTime:'19:00'})],'week');ctx.renderCalendar();
  const html=nodes['#calendarCanvas'].innerHTML;
  const day=html.match(/<article data-month-date="2026-12-01"[\s\S]*?<\/article>/)[0];
  assert.ok(day.indexOf('calendar-untimed-goal')<day.indexOf('class="timed"'));
  assert.equal((html.match(/data-calendar-goal-open="Купить билеты в Липецк"/g)||[]).length,1);
});
