import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {calendarGoalBounds,calendarRangeFromBounds,adjustCalendarBounds} from '../calendar-goal-edit.js';
import {goalScheduleSegments} from '../goal-schedule.js';

const code=readFileSync(new URL('../calendar-goal-gestures.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replaceAll('export function','function');
function setup(t,mode='move') {
  t.mock.timers.enable({apis:['setTimeout']});
  class Element extends EventTarget {
    children=[];isConnected=true;scrollTop=0;classList={add(){},remove(){}};style={setProperty(){}};
    append(...children){this.children.push(...children);} remove(){this.removed=true;}
    getBoundingClientRect(){return {top:0,bottom:800,height:44};}
  }
  const grid=new Element(),scroll=new Element(),browser=new EventTarget(),card=new Element();
  card.dataset={calendarGoalOpen:'goal',occurrenceDate:'2027-01-13'};
  card.closest=selector=>selector==='[data-calendar-goal-open]'?card:null;
  const handle={dataset:{calendarResize:mode},closest:selector=>selector==='[data-calendar-resize]'?handle:card.closest(selector)};
  const target=mode==='move'?card:handle;
  grid.getBoundingClientRect=()=>({top:-scroll.scrollTop});grid.closest=()=>scroll;
  grid.querySelectorAll=()=>[0,1,2].map(i=>({dataset:{calendarDate:`2027-01-${13+i}`},getBoundingClientRect:()=>({left:i*100,right:(i+1)*100,height:44})}));
  const changed=[];
  const ctx=vm.createContext({window:browser,document:{createElement:()=>new Element()},performance:{now:()=>100},
    getComputedStyle:()=>({getPropertyValue:()=> '#999'}),setTimeout,clearTimeout,requestAnimationFrame:()=>1,cancelAnimationFrame(){},
    calendarGoalBounds,calendarRangeFromBounds,adjustCalendarBounds,goalScheduleSegments,grid,changed,
    goal:{id:'goal',date:'2027-01-13',time:'09:00',endTime:'10:00',recurrence:{frequency:'daily'}}});
  vm.runInContext(code+'\nbindCalendarGoalGestures({grid,getGoal:()=>goal,onChange:value=>changed.push(value)});',ctx);
  const send=(to,type,props={})=>{
    const event=new Event(type,{cancelable:true});
    for(const [key,value] of Object.entries({target,pointerType:'mouse',isPrimary:true,button:0,pointerId:1,clientX:50,clientY:410,...props}))Object.defineProperty(event,key,{value});
    to.dispatchEvent(event);return event;
  };
  return {changed,grid,scroll,down:props=>send(grid,'pointerdown',props),move:props=>send(browser,'pointermove',props),up:props=>send(browser,'pointerup',props),
    cancel:()=>send(browser,'pointercancel'),escape:()=>send(browser,'keydown',{key:'Escape'}),advance:ms=>t.mock.timers.tick(ms)};
}

test('mouse drag changes day and time; a click and pointer jitter leave the goal unchanged',t=>{
  const h=setup(t);h.down();h.move({clientY:412});h.up();assert.equal(h.changed.length,0);
  h.down();h.move({clientX:150,clientY:432});h.up({clientX:150,clientY:432});
  assert.equal(h.changed.length,1);assert.equal(h.changed[0].range.date,'2027-01-14');assert.equal(h.changed[0].range.time,'09:30');
});
test('resizing start and end preserve the opposite boundary',t=>{
  const h=setup(t,'start');h.down();h.move({clientY:388});h.up({clientY:388});
  assert.equal(h.changed[0].range.time,'08:30');assert.equal(h.changed[0].range.endTime,'10:00');
});
test('escape, pointer cancellation and a drop outside the day columns do not save',t=>{
  const h=setup(t);h.down();h.move({clientY:432});h.escape();h.up({clientY:432});
  h.down();h.move({clientY:432});h.cancel();h.up({clientY:432});
  h.down();h.move({clientY:432});h.up({clientX:400,clientY:432});assert.equal(h.changed.length,0);
});
test('touch swipe scrolls without moving a goal; holding then dragging changes it',t=>{
  const h=setup(t);h.down({pointerType:'touch'});h.move({pointerType:'touch',clientY:380});h.advance(500);h.up({pointerType:'touch',clientY:380});
  assert.equal(h.changed.length,0);assert.equal(h.scroll.scrollTop,30);
  h.down({pointerType:'touch'});h.advance(350);h.move({pointerType:'touch',clientY:432});h.up({pointerType:'touch',clientY:432});
  assert.equal(h.changed.length,1);assert.equal(h.changed[0].range.time,'09:30');
});
