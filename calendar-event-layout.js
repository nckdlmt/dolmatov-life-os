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
    // Keep nested backgrounds, but only put a label where a higher card cannot
    // cover it. Each exposed interval owns a sticky label, so scrolling never
    // pins the title underneath a later event. No scroll-time measurements.
    const ranges = group.map(entry => {
      const covering = group.filter(other => other.column > entry.column && other.start < entry.end && other.end > entry.start)
        .sort((a,b) => a.start-b.start);
      const visible = [];
      let cursor = entry.start;
      for (const other of covering) {
        if (other.start > cursor) visible.push({start:cursor,end:Math.min(other.start,entry.end)});
        cursor = Math.max(cursor,other.end);
      }
      if (cursor < entry.end) visible.push({start:cursor,end:entry.end});
      // A half-hour slot fits one line at the calendar's smallest row height.
      return visible.filter(range => range.end-range.start >= Math.min(.5,entry.end-entry.start)-1e-8);
    });
    // Identical/fully covered events have no exposed vertical interval. Give
    // their labels separate horizontal space while backgrounds still overlap.
    const labelMode = ranges.some(visible => !visible.length) ? 'lanes' : 'exposed';
    group.forEach((entry,index) => {
      const visible = labelMode === 'lanes' ? [{start:entry.start,end:entry.end}] : ranges[index];
      result[entry.index] = {...entry.event,layoutColumn:entry.column,layoutColumns:columnEnds.length,
        layoutLabelMode:labelMode,
        layoutLabelRanges:visible.map(range => ({offset:range.start-entry.start,duration:range.end-range.start}))};
    });
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
