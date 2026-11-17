import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { goalScheduleError } from '../goal-schedule.js';
import { recurrenceError } from '../recurrence-ui.js';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const binder = source.slice(source.indexOf('function bindTodayWorkspaceStart('), source.indexOf('function openTodayComposer('));
const submitStart = binder.indexOf('form.addEventListener("submit", (event) => {') + 'form.addEventListener("submit", (event) => {'.length;
const submitEnd = binder.indexOf('\n  });\n\n  autoResize(titleField', submitStart);
const submitBody = binder.slice(submitStart, submitEnd);

function submit(values, mode = 'goal', scope = {}) {
  const state = { goals: [], notes: [], todayComposerMode: mode, openGoalId: null, openNoteId: null };
  const error = { textContent: '' }, feedback = { textContent: '' };
  let refreshes = 0;
  const context = vm.createContext({
    state, mode, scope, isNote: mode === 'note', error, form: {}, checklistItems: [],
    FormData: class { entries() { return Object.entries(values); } },
    readRecurrence: () => values.recurrence || null, recurrenceError, goalScheduleError,
    host: { querySelector: () => feedback }, uid: prefix => `${prefix}-test`,
    refreshGoalViews: () => refreshes++, refreshThoughtViews: () => refreshes++,
    event: { preventDefault() {} }
  });
  vm.runInContext(`(function () {${submitBody}})()`, context);
  return { state: JSON.parse(JSON.stringify(state)), error: error.textContent, feedback: feedback.textContent, refreshes };
}

test('adding a scheduled recurring goal keeps one template and returns to a fresh composer', () => {
  const r = submit({ title: 'Массаж', areaId: 'physio', initiativeId: 'body', activityId: 'massage', date: '2027-01-17', time: '15:00', endTime: '16:00', recurrence: { frequency: 'weekly', until: '' } });
  assert.equal(r.error, '');
  assert.equal(r.state.goals.length, 1);
  assert.equal(r.state.goals[0].title, 'Массаж');
  assert.equal(r.state.goals[0].activityId, 'massage');
  assert.equal(r.state.goals[0].time, '15:00');
  assert.equal(r.state.goals[0].endTime, '16:00');
  assert.equal(r.state.goals[0].type, 'recurring');
  assert.equal(r.state.goals[0].recurrence.frequency, 'weekly');
  assert.equal(r.state.todayComposerMode, 'goal');
  assert.equal(r.state.openGoalId, null);
  assert.equal(r.state.openNoteId, null);
  assert.equal(r.refreshes, 1);
  assert.equal(r.feedback, 'Цель добавлена');
});

test('missing classification leaves the draft intact and explains why nothing was added', () => {
  const values = { title: 'Сохранить этот черновик', areaId: '' };
  const r = submit(values);
  assert.equal(r.state.goals.length, 0);
  assert.equal(r.refreshes, 0);
  assert.equal(values.title, 'Сохранить этот черновик');
  assert.equal(r.error, 'Выберите направление для цели.');
  assert.equal(r.feedback, '');
});

test('invalid time and repeating-without-date remain unsaved', () => {
  for (const extra of [{ date: '2027-01-17', time: '15:00' }, { recurrence: { frequency: 'weekly' } }]) {
    const r = submit({ title: 'Массаж', areaId: 'physio', ...extra });
    assert.equal(r.state.goals.length, 0);
    assert.equal(r.refreshes, 0);
    assert.ok(r.error.length > 0);
  }
});

test('adding a thought preserves its initiative context and leaves the thought composer empty', () => {
  const r = submit({ title: 'Новая мысль', areaId: 'physio' }, 'note', { areaId: 'physio', initiativeId: 'body', activityId: 'massage' });
  assert.equal(r.state.notes.length, 1);
  assert.equal(r.state.notes[0].text, 'Новая мысль');
  assert.equal(r.state.notes[0].activityId, 'massage');
  assert.equal(r.state.todayComposerMode, 'note');
  assert.equal(r.state.openNoteId, null);
  assert.equal(r.refreshes, 1);
  assert.equal(r.feedback, 'Мысль добавлена');
});
