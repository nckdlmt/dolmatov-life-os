import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutCalendarEvents,calendarOverlapGeometry} from '../calendar-event-layout.js';
import {goalScheduleSegments} from '../goal-schedule.js';

const event=(id,start,end,extra={})=>({id,goalId:id,title:id,start,end,...extra});
const columns=events=>layoutCalendarEvents(events).map(e=>[e.id,e.layoutColumn,e.layoutColumns]);

test('workday and lunch receive separate selectable layers',()=>{
  const events=[event('AIR',9.5,19),event('Обед',13,14)];
  assert.deepEqual(columns(events),[['AIR',0,2],['Обед',1,2]]);
  assert.equal(events[0].layoutColumn,undefined);
});
test('three and four simultaneous events receive unique layers',()=>{
  for(const n of [3,4]) {
    const result=layoutCalendarEvents(Array.from({length:n},(_,i)=>event(String(i),12,13)));
    assert.deepEqual(result.map(e=>e.layoutColumn),Array.from({length:n},(_,i)=>i));
    assert.ok(result.every(e=>e.layoutColumns===n));
  }
});

test('nested cards expose a 14px edge per layer, capped on narrow screens',()=>{
  assert.deepEqual(calendarOverlapGeometry(),{inset:0,maxInset:0,layer:3});
  for(const count of [2,3,4,8]) {
    const cards=Array.from({length:count},(_,i)=>calendarOverlapGeometry(count,i));
    cards.forEach((card,i)=>{
      assert.ok(card.maxInset>=0 && card.maxInset<=40);
      if(i<count-1) {
        assert.equal(cards[i+1].inset-card.inset,14);
        assert.ok(card.maxInset<cards[i+1].maxInset);
        assert.ok(card.layer<cards[i+1].layer);
      }
    });
  }
  assert.deepEqual([0,1,2].map(i=>calendarOverlapGeometry(3,i).inset),[0,14,28]);
});
test('touching events and separate conflict groups reuse space without shrinking the whole day',()=>{
  assert.deepEqual(columns([event('a',9,10),event('b',10,11),event('c',12,13),event('d',12.5,14),event('e',15,16)]),
    [['a',0,1],['b',0,1],['c',0,2],['d',1,2],['e',0,1]]);
});
test('nested and chained overlaps use the peak concurrency and reuse released columns',()=>{
  const result=columns([event('work',9,19),event('lunch',12,13),event('call',12.5,13.5),event('break',14,15)]);
  assert.deepEqual(result,[['work',0,3],['lunch',1,3],['call',2,3],['break',1,3]]);
  assert.deepEqual(columns([event('a',9,10),event('b',9.5,11),event('c',10,12)]),[['a',0,2],['b',1,2],['c',0,2]]);
});
test('same-start events place the longest first, independent of stored order',()=>{
  const source=[event('short',9,10),event('long',9,18),event('middle',9,12)];
  for(const events of [source,[...source].reverse()]){
    const result=layoutCalendarEvents(events);
    assert.equal(result.find(e=>e.id==='long').layoutColumn,0);
    assert.equal(result.find(e=>e.id==='middle').layoutColumn,1);
    assert.equal(result.find(e=>e.id==='short').layoutColumn,2);
  }
});

test('hackathon title stays below breakfast, in the exposed part of the same event',()=>{
  const result=layoutCalendarEvents([event('hackathon',10,24),event('breakfast',10,11),event('evening',22,23),event('sleep',23,24)]);
  const hackathon=result.find(e=>e.id==='hackathon');
  assert.equal(hackathon.layoutLabelMode,'exposed');
  assert.deepEqual(hackathon.layoutLabelRanges,[{offset:1,duration:11}]);
  assert.equal(hackathon.start,10);
  assert.equal(hackathon.end,24);
});

test('long event has readable labels before and after lunch, each bounded by the overlay',()=>{
  const result=layoutCalendarEvents([event('work',9,19),event('lunch',12,13)]);
  assert.deepEqual(result[0].layoutLabelRanges,[{offset:0,duration:3},{offset:4,duration:6}]);
  assert.deepEqual(result[1].layoutLabelRanges,[{offset:0,duration:1}]);
});

test('fully coincident events reserve a separate text lane for every title',()=>{
  for(const count of [2,3,4]) {
    const result=layoutCalendarEvents(Array.from({length:count},(_,i)=>event(String(i),10,11)));
    assert.ok(result.every(e=>e.layoutLabelMode==='lanes'));
    assert.equal(new Set(result.map(e=>e.layoutColumn)).size,count);
    assert.ok(result.every(e=>e.layoutLabelRanges.length===1));
  }
});

test('no exposed label range intersects a higher card, including midnight continuations',()=>{
  const cases=[
    [event('hackathon',0,23,{continuesBefore:true}),event('sleep',0,7),event('prep',7,7.5),event('gym',7.5,9),event('routine',9,10),event('breakfast',10,11),event('evening',22,23)],
    [event('a',9,10),event('b',9.5,11),event('c',10,12)],
    [event('a',9,20),event('b',11,17),event('c',12,13),event('d',15,16)],
    [event('short',10,10.25),event('long',10,11)]
  ];
  for(const source of cases) {
    const result=layoutCalendarEvents(source);
    for(const entry of result) {
      assert.ok(entry.layoutLabelRanges.length>0);
      for(const range of entry.layoutLabelRanges) {
        const start=entry.start+range.offset,end=start+range.duration;
        assert.ok(start>=entry.start && end<=entry.end);
        if(entry.layoutLabelMode==='exposed') for(const other of result) {
          if(other.layoutColumn>entry.layoutColumn) assert.ok(end<=other.start || start>=other.end,`${entry.id} label covered by ${other.id}`);
        }
      }
    }
  }
});
test('minute fields, fractional hours, midnight continuations and recurring identity are preserved',()=>{
  const sleep={id:'sleep',date:'2027-01-13',time:'23:00',endTime:'07:00'};
  const segments=goalScheduleSegments(sleep,['2027-01-13','2027-01-14']);
  const morning={...segments[1],goalId:'sleep',occurrenceDate:sleep.date};
  const result=layoutCalendarEvents([morning,event('early',6,7,{minute:30}),event('routine',7,7.5)]);
  assert.deepEqual(result.map(e=>[e.layoutColumn,e.layoutColumns]),[[0,2],[1,2],[0,1]]);
  assert.equal(result[0].goalId,'sleep');assert.equal(result[0].occurrenceDate,'2027-01-13');assert.equal(result[0].continuesBefore,true);
});
test('every intersecting pair has different columns, with no lost events across a dense schedule',()=>{
  const source=Array.from({length:80},(_,i)=>event(String(i),(i*7%70)/4,Math.min(24,(i*7%70)/4+(i%9+1)/4)));
  const result=layoutCalendarEvents(source);
  assert.equal(new Set(result.map(e=>e.id)).size,source.length);
  for(let i=0;i<result.length;i++)for(let j=i+1;j<result.length;j++){
    const a=result[i],b=result[j];
    if(a.start<b.end && b.start<a.end){assert.notEqual(a.layoutColumn,b.layoutColumn);assert.equal(a.layoutColumns,b.layoutColumns);}
  }
});
