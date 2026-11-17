// Navigation belongs to this browser tab, not to the synced personal data.
const storageKey = "dolmatov-life-os-navigation-v1";
const views = new Set(["today", "calendar", "initiatives"]);
const calendarModes = new Set(["day", "three", "seven", "week", "year"]);
const scopeKeys = ["selectedAreaId", "selectedInitiativeId", "selectedActivityId", "openAreaId", "openInitiativeId"];

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function readNavigationState(storage) {
  try {
    const saved = JSON.parse(storage.getItem(storageKey));
    if (!saved || typeof saved !== "object") return {};
    const restored = {};
    if (views.has(saved.activeView)) restored.activeView = saved.activeView;
    if (calendarModes.has(saved.calendarMode)) restored.calendarMode = saved.calendarMode;
    if (typeof saved.calendarAnchor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(saved.calendarAnchor)) {
      const [year, month, day] = saved.calendarAnchor.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      if (localDateKey(date) === saved.calendarAnchor) restored.calendarAnchor = date;
    }
    for (const key of scopeKeys) {
      restored[key] = typeof saved[key] === "string" ? saved[key] : null;
    }
    return restored;
  } catch {
    return {};
  }
}

export function saveNavigationState(storage, state) {
  try {
    const saved = {
      activeView: state.activeView,
      calendarMode: state.calendarMode,
      calendarAnchor: localDateKey(state.calendarAnchor)
    };
    for (const key of scopeKeys) saved[key] = state[key] || null;
    storage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    // Restricted browser storage must not prevent navigation.
  }
}
