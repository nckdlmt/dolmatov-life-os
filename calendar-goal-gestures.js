import { calendarGoalBounds, calendarRangeFromBounds, adjustCalendarBounds } from './calendar-goal-edit.js?v=calendar-edit-1';
import { goalScheduleSegments } from './goal-schedule.js?v=calendar-edit-1';

let suppressClickUntil = 0;
let cancelActive = null;
export function consumeCalendarGestureClick(event) {
  if (performance.now() > suppressClickUntil || !event.target.closest('#calendarCanvas')) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  return true;
}

export function bindCalendarGoalGestures({ grid, getGoal, onChange, onBegin = () => {} }) {
  cancelActive?.();
  if (!grid) return;
  const scroll = grid.closest('.calendar-time-scroll');
  const columns = [...grid.querySelectorAll('[data-calendar-hour="0"]')];
  const dates = columns.map(cell => cell.dataset.calendarDate);
  grid.addEventListener('dragstart', event => event.preventDefault());
  grid.addEventListener('contextmenu', event => { if (event.target.closest('[data-calendar-goal-open]')) event.preventDefault(); });
  grid.addEventListener('pointerdown', event => {
    suppressClickUntil = 0;
    if (event.button !== 0 || !event.isPrimary || event.target.closest('.calendar-event-check')) return;
    const card = event.target.closest('[data-calendar-goal-open]');
    if (!card) return;
    const goal = getGoal(card.dataset.calendarGoalOpen);
    if (!goal) return;
    const occurrenceDate = card.dataset.occurrenceDate || goal.date;
    const bounds = calendarGoalBounds(goal,occurrenceDate);
    if (!bounds) return;
    const mode = event.target.closest('[data-calendar-resize]')?.dataset.calendarResize || 'move';
    const pointerId = event.pointerId, touch = event.pointerType === 'touch';
    const original = JSON.stringify(goal);
    let active = false, touchScroll = false, timer, frame, lastX = event.clientX, lastY = event.clientY, target = bounds;
    let initialScrollTop = scroll.scrollTop;
    const ghosts = [];
    const point = (x,y) => {
      const rects = columns.map(cell => cell.getBoundingClientRect());
      const index = rects.findIndex(rect => x >= rect.left && x < rect.right);
      if (index < 0) return null;
      const hourHeight = rects[index].height || 44;
      const minutes = Math.max(0,Math.min(1440,(y-grid.getBoundingClientRect().top) / hourHeight * 60));
      return Date.parse(`${dates[index]}T00:00:00Z`) / 60000 + minutes;
    };
    const anchor = point(event.clientX,event.clientY);
    if (anchor === null) return;
    const draw = () => {
      ghosts.splice(0).forEach(node => node.remove());
      const range = calendarRangeFromBounds(target);
      const hourHeight = columns[0].getBoundingClientRect().height || 44;
      for (const segment of goalScheduleSegments(range,dates)) {
        const ghost = document.createElement('div');
        ghost.className = 'calendar-draft-selection calendar-edit-preview';
        ghost.style.setProperty('--draft-color',getComputedStyle(card).getPropertyValue('--event-color'));
        ghost.style.gridColumn = dates.indexOf(segment.date)+2;
        ghost.style.gridRow = Math.floor(segment.start)+1;
        ghost.style.transform = `translateY(${(segment.start%1)*hourHeight}px)`;
        ghost.style.height = `${(segment.end-segment.start)*hourHeight}px`;
        const body = document.createElement('div');
        body.className = 'calendar-draft-event-body';
        const title = document.createElement('strong'), time = document.createElement('span');
        title.textContent = goal.title;
        time.textContent = `${range.time}–${range.endTime}${range.endDate ? ' · '+range.endDate.split('-').reverse().join('.') : ''}`;
        body.append(title,time);ghost.append(body);grid.append(ghost);ghosts.push(ghost);
      }
    };
    const update = () => {
      const current = point(lastX,lastY);
      if (current === null) return;
      target = adjustCalendarBounds(bounds,mode,current-anchor);
      draw();
    };
    const autoScroll = () => {
      if (!active || !grid.isConnected) return cancel();
      const rect = scroll.getBoundingClientRect();
      const speed = lastY < rect.top+36 ? -Math.min(14,(rect.top+36-lastY)/3) : lastY > rect.bottom-36 ? Math.min(14,(lastY-rect.bottom+36)/3) : 0;
      if (speed) { scroll.scrollTop += speed; update(); }
      frame = requestAnimationFrame(autoScroll);
    };
    const start = () => {
      if (active || !grid.isConnected) return;
      clearTimeout(timer);active = true;
      onBegin();
      grid.classList.add('is-editing-event');
      card.classList.add('is-drag-source');
      card.setPointerCapture?.(pointerId);
      update();frame = requestAnimationFrame(autoScroll);
    };
    const cleanup = () => {
      clearTimeout(timer);cancelAnimationFrame(frame);
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',finish);
      window.removeEventListener('pointercancel',cancelPointer);
      window.removeEventListener('keydown',keydown);
      window.removeEventListener('blur',cancel);
      scroll.removeEventListener('scroll',onScroll);
      grid.classList.remove('is-editing-event');card.classList.remove('is-drag-source');
      ghosts.forEach(node => node.remove());
      if (card.hasPointerCapture?.(pointerId)) card.releasePointerCapture(pointerId);
      if (active || touchScroll) suppressClickUntil = performance.now()+600;
      cancelActive = null;
    };
    const cancel = () => cleanup();
    const cancelPointer = e => { if(e.pointerId===pointerId) cancel(); };
    const keydown = e => { if(e.key==='Escape') { e.preventDefault();cancel(); } };
    const onScroll = () => {
      if (!active && touch && !touchScroll && Math.abs(scroll.scrollTop-initialScrollTop)>3) cancel();
      else if(active) update();
    };
    const move = e => {
      if (e.pointerId !== pointerId) return;
      lastX = e.clientX;lastY = e.clientY;
      const distance = Math.hypot(lastX-event.clientX,lastY-event.clientY);
      if (!active && touch && mode==='move' && (touchScroll || distance>8)) {
        clearTimeout(timer);touchScroll=true;
        scroll.scrollTop=initialScrollTop-(lastY-event.clientY);e.preventDefault();return;
      }
      if (!active && !touch && distance>=5) start();
      if (!active && touch && mode!=='move' && distance>=5) start();
      if(active) { e.preventDefault();update(); }
    };
    const finish = e => {
      if (e.pointerId !== pointerId) return;
      if (active) { lastX=e.clientX;lastY=e.clientY;update();e.preventDefault(); }
      const changed = active && (target.start !== bounds.start || target.end !== bounds.end);
      const viewport = scroll.getBoundingClientRect();
      const inside = point(lastX,lastY) !== null && lastY >= viewport.top && lastY <= viewport.bottom;
      cleanup();
      if (changed && inside) onChange({ goalId:goal.id, occurrenceDate, range:calendarRangeFromBounds(target), mode, original });
    };
    cancelActive = cancel;
    window.addEventListener('pointermove',move,{passive:false});
    window.addEventListener('pointerup',finish);
    window.addEventListener('pointercancel',cancelPointer);
    window.addEventListener('keydown',keydown);
    window.addEventListener('blur',cancel);
    scroll.addEventListener('scroll',onScroll,{passive:true});
    if(touch && mode==='move') timer=setTimeout(start,350);
  });
}
