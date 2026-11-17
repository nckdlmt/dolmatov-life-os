import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const selectionCode = source.slice(source.indexOf('function calendarPointerTime('), source.indexOf('function calendarGoalComposerHost('));

function setup(t, mode = 'seven') {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  class Element extends EventTarget {
    isConnected = true;
    children = [];
    classList = { add() {}, remove() {} };
    style = { setProperty() {} };
    append(child) { this.children.push(child); }
    remove() { this.removed = true; }
  }
  const grid = new Element();
  const browser = new EventTarget();
  const opened = [];
  const slotAt = (x, y) => {
    const hour = Math.min(23, Math.max(0, Math.floor(y / 44)));
    const slot = {
      dataset: { calendarDate: x > 100 ? '2027-01-14' : '2027-01-13', calendarHour: String(hour), calendarDayIndex: '2' },
      getBoundingClientRect: () => ({ top: hour * 44, height: 44 }),
      closest: selector => selector === '[data-calendar-slot]' ? slot : null
    };
    return slot;
  };
  const context = vm.createContext({
    state: { calendarMode: mode }, window: browser,
    document: { createElement: () => new Element(), elementFromPoint: slotAt },
    qs: () => grid, setTimeout, clearTimeout,
    formatClock: value => String(value), closeCalendarGoalComposer() {},
    openCalendarGoalComposer: value => opened.push(JSON.parse(JSON.stringify(value)))
  });
  vm.runInContext(selectionCode + '\nbindCalendarSlotSelection();', context);
  const dispatch = (target, type, props = {}) => {
    const event = new Event(type, { cancelable: true });
    const values = { pointerType: 'mouse', pointerId: 1, button: 0, buttons: 1, clientX: 30, clientY: 442, ...props };
    for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
    target.dispatchEvent(event);
    return event;
  };
  return {
    opened, grid,
    down: (props = {}) => dispatch(grid, 'pointerdown', { target: slotAt(props.clientX ?? 30, props.clientY ?? 442), ...props }),
    move: props => dispatch(browser, 'pointermove', props),
    up: props => dispatch(browser, 'pointerup', props),
    cancel: () => dispatch(browser, 'pointercancel'),
    click: () => dispatch(grid, 'click'),
    advance: ms => t.mock.timers.tick(ms)
  };
}

test('a short weekly click, including pointer jitter, stays available for day navigation', t => {
  const h = setup(t);
  h.down(); h.move({ clientY: 445 }); h.up();
  assert.equal(h.click().defaultPrevented, false);
  h.advance(1000);
  assert.equal(h.opened.length, 0);
  assert.equal(h.grid.children.length, 0);
});

test('weekly drag opens the selected half-hour and consumes only its own follow-up click', t => {
  const h = setup(t);
  h.down(); h.move({ clientY: 454 }); h.up();
  assert.deepEqual(h.opened, [{ date: '2027-01-13', dayIndex: 2, start: 10, end: 10.5 }]);
  assert.equal(h.click().defaultPrevented, true);
  h.down(); h.up();
  assert.equal(h.click().defaultPrevented, false);
  assert.equal(h.opened.length, 1);
});

test('weekly hold opens a one-hour draft without requiring movement', t => {
  const h = setup(t);
  h.down(); h.advance(349);
  assert.equal(h.grid.children.length, 0);
  h.advance(1);
  assert.equal(h.grid.children.length, 1);
  h.up();
  assert.equal(h.opened[0].start, 10);
  assert.equal(h.opened[0].end, 11);
  assert.equal(h.click().defaultPrevented, true);
});

test('cancelling a drag removes the preview and leaves the next click working', t => {
  const h = setup(t);
  h.down(); h.move({ clientY: 454 }); h.cancel(); h.advance(500); h.up();
  assert.equal(h.grid.children[0].removed, true);
  assert.equal(h.opened.length, 0);
  h.down(); h.up();
  assert.equal(h.click().defaultPrevented, false);
});

test('another pointer cannot finish a selection and a late-day hold stops at midnight', t => {
  const h = setup(t);
  h.down({ clientY: 1050 }); h.advance(350);
  h.up({ pointerId: 2 });
  assert.equal(h.opened.length, 0);
  h.up();
  assert.equal(h.opened[0].start, 23.75);
  assert.equal(h.opened[0].end, 24);
});

test('day view retains immediate click-to-create', t => {
  const h = setup(t, 'day');
  h.down(); h.up();
  assert.equal(h.opened.length, 1);
  assert.equal(h.opened[0].end - h.opened[0].start, 1);
});

test('touch scrolling and right mouse button do not start a mouse selection', t => {
  const h = setup(t);
  h.down({ pointerType: 'touch' }); h.advance(1000); h.up();
  h.down({ button: 2 }); h.advance(1000); h.up();
  assert.equal(h.grid.children.length, 0);
  assert.equal(h.opened.length, 0);
});
