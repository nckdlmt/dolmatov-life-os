import test from "node:test";
import assert from "node:assert/strict";
import { readNavigationState, saveNavigationState } from "../navigation-state.js";

function storage() {
  const entries = new Map();
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
}

test("reload restores January calendar instead of defaulting to today's week", () => {
  const tab = storage();
  const state = { activeView: "calendar", calendarMode: "seven", calendarAnchor: new Date(2027, 0, 13), goals: [{ title: "Private goal" }] };
  saveNavigationState(tab, state);
  const reloaded = { activeView: "today", calendarMode: "day", calendarAnchor: new Date(2026, 10, 18), ...readNavigationState(tab) };
  assert.equal(reloaded.activeView, "calendar");
  assert.equal(reloaded.calendarMode, "seven");
  assert.equal(reloaded.calendarAnchor.getFullYear(), 2027);
  assert.equal(reloaded.calendarAnchor.getMonth(), 0);
  assert.equal(reloaded.calendarAnchor.getDate(), 13);
  assert.equal(reloaded.calendarAnchor.getHours(), 0);
  assert.equal("goals" in reloaded, false);
});

test("all calendar modes and an initiative selection survive serialization", () => {
  const tab = storage();
  for (const calendarMode of ["day", "three", "seven", "week", "year"]) {
    saveNavigationState(tab, { activeView: "initiatives", calendarMode, calendarAnchor: new Date(2028, 1, 29), selectedAreaId: "physio", selectedInitiativeId: "food", selectedActivityId: "breakfast" });
    const saved = readNavigationState(tab);
    assert.equal(saved.calendarMode, calendarMode);
    assert.equal(saved.selectedActivityId, "breakfast");
    assert.equal(saved.calendarAnchor.getDate(), 29);
  }
});

test("corrupt or unavailable storage leaves working navigation defaults", () => {
  for (const text of ["not json", "null", "[]", '{"activeView":"unknown","calendarMode":"bad","calendarAnchor":"2027-02-30"}', '{"calendarAnchor":"2027-13-01"}']) {
    const saved = readNavigationState({ getItem: () => text });
    assert.equal(saved.activeView, undefined);
    assert.equal(saved.calendarMode, undefined);
    assert.equal(saved.calendarAnchor, undefined);
  }
  const blocked = { getItem() { throw new Error("Denied"); }, setItem() { throw new Error("Denied"); } };
  assert.deepEqual(readNavigationState(blocked), {});
  assert.doesNotThrow(() => saveNavigationState(blocked, { activeView: "calendar", calendarMode: "seven", calendarAnchor: new Date(2027, 0, 13) }));
});

test("navigation in a second tab does not replace the first tab's calendar", () => {
  const first = storage();
  const second = storage();
  saveNavigationState(first, { activeView: "calendar", calendarMode: "seven", calendarAnchor: new Date(2027, 0, 13) });
  saveNavigationState(second, { activeView: "today", calendarMode: "year", calendarAnchor: new Date(2026, 10, 18) });
  assert.equal(readNavigationState(first).activeView, "calendar");
  assert.equal(readNavigationState(first).calendarAnchor.getFullYear(), 2027);
  assert.equal(readNavigationState(second).activeView, "today");
});
