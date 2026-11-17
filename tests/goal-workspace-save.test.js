import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {goalScheduleError} from '../goal-schedule.js';
import {recurrenceError} from '../recurrence-ui.js';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function finishGoalWorkspace('),source.indexOf('function bindEntityGoalControls('));
function save(fields,recurrence={frequency:'weekly'},returnTo={view:'calendar',scrollTop:385}) {
  const goal={id:'goal',title:'Раньше',date:'2027-01-11',time:'20:00',endTime:'21:30',recurrence:{frequency:'weekly'},activityId:'acting',excludedDates:['2027-01-18'],doneDates:['2027-01-25']};
  const state={goals:[goal],openGoalId:'goal',openGoalOccurrenceDate:'2027-01-11',activeView:'today',goalEditorReturnTo:returnTo};
  const error={textContent:''},scroll={scrollTop:0};let saves=0,refreshes=0;
  const ctx=vm.createContext({state,root:{querySelector:selector=>selector==='[data-goal-editor-error]'?error:{value:fields[selector]||''}},
    goalScheduleError,recurrenceError,readRecurrence:()=>recurrence,saveUserData:()=>saves++,
    activateView:view=>{state.activeView=view;},refreshGoalViews:()=>refreshes++,qs:()=>scroll,requestAnimationFrame:fn=>fn()});
  const result=vm.runInContext(code+'\nsaveGoalWorkspace(root);',ctx);
  return {result,state,error:error.textContent,saves,refreshes,scroll};
}
const fields={'#goalTitleEditor':'Новое название','#goalDescription':'Описание','#goalDateEditor':'2027-01-11','#goalTimeEditor':'19:30','#goalEndTimeEditor':'21:45'};

test('explicit update reads still-focused values, persists same series and returns to the calendar scroll position',()=>{
  const r=save(fields);
  assert.equal(r.result,true);assert.equal(r.state.goals.length,1);assert.equal(r.state.goals[0].id,'goal');
  assert.equal(r.state.goals[0].title,'Новое название');assert.equal(r.state.goals[0].time,'19:30');assert.equal(r.state.goals[0].endTime,'21:45');
  assert.equal(r.state.goals[0].activityId,'acting');assert.deepEqual(r.state.goals[0].excludedDates,['2027-01-18']);
  assert.equal(r.state.activeView,'calendar');assert.equal(r.scroll.scrollTop,385);assert.equal(r.state.openGoalId,null);assert.ok(r.saves>0);
});
test('invalid edits remain open with a visible error and cannot overwrite the saved goal',()=>{
  for(const changes of [{'#goalTitleEditor':' '},{'#goalEndTimeEditor':''},{'#goalEndDateEditor':'2027-01-10'}]){
    const r=save({...fields,...changes});assert.equal(r.result,false);assert.ok(r.error);assert.equal(r.saves,0);
    assert.equal(r.state.openGoalId,'goal');assert.equal(r.state.activeView,'today');assert.equal(r.state.goals[0].title,'Раньше');
  }
});
test('overnight updates preserve the repeat rule and goals opened outside the calendar stay in their section',()=>{
  const recurrence={frequency:'custom',unit:'week',interval:2,weekdays:[1],anchorDate:'2026-12-28',weekPhaseOffset:0};
  const r=save({...fields,'#goalTimeEditor':'23:00','#goalEndTimeEditor':'07:00'},recurrence,null);
  assert.equal(r.result,true);assert.equal(r.state.goals[0].endTime,'07:00');assert.deepEqual(r.state.goals[0].recurrence,recurrence);
  assert.equal(r.state.activeView,'today');assert.equal(r.refreshes,1);
});

test('Enter in the editor submits current fields; Shift+Enter and the checklist keep their own behavior',()=>{
  const start=source.indexOf("select('#goalWorkspace')?.addEventListener('keydown',event=>{");
  const end=source.indexOf('\n  });',start);
  const handler=source.slice(start+"select('#goalWorkspace')?.addEventListener('keydown',event=>{".length,end);
  for (const [props,expected] of [[{},1],[{shiftKey:true},0],[{isComposing:true},0],[{nested:true},0],[{tagName:'SELECT'},0]]) {
    let saved=0;
    const event={key:'Enter',target:{id:'goalDescription',tagName:props.tagName||'TEXTAREA',closest:()=>props.nested},preventDefault(){},stopPropagation(){},...props};
    vm.runInNewContext(`(function(){${handler}})()`,{event,root:{},saveGoalWorkspace:()=>saved++});
    assert.equal(saved,expected);
  }
});
