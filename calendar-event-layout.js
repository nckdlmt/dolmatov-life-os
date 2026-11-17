// Lay out each connected group of overlapping events independently. Endpoints
// are exclusive: 12:00–13:00 and 13:00–14:00 can use the same column.
export function layoutCalendarEvents(events) {
  const entries = events.map((event,index) => {
    const start = event.start + (Number.isInteger(event.start) ? (event.minute || 0)/60 : 0);
    const end = event.end === undefined ? start+1 : event.end + (Number.isInteger(event.end) ? (event.endMinute || 0)/60 : 0);
    return {event,index,start,end:Math.max(start+1/60,Math.min(24,end)),column:0};
  }).sort((a,b)=>a.start-b.start || b.end-a.end || String(a.event.id || a.event.goalId || '').localeCompare(String(b.event.id || b.event.goalId || '')) || a.index-b.index);
  const result = new Array(events.length);
  let group = [], columnEnds = [], groupEnd = -Infinity;
  const flush = () => {
    for (const entry of group) result[entry.index] = {...entry.event,layoutColumn:entry.column,layoutColumns:columnEnds.length};
    group=[];columnEnds=[];groupEnd=-Infinity;
  };
  for (const entry of entries) {
    if (entry.start >= groupEnd) flush();
    const free = columnEnds.findIndex(end=>end<=entry.start);
    entry.column = free < 0 ? columnEnds.length : free;
    columnEnds[entry.column] = entry.end;
    groupEnd = Math.max(groupEnd,entry.end);
    group.push(entry);
  }
  flush();
  return result;
}

// A small inset exposes the lower card, like nested cards in a day calendar.
// Cap the accumulated inset at 40% on narrow screens or dense schedules.
export function calendarOverlapGeometry(columns = 1, column = 0) {
  const count = Math.max(1,columns);
  const index = Math.max(0,Math.min(count-1,column));
  return {inset:14*index,maxInset:count===1?0:40*index/(count-1),layer:3+index};
}
