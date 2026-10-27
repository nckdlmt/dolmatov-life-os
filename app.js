import { createCloudSync } from "./cloud-sync.js?v=dolmatov-cloud-20261027-5";

const activitiesByInitiative = {
  "Внимание телу": ["Спорт", "Массаж", "Прогулка", "Сауна"],
  "Проявление ценности": ["Radiance", "Личный блог", "Проектная деятельность", "Найм"],
  "Повышение ценности": ["Общее", "Бизнес", "Иностранные языки"],
  "Домохозяин": ["Квартира", "Хозяйственная рутина", "Ремонт (Починка)", "Покупка продуктов и хозов"],
  "Рутина — утро и вечер": ["Подготовка ко дня", "Подготовка ко сну"],
  "Проактивное здоровье": ["Общее", "Терапевт", "Анализы", "Контроль", "Стоматология", "Мужское", "Кожа", "Витамины", "Гормоны"],
  "Уход за собой": ["Прическа", "Ногти", "Ванная"],
  "Хобби": ["Развлекательный спорт"],
  "Праздник жизни": ["Фестивали", "Корпоративное", "Ночь забрала", "Подарки", "Вечерние светские приёмы", "На природе", "Активное", "Путешествия", "Уютное"],
  "Созерцание прекрасного": ["Кино", "Визуальное искусство", "Перформанс", "Эстетичный опыт"],
  "Гастрономия": ["Места", "Yammy"],
  "Харизма": ["Тело", "Одежда", "Ораторское мастерство"],
  "Мой перформанс": ["Музыка", "Художественные съёмки", "Арт-дирекшен", "Танцы", "Кино про меня"],
  "Романтические отношения": ["Романтические разговоры", "Свидания", "Секс", "Совместные выходы в люди", "Романтические поступки"],
  "Состояние": ["СверхФаза (Никита Сычев)", "Самостоятельные медитации", "Психотерапия", "Чайный путь"],
  "Материя": ["Одежда", "Предметы"],
  "Отношения (Окружение)": ["Друзья на пути", "Друзья детства", "Женщина", "СверхФаза (Монады)", "Новые знакомства"]
};

const networkingInitiativeId = "sila-7";
const nutritionInitiativeId = "sila-2";
const legacyNetworkingInitiativeId = "sila-11";
const financialControlInitiativeId = "sila-4";
const familyInitiativeId = "sila-9";
const legacyFinancialControlInitiativeId = "balance-10";
const blagoInitiativeMoves = {
  "love-8": "balance-11",
  "love-10": "balance-12",
  "love-11": "balance-13",
  "love-12": "balance-14",
  "love-13": "balance-15"
};
const currentTaxonomyMigration = {
  "balance-3": "love-9",
  "balance-4": "sila-8",
  "balance-5": "sila-9",
  "balance-6": "balance-3",
  "balance-7": "sila-10",
  "balance-8": "love-5",
  "balance-9": "sila-11",
  "balance-10": "balance-4",
  "balance-11": "sila-12",
  "balance-12": "balance-5",
  "balance-13": "sila-13",
  "balance-14": "balance-6",
  "balance-15": "love-10"
};
const balanceInitiativeTransferMigration = {
  "sila-8": "balance-10",
  "sila-9": "balance-11",
  "sila-10": "balance-9",
  "sila-11": "balance-7",
  "sila-12": "sila-8",
  "sila-13": "balance-8"
};
const routineReturnMigration = {
  "balance-10": "sila-9",
  "balance-11": "balance-10"
};
const initiativeOrderMigration = {
  "sila-1": "sila-3",
  "sila-2": "sila-2",
  "sila-3": "sila-7",
  "sila-4": "sila-8",
  "sila-5": "sila-6",
  "sila-6": "sila-5",
  "sila-7": "sila-4",
  "sila-8": "sila-9",
  "sila-9": "sila-1",
  "balance-1": "balance-1",
  "balance-2": "balance-4",
  "balance-3": "balance-2",
  "balance-4": "balance-10",
  "balance-5": "balance-6",
  "balance-6": "balance-5",
  "balance-7": "balance-8",
  "balance-8": "balance-7",
  "balance-9": "balance-9",
  "balance-10": "balance-3",
  "love-1": "love-5",
  "love-2": "love-4",
  "love-3": "love-6",
  "love-4": "love-2",
  "love-5": "love-3",
  "love-6": "love-7",
  "love-7": "love-8",
  "love-8": "love-1",
  "love-9": "love-9",
  "love-10": "love-10"
};
const legacyInitiativeOffsets = {
  sila: 4,
  balance: 4,
  love: 3
};

function createActivities(areaId, initiativeIndex, names) {
  return names.map((name, index) => ({
    id: `${areaId}-${initiativeIndex + 1}-activity-${index + 1}`,
    name,
    status: "активность",
    goals: []
  }));
}

function createDirectionBlocks(names) {
  return names.map((name, index) => ({
    id: `direction-block-${index + 1}`,
    name: name.replace(/\s+\([^)]*\)$/, "") === "Делегирование" ? "ДЕЛЕГИРОВАНИЕ" : name.replace(/\s+\([^)]*\)$/, ""),
    items: mockGoalsByBlock[name] || mockGoalsByBlock[name.replace(/\s+\([^)]*\)$/, "")] || [
      { title: "Определить первый ориентир", done: false },
      { title: "Сформулировать следующий шаг", done: false }
    ]
  }));
}

const mockGoalsByBlock = {
  "ЦЕЛИ НА ГОД": [
    { scope: "Проявление ценности / Найм", title: "Собрать годовой фокус направления", done: true },
    { scope: "Деловые задачи / Нетворкинг", title: "Закрепить измеримый результат", done: false },
    { scope: "Внимание телу / Спорт", title: "Провести квартальный пересмотр", done: false }
  ],
  "ЦЕЛИ НА ЖИЗНЬ": [
    { scope: "Романтические отношения / Свидания", title: "Определить образ жизни, к которому я иду", done: false },
    { scope: "Состояние / Самостоятельные медитации", title: "Описать ключевые критерии этого образа", done: false }
  ],
  "СРЕДНЕСРОЧНЫЕ ЦЕЛИ": [
    { scope: "Созерцание прекрасного / Кино", title: "Выбрать фокус на ближайшие 12 недель", done: true },
    { scope: "Гастрономия / Yammy", title: "Составить план движения по неделям", done: false },
    { scope: "Харизма / Ораторское мастерство", title: "Подвести промежуточный итог", done: false }
  ],
  "Делегирование (СИЛА)": [
    { scope: "Деловые задачи", title: "Собрать список того, что можно передать", done: false },
    { scope: "Проявление ценности / Найм", title: "Передать первый блок", done: false }
  ],
  "Делегирование (БЛАГО)": [
    { scope: "Домохозяин / Хозяйственная рутина", title: "Собрать список того, что можно передать", done: false },
    { scope: "Уход за собой / Прическа", title: "Настроить регулярную помощь", done: false }
  ]
};

function createInitiatives(areaId, names) {
  return names.map((name, index) => ({
    id: `${areaId}-${index + 1}`,
    name,
    status: "инициатива",
    activities: createActivities(areaId, index, activitiesByInitiative[name] || []),
    goals: []
  }));
}

const areas = [
  {
    id: "sila",
    name: "СИЛА",
    icon: "СЛ",
    color: "var(--sila)",
    score: 72,
    directionBlocks: createDirectionBlocks([
      "ЦЕЛИ НА ГОД",
      "СРЕДНЕСРОЧНЫЕ ЦЕЛИ",
      "ЦЕЛИ НА ЖИЗНЬ",
      "Делегирование (СИЛА)"
    ]),
    initiatives: createInitiatives("sila", [
      "Рутина — утро и вечер",
      "Приём пищи",
      "Внимание телу",
      "Финансовый контроль",
      "Повышение ценности",
      "Проявление ценности",
      "Деловые задачи",
      "Сделки",
      "Род"
    ])
  },
  {
    id: "balance",
    name: "БЛАГО",
    icon: "БГ",
    color: "var(--balance)",
    score: 64,
    directionBlocks: createDirectionBlocks([
      "ЦЕЛИ НА ГОД",
      "СРЕДНЕСРОЧНЫЕ ЦЕЛИ",
      "ЦЕЛИ НА ЖИЗНЬ",
      "Делегирование (БЛАГО)"
    ]),
    initiatives: createInitiatives("balance", [
      "Сон",
      "Уход за собой",
      "Проактивное здоровье",
      "Домохозяин",
      "Отношения (Окружение)",
      "Мировоззрение (Вера)",
      "Материя",
      "Порядок в документах",
      "Безвозмездное созидание",
      "Чилл"
    ])
  },
  {
    id: "love",
    name: "ЛЮБОВЬ",
    icon: "ЛБ",
    color: "var(--love)",
    score: 58,
    directionBlocks: createDirectionBlocks([
      "ЦЕЛИ НА ГОД",
      "СРЕДНЕСРОЧНЫЕ ЦЕЛИ",
      "ЦЕЛИ НА ЖИЗНЬ"
    ]),
    initiatives: createInitiatives("love", [
      "Состояние",
      "Харизма",
      "Хобби",
      "Созерцание прекрасного",
      "Праздник жизни",
      "Гастрономия",
      "Мой перформанс",
      "Романтические отношения",
      "Забота о близких",
      "Изучение жизни"
    ])
  }
];

areas.sort((first, second) => ["love", "balance", "sila"].indexOf(first.id) - ["love", "balance", "sila"].indexOf(second.id));

const areaById = new Map(areas.map((area) => [area.id, area]));
const transitArea = { id: "transit", name: "В дороге", color: "#c7cbd1" };
const initiativeById = new Map();
const activityById = new Map();
const directionBlockByLegacyId = new Map();
let directionAreaByBlock = new WeakMap();

function rebuildTaxonomyIndexes() {
  areaById.clear();
  initiativeById.clear();
  activityById.clear();
  directionBlockByLegacyId.clear();
  directionAreaByBlock = new WeakMap();

  areas.forEach((area) => {
    areaById.set(area.id, area);
    area.initiatives.forEach((initiative) => {
      const indexedInitiative = { ...initiative, area };
      initiativeById.set(initiative.id, indexedInitiative);
      initiative.activities.forEach((activity) => {
        activityById.set(activity.id, { ...activity, initiative, area });
      });
    });
    area.directionBlocks.forEach((block, index) => {
      directionAreaByBlock.set(block, area);
      directionBlockByLegacyId.set(`${area.id}-${index + 1}`, {
        ...block,
        area,
        legacyId: `${area.id}-${index + 1}`
      });
    });
  });
}

function normalizedTaxonomy(savedAreas) {
  return savedAreas.map((area) => ({
    id: String(area.id || uid("direction")),
    name: String(area.name || "Новое направление"),
    icon: String(area.icon || ""),
    color: String(area.color || "#a65d70"),
    score: Number(area.score) || 0,
    directionBlocks: Array.isArray(area.directionBlocks) ? area.directionBlocks : [],
    initiatives: (Array.isArray(area.initiatives) ? area.initiatives : []).map((initiative) => ({
      id: String(initiative.id || uid("initiative")),
      name: String(initiative.name || "Новая инициатива"),
      status: initiative.status || "инициатива",
      kind: initiative.kind || ((initiative.activities || []).length ? "container" : "initiative"),
      parentInitiativeId: initiative.parentInitiativeId ? String(initiative.parentInitiativeId) : null,
      activities: (Array.isArray(initiative.activities) ? initiative.activities : []).map((activity) => ({
        id: String(activity.id || uid("activity")),
        name: String(activity.name || "Новая активность"),
        status: activity.status || "активность",
        goals: Array.isArray(activity.goals) ? activity.goals : []
      })),
      goals: Array.isArray(initiative.goals) ? initiative.goals : []
    }))
  }));
}

rebuildTaxonomyIndexes();

const hiringActivity = areas
  .flatMap((area) =>
    area.initiatives.flatMap((initiative) =>
      initiative.activities.map((activity) => ({ area, initiative, activity }))
    )
  )
  .find((item) => item.area.id === "sila" && item.initiative.name === "Проявление ценности" && item.activity.name === "Найм");

const airYesterdayEvent = hiringActivity
  ? {
      id: "event-air-2026-08-19",
      date: "2026-08-19",
      start: 11,
      minute: 0,
      end: 20,
      title: "AIR",
      areaId: hiringActivity.area.id,
      initiativeId: hiringActivity.initiative.id,
      activityId: hiringActivity.activity.id,
      type: "work",
      detail: "Найм",
      done: true
    }
  : null;

const initialToday = startOfDay(new Date());

const state = {
  calendarMode: "seven",
  calendarAnchor: initialToday,
  selectedAreaId: null,
  selectedInitiativeId: null,
  selectedActivityId: null,
  openGoalId: null,
  openNoteId: null,
  todayComposerMode: null,
  openAreaId: null,
  openInitiativeId: null,
  activeView: "today",
  events: [
    {
      id: "event-sleep-2026-08-20",
      date: "2026-08-20",
      start: 0,
      minute: 0,
      end: 8,
      title: "Сон",
      areaId: "balance",
      initiativeId: "balance-1",
      type: "sleep",
      detail: "цель инициативы Сон",
      done: false
    },
    airYesterdayEvent
  ].filter(Boolean),
  recurringEvents: [],
  goals: [],
  notes: [],
  habits: [],
  metrics: [],
  networking: {
    annualGoal: 200,
    contacts: []
  },
  finance: {
    selectedMonth: dateKey(initialToday).slice(0, 7),
    transactions: [],
    budgets: {}
  },
  nutrition: {
    entries: []
  },
  family: {
    members: {}
  },
  taxonomyTrash: [],
  openThoughtScopes: new Set(),
  dataMigrations: {
    allGoalsClearedVersion: 0
  }
};

const familyTreeSlots = [
  { id: "self", generation: 1, role: "Я" },
  { id: "mother", generation: 2, role: "Мама" },
  { id: "father", generation: 2, role: "Папа" },
  { id: "maternal-grandmother", generation: 3, role: "Бабушка по маме" },
  { id: "maternal-grandfather", generation: 3, role: "Дедушка по маме" },
  { id: "paternal-grandmother", generation: 3, role: "Бабушка по папе" },
  { id: "paternal-grandfather", generation: 3, role: "Дедушка по папе" }
];

const financeCategoryGroups = [
  { label: "Поступления", type: "income", items: ["Основной доход", "Проекты", "Продажи", "Другое поступление"] },
  { label: "Платежи", type: "payment", items: ["Жильё", "Связь и интернет", "Страхование", "Абонементы", "Подписки"] },
  { label: "Расходы", type: "expense", items: ["Продукты", "Транспорт", "Здоровье", "Обучение", "Отдых", "Прочее"] },
  { label: "Долги", type: "debt", items: ["Погашение долга", "Долг выдан"] },
  { label: "Капитал и накопления", type: "capital", items: ["Накопления", "Инвестиции"] }
];

const financeTypeLabels = {
  income: "Поступление",
  payment: "Платёж",
  expense: "Расход",
  debt: "Долг",
  capital: "Капитал"
};

const vitals = [
  ["Вес", "82.4 кг", "цель: 78 кг"],
  ["Давление", "118/76", "последняя запись"],
  ["Настроение", "7/10", "утро"],
  ["Энергия", "6.8/10", "среднее за неделю"]
];

const labs = [
  ["Общий анализ крови", "12 августа", "файл не прикреплен"],
  ["Витамин D", "июль", "нужно обновить"],
  ["Липидограмма", "май", "в пределах референса"]
];

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];
const dateLocale = "ru-RU";
const dateFormatters = {
  weekday: new Intl.DateTimeFormat(dateLocale, { weekday: "long" }),
  month: new Intl.DateTimeFormat(dateLocale, { month: "long" }),
  monthYear: new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }),
  fullDate: new Intl.DateTimeFormat(dateLocale, { weekday: "long", day: "numeric", month: "long" }),
  date: new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric" })
};
const moneyFormatter = new Intl.NumberFormat(dateLocale, {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});
const storageKey = "dolmatov-life-os-state-v1";
const legacyStorageKey = "radiance-local-state-v1";
const themeStorageKey = "dolmatov-life-os-theme-v1";
const legacyThemeStorageKey = "radiance-theme-v1";
const structureVersion = 12;
let lastSavedUserData = "";
let userDataSaveTimer = null;
let cloudSync = null;
let uidSequence = 0;
let activeCalendarDraftPreview = null;
let draggedTaxonomyEntity = null;
let searchReturnFocus = null;

function uid(prefix = "item") {
  uidSequence += 1;
  return `${prefix}-${Date.now()}-${uidSequence}`;
}

function userDataSnapshot() {
  return JSON.stringify({
    structureVersion,
    events: state.events,
    goals: state.goals,
    notes: state.notes,
    habits: state.habits,
    metrics: state.metrics,
    networking: state.networking,
    finance: state.finance,
    nutrition: state.nutrition,
    family: state.family,
    taxonomy: areas,
    taxonomyTrash: state.taxonomyTrash,
    dataMigrations: state.dataMigrations,
    recurringDoneDates: state.recurringEvents.map((event) => ({
      id: event.id,
      doneDates: event.doneDates
    }))
  });
}

function saveUserData() {
  try {
    const snapshot = userDataSnapshot();
    if (snapshot === lastSavedUserData) return;
    localStorage.setItem(storageKey, snapshot);
    lastSavedUserData = snapshot;
    cloudSync?.queue(snapshot);
  } catch (error) {
    console.warn("Dolmatov Life OS local save failed", error);
  }
}

function scheduleUserDataSave() {
  window.clearTimeout(userDataSaveTimer);
  userDataSaveTimer = window.setTimeout(() => {
    userDataSaveTimer = null;
    saveUserData();
  }, 140);
}

function loadSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(themeStorageKey) || localStorage.getItem(legacyThemeStorageKey);
    if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";
  } catch (error) {
    console.warn("Dolmatov Life OS theme load failed", error);
  }
}

window.addEventListener("pagehide", () => {
  if (userDataSaveTimer === null) return;
  window.clearTimeout(userDataSaveTimer);
  userDataSaveTimer = null;
  saveUserData();
});

function applyUserData(saved, rawSaved = "") {
    if (!saved || typeof saved !== "object") return;
    lastSavedUserData = rawSaved || JSON.stringify(saved);
    if (Array.isArray(saved.taxonomy) && saved.taxonomy.length) {
      areas.splice(0, areas.length, ...normalizedTaxonomy(saved.taxonomy));
      rebuildTaxonomyIndexes();
    }
    if (Array.isArray(saved.taxonomyTrash)) state.taxonomyTrash = saved.taxonomyTrash;
    if (Array.isArray(saved.events)) state.events = saved.events;
    if (Array.isArray(saved.goals)) state.goals = saved.goals;
    else if (Array.isArray(saved.tasks)) state.goals = saved.tasks;
    if (Array.isArray(saved.notes)) state.notes = saved.notes;
    if (Array.isArray(saved.habits)) state.habits = saved.habits;
    if (Array.isArray(saved.metrics)) state.metrics = saved.metrics;
    if (saved.networking) state.networking = { ...state.networking, ...saved.networking };
    if (saved.finance) {
      state.finance = {
        ...state.finance,
        ...saved.finance,
        transactions: Array.isArray(saved.finance.transactions) ? saved.finance.transactions : [],
        budgets: saved.finance.budgets && typeof saved.finance.budgets === "object" ? saved.finance.budgets : {}
      };
    }
    if (saved.nutrition && typeof saved.nutrition === "object") {
      state.nutrition = {
        ...state.nutrition,
        ...saved.nutrition,
        entries: Array.isArray(saved.nutrition.entries) ? saved.nutrition.entries : []
      };
    }
    if (saved.family && typeof saved.family === "object") {
      state.family = {
        ...state.family,
        ...saved.family,
        members: saved.family.members && typeof saved.family.members === "object" ? saved.family.members : {}
      };
    }
    if (saved.dataMigrations && typeof saved.dataMigrations === "object") {
      state.dataMigrations = { ...state.dataMigrations, ...saved.dataMigrations };
    }
    if (Array.isArray(saved.recurringDoneDates)) {
      saved.recurringDoneDates.forEach((savedEvent) => {
        const recurringEvent = state.recurringEvents.find((event) => event.id === savedEvent.id);
        if (recurringEvent && Array.isArray(savedEvent.doneDates)) {
          recurringEvent.doneDates = savedEvent.doneDates;
        }
      });
    }
    if (saved.structureVersion !== structureVersion) {
      migrateLegacyStructureIds(Number(saved.structureVersion) || 0);
      migrateAirToSingleCompletedEvent();
      saveUserData();
    }
}

function loadUserData() {
  try {
    const currentSaved = localStorage.getItem(storageKey) || "";
    const legacySaved = currentSaved ? "" : (localStorage.getItem(legacyStorageKey) || "");
    const rawSaved = currentSaved || legacySaved;
    const saved = JSON.parse(rawSaved || "null");
    if (!saved) return "";
    applyUserData(saved, rawSaved);
    if (!currentSaved && legacySaved) localStorage.setItem(storageKey, legacySaved);
    return rawSaved;
  } catch (error) {
    console.warn("Dolmatov Life OS local load failed", error);
    return "";
  }
}

function restoreDeletedDirectionOnce(directionName) {
  const migrationKey = `restore-deleted-direction-${directionName.toLocaleLowerCase("ru-RU")}-2026-10-27`;
  if (state.dataMigrations[migrationKey]) return false;

  const normalizedName = directionName.trim().toLocaleLowerCase("ru-RU");
  const trashIndex = state.taxonomyTrash.findIndex(
    (item) => item.kind === "direction" && String(item.entity?.name || "").trim().toLocaleLowerCase("ru-RU") === normalizedName
  );
  if (trashIndex < 0) return false;

  const item = state.taxonomyTrash[trashIndex];
  const direction = JSON.parse(JSON.stringify(item.entity));
  const targetIndex = Math.min(Math.max(Number(item.index) || 0, 0), areas.length);
  areas.splice(targetIndex, 0, direction);
  state.taxonomyTrash.splice(trashIndex, 1);
  state.dataMigrations[migrationKey] = true;
  rebuildTaxonomyIndexes();
  return true;
}

function restoreNetworkingInitiativeOnce() {
  const migrationKey = "restore-networking-initiative-2026-10-27-v3";
  if (state.dataMigrations[migrationKey]) return false;

  const normalizeName = (value) =>
    String(value || "")
      .trim()
      .toLocaleLowerCase("ru-RU")
      .replaceAll("ё", "е");
  const targetArea = areas.find((area) => normalizeName(area.name) === "релиз") || findArea("sila");
  if (!targetArea) return false;

  let location = taxonomyInitiativeLocation(networkingInitiativeId);
  if (!location) {
    location = areas
      .map((area) => ({
        area,
        index: area.initiatives.findIndex((initiative) => normalizeName(initiative.name) === "нетворкинг")
      }))
      .filter((item) => item.index >= 0)
      .map((item) => ({ ...item, initiative: item.area.initiatives[item.index] }))[0] || null;
  }

  let initiative = location?.initiative || null;
  const previousId = initiative?.id || networkingInitiativeId;
  if (!initiative) {
    const trashIndex = state.taxonomyTrash.findIndex(
      (item) => item.kind === "initiative" && item.entity?.id === networkingInitiativeId
    );
    if (trashIndex >= 0) {
      initiative = JSON.parse(JSON.stringify(state.taxonomyTrash[trashIndex].entity));
      state.taxonomyTrash.splice(trashIndex, 1);
    }
  }
  if (!initiative) {
    initiative = {
      id: networkingInitiativeId,
      name: "Нетворкинг",
      status: "инициатива",
      kind: "initiative",
      parentInitiativeId: null,
      activities: [],
      goals: []
    };
  }

  if (location) location.area.initiatives.splice(location.index, 1);
  initiative.id = networkingInitiativeId;
  initiative.name = "Нетворкинг";
  initiative.status = "инициатива";
  initiative.kind = initiative.kind || "initiative";
  initiative.parentInitiativeId = null;
  initiative.activities = Array.isArray(initiative.activities) ? initiative.activities : [];
  initiative.goals = Array.isArray(initiative.goals) ? initiative.goals : [];

  const removedActivityIds = new Set();
  areas.forEach((area) => {
    area.initiatives.forEach((item) => {
      if (item === initiative) return;
      item.activities = item.activities.filter((activity) => {
        const isNetworkingDuplicate =
          activity.id === networkingInitiativeId || normalizeName(activity.name) === "нетворкинг";
        if (!isNetworkingDuplicate) return true;
        removedActivityIds.add(activity.id);
        (activity.goals || []).forEach((goal) => {
          goal.areaId = targetArea.id;
          goal.initiativeId = networkingInitiativeId;
          goal.activityId = null;
          if (!initiative.goals.some((itemGoal) => itemGoal.id === goal.id)) initiative.goals.push(goal);
        });
        return false;
      });
    });
  });

  const insertAfterIndex = targetArea.initiatives.findIndex((item) => item.name === "Проявление ценности");
  targetArea.initiatives.splice(insertAfterIndex >= 0 ? insertAfterIndex + 1 : targetArea.initiatives.length, 0, initiative);

  [state.goals, state.events, state.recurringEvents, state.notes, state.habits, state.metrics]
    .filter(Array.isArray)
    .forEach((collection) => {
      collection.forEach((item) => {
        if (item.initiativeId !== previousId && item.type !== "networking" && !removedActivityIds.has(item.activityId)) return;
        item.areaId = targetArea.id;
        item.initiativeId = networkingInitiativeId;
        if (removedActivityIds.has(item.activityId)) item.activityId = null;
      });
    });
  state.networking.annualGoal = Number(state.networking.annualGoal) || 200;
  state.dataMigrations[migrationKey] = true;
  rebuildTaxonomyIndexes();
  return true;
}

function moveRequestedInitiativesOnce() {
  const migrationKey = "move-requested-initiatives-2026-10-27";
  if (state.dataMigrations[migrationKey]?.completed) return false;

  const normalizeName = (value) =>
    String(value || "")
      .trim()
      .toLocaleLowerCase("ru-RU")
      .replaceAll("ё", "е")
      .replace(/\s+/g, " ");
  const moves = [
    { name: "Сон", target: "ФИЗИОЛОГИЯ" },
    { name: "Проактивное здоровье", target: "ФИЗИОЛОГИЯ" },
    { name: "Уход за собой", target: "ФИЗИОЛОГИЯ" },
    { name: "Отношения (Окружение)", aliases: ["Отношение (окружение)"], target: "ЭКЗИСТЕНЦИЯ" },
    { name: "Мировоззрение (Вера)", target: "ЭКЗИСТЕНЦИЯ" },
    { name: "Безвозмездное созидание", target: "ЭКЗИСТЕНЦИЯ" },
    { name: "Состояние", target: "БАЗИС" },
    { name: "Созерцание прекрасного", target: "БАЗИС" },
    { name: "Изучение жизни", target: "БАЗИС" }
  ];
  const moved = [];
  const missing = [];
  let taxonomyChanged = false;

  moves.forEach((move) => {
    const targetArea = areas.find((area) => normalizeName(area.name) === normalizeName(move.target));
    const acceptedNames = [move.name, ...(move.aliases || [])].map(normalizeName);
    const sourceArea = areas.find((area) =>
      area.initiatives.some((initiative) => acceptedNames.includes(normalizeName(initiative.name)))
    );
    const initiative = sourceArea?.initiatives.find((item) => acceptedNames.includes(normalizeName(item.name)));

    if (!targetArea || !sourceArea || !initiative) {
      missing.push(move.name);
      return;
    }
    if (sourceArea.id === targetArea.id) return;

    sourceArea.initiatives.splice(sourceArea.initiatives.indexOf(initiative), 1);
    targetArea.initiatives.push(initiative);
    moved.push({ initiative: initiative.name, from: sourceArea.name, to: targetArea.name });
    taxonomyChanged = true;
  });

  const migrationStatus = {
    completed: missing.length === 0,
    moved,
    missing
  };
  const statusChanged = JSON.stringify(state.dataMigrations[migrationKey]) !== JSON.stringify(migrationStatus);
  state.dataMigrations[migrationKey] = migrationStatus;
  if (taxonomyChanged) rebuildTaxonomyIndexes();
  return taxonomyChanged || statusChanged;
}

function restoreSleepOrderAfterTransferTestOnce() {
  const migrationKey = "restore-sleep-order-after-transfer-test-2026-10-27";
  if (state.dataMigrations[migrationKey]) return false;
  const physiology = areas.find((area) => area.name === "ФИЗИОЛОГИЯ");
  const sleepIndex = physiology?.initiatives.findIndex((initiative) => initiative.name === "Сон") ?? -1;
  if (!physiology || sleepIndex < 0) return false;
  if (sleepIndex > 0) {
    const [sleep] = physiology.initiatives.splice(sleepIndex, 1);
    physiology.initiatives.unshift(sleep);
  }
  state.dataMigrations[migrationKey] = true;
  return true;
}

function restoreInitiativesConvertedToActivities() {
  let changed = false;
  areas.forEach((area) => {
    const restored = [];
    area.initiatives.forEach((container) => {
      container.activities = container.activities.filter((activity) => {
        const activityId = String(activity.id || "");
        const hasInitiativeId = activityId.startsWith("initiative-") || !activityId.includes("-activity-") && !activityId.startsWith("activity-");
        if (!hasInitiativeId || area.initiatives.some((initiative) => initiative.id === activity.id)) return true;

        const initiative = {
          id: activity.id,
          name: activity.name,
          status: "инициатива",
          kind: "initiative",
          parentInitiativeId: container.id,
          activities: [],
          goals: Array.isArray(activity.goals) ? activity.goals : []
        };
        [state.goals, state.events, state.recurringEvents, state.notes, state.habits, state.metrics]
          .filter(Array.isArray)
          .forEach((collection) => {
            collection.forEach((item) => {
              if (item.activityId !== activity.id) return;
              item.areaId = area.id;
              item.initiativeId = initiative.id;
              item.activityId = null;
            });
          });
        initiative.goals.forEach((goal) => {
          if (!goal || typeof goal !== "object") return;
          goal.areaId = area.id;
          goal.initiativeId = initiative.id;
          goal.activityId = null;
        });
        restored.push(initiative);
        changed = true;
        return false;
      });
    });
    area.initiatives.push(...restored);
  });
  if (changed) rebuildTaxonomyIndexes();
  return changed;
}

function migrateAirToSingleCompletedEvent() {
  state.recurringEvents = state.recurringEvents.filter((event) => event.id !== "recurring-air-hiring");
  state.events = state.events.filter((event) => event.title !== "AIR" || event.id === "event-air-2026-08-19");
  if (!airYesterdayEvent) return;

  const existingEvent = state.events.find((event) => event.id === airYesterdayEvent.id);
  if (existingEvent) {
    Object.assign(existingEvent, airYesterdayEvent, { done: true });
    return;
  }
  state.events.push({ ...airYesterdayEvent });
}

function clearAllGoalsOnce() {
  if (state.dataMigrations.allGoalsClearedVersion >= 1) return false;
  state.goals = [];
  state.events = [];
  state.recurringEvents.forEach((event) => {
    event.doneDates = [];
  });
  state.openGoalId = null;
  state.dataMigrations.allGoalsClearedVersion = 1;
  return true;
}

function remapLegacyId(id, fromVersion = structureVersion - 1) {
  if (!id) return id;
  const matchCurrentTaxonomy = String(id).match(/^((?:sila|balance|love)-\d+)(-activity-\d+)?$/);
  if (fromVersion >= 6 && matchCurrentTaxonomy) {
    let remappedId = matchCurrentTaxonomy[1];
    if (fromVersion === 6 && currentTaxonomyMigration[remappedId]) remappedId = currentTaxonomyMigration[remappedId];
    if (fromVersion <= 7 && balanceInitiativeTransferMigration[remappedId]) remappedId = balanceInitiativeTransferMigration[remappedId];
    if (fromVersion <= 8 && routineReturnMigration[remappedId]) remappedId = routineReturnMigration[remappedId];
    if (fromVersion <= 9 && initiativeOrderMigration[remappedId]) remappedId = initiativeOrderMigration[remappedId];
    return `${remappedId}${matchCurrentTaxonomy[2] || ""}`;
  }
  const movedInitiativeId = remapBlagoInitiativeId(id, fromVersion);
  if (movedInitiativeId) return movedInitiativeId;
  if (id === legacyNetworkingInitiativeId) return networkingInitiativeId;
  if (id === legacyFinancialControlInitiativeId) return financialControlInitiativeId;
  const match = String(id).match(/^(sila|balance|love)-(\d+)(-activity-\d+)?$/);
  if (!match) return id;
  const [, areaId, rawIndex, activitySuffix = ""] = match;
  const offset = legacyInitiativeOffsets[areaId] || 0;
  const currentIndex = Number(rawIndex);
  const remappedId = currentIndex <= offset ? id : `${areaId}-${currentIndex - offset}${activitySuffix}`;
  return remappedId === legacyFinancialControlInitiativeId ? financialControlInitiativeId : remappedId;
}

function remapBlagoInitiativeId(id, fromVersion = structureVersion - 1) {
  if (fromVersion >= 6) return null;
  const match = String(id).match(/^(love-\d+)(-activity-\d+)?$/);
  if (!match || !blagoInitiativeMoves[match[1]]) return null;
  return `${blagoInitiativeMoves[match[1]]}${match[2] || ""}`;
}

function areaIdFromEntityId(id) {
  const match = String(id || "").match(/^(sila|balance|love)-/);
  return match ? match[1] : null;
}

function migrateLegacyStructureIds(fromVersion = 0) {
  let migrated = false;
  state.goals.forEach((goal) => {
    const movedToBlago = Boolean(remapBlagoInitiativeId(goal.initiativeId, fromVersion) || remapBlagoInitiativeId(goal.activityId, fromVersion));
    const nextInitiativeId = remapLegacyId(goal.initiativeId, fromVersion);
    const nextActivityId = remapLegacyId(goal.activityId, fromVersion);
    const nextAreaId = areaIdFromEntityId(nextInitiativeId) || areaIdFromEntityId(nextActivityId);
    if (movedToBlago && goal.areaId !== "balance") {
      goal.areaId = "balance";
      migrated = true;
    }
    if (nextAreaId && goal.areaId !== nextAreaId) {
      goal.areaId = nextAreaId;
      migrated = true;
    }
    if (nextInitiativeId !== goal.initiativeId) {
      goal.initiativeId = nextInitiativeId;
      migrated = true;
    }
    if (nextActivityId !== goal.activityId) {
      goal.activityId = nextActivityId;
      migrated = true;
    }
  });
  state.events.forEach((event) => {
    const movedToBlago = Boolean(remapBlagoInitiativeId(event.initiativeId, fromVersion) || remapBlagoInitiativeId(event.activityId, fromVersion));
    const nextInitiativeId = event.type === "networking" ? networkingInitiativeId : remapLegacyId(event.initiativeId, fromVersion);
    const nextActivityId = remapLegacyId(event.activityId, fromVersion);
    const nextAreaId = areaIdFromEntityId(nextInitiativeId) || areaIdFromEntityId(nextActivityId);
    if (event.type === "networking" && event.areaId !== "sila") {
      event.areaId = "sila";
      migrated = true;
    }
    if (movedToBlago && event.areaId !== "balance") {
      event.areaId = "balance";
      migrated = true;
    }
    if (nextAreaId && event.areaId !== nextAreaId) {
      event.areaId = nextAreaId;
      migrated = true;
    }
    if (nextInitiativeId !== event.initiativeId) {
      event.initiativeId = nextInitiativeId;
      migrated = true;
    }
    if (nextActivityId !== event.activityId) {
      event.activityId = nextActivityId;
      migrated = true;
    }
  });
  const nextSelectedInitiativeId = remapLegacyId(state.selectedInitiativeId, fromVersion);
  const nextOpenInitiativeId = remapLegacyId(state.openInitiativeId, fromVersion);
  const nextSelectedActivityId = remapLegacyId(state.selectedActivityId, fromVersion);
  if (nextSelectedInitiativeId !== state.selectedInitiativeId) {
    state.selectedInitiativeId = nextSelectedInitiativeId;
    migrated = true;
  }
  if (nextOpenInitiativeId !== state.openInitiativeId) {
    state.openInitiativeId = nextOpenInitiativeId;
    migrated = true;
  }
  if (nextSelectedActivityId !== state.selectedActivityId) {
    state.selectedActivityId = nextSelectedActivityId;
    migrated = true;
  }
  return migrated;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getToday() {
  return startOfDay(new Date());
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

function addMonths(date, amount) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount, 1);
  return startOfDay(next);
}

function dateKey(date) {
  const normalized = startOfDay(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function formatFullDate(date) {
  return capitalize(dateFormatters.fullDate.format(date));
}

function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

function formatDateKey(key) {
  if (!key) return formatFullDate(getToday());
  return capitalize(dateFormatters.date.format(dateFromKey(key)));
}

function formatNetworkingMoment(metDate, startTime, endTime = "") {
  const dateLabel = formatDateKey(metDate || dateKey(getToday()));
  if (startTime && endTime) return `${dateLabel}, ${startTime}-${endTime}`;
  return startTime ? `${dateLabel}, ${startTime}` : dateLabel;
}

function formatMonthYear(date) {
  return capitalize(dateFormatters.monthYear.format(date));
}

function formatMoney(value) {
  return moneyFormatter.format(Number(value) || 0);
}

function formatFinanceMonth(monthKey) {
  const [year, month] = (monthKey || dateKey(getToday()).slice(0, 7)).split("-").map(Number);
  return capitalize(dateFormatters.monthYear.format(new Date(year, month - 1, 1)));
}

function getWeekStart(date) {
  const normalized = startOfDay(date);
  const offset = (normalized.getDay() + 6) % 7;
  return addDays(normalized, -offset);
}

function createCalendarDay(date) {
  const normalized = startOfDay(date);
  return {
    key: dateKey(normalized),
    dateObject: normalized,
    label: capitalize(dateFormatters.weekday.format(normalized)),
    date: normalized.getDate(),
    month: dateFormatters.month.format(normalized),
    isToday: dateKey(normalized) === dateKey(getToday())
  };
}

function formatCalendarTitle(days) {
  if (!days.length) return formatMonthYear(state.calendarAnchor);
  const first = startOfDay(days[0].dateObject || state.calendarAnchor);
  const last = startOfDay(days[days.length - 1].dateObject || state.calendarAnchor);

  if (state.calendarMode === "day") {
    return formatFullDate(first);
  }

  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return formatMonthYear(first);
  }

  const firstMonth = capitalize(dateFormatters.month.format(first));
  const lastLabel = dateFormatters.monthYear.format(last);
  return `${firstMonth} - ${lastLabel}`;
}

function findArea(id) {
  return areaById.get(id) || (id === transitArea.id ? transitArea : undefined);
}

function findInitiative(id) {
  return initiativeById.get(id);
}

function findDirectionBlockByLegacyId(id) {
  return directionBlockByLegacyId.get(id);
}

function findInitiativeOrDirectionBlock(id) {
  return findInitiative(id) || findDirectionBlockByLegacyId(id);
}

function findActivity(id) {
  return activityById.get(id);
}

function findEntityByName(areaId, initiativeName, activityName = "") {
  const area = findArea(areaId);
  const initiative = area?.initiatives.find((item) => item.name === initiativeName);
  const activity = activityName ? initiative?.activities.find((item) => item.name === activityName) : null;
  return { area, initiative, activity };
}

function seedTomorrowPlan() {
  const scheduledDate = "2026-08-24";
  const plan = [
    { key: "sleep", title: "Сон", areaId: "balance", initiative: "Сон", start: "00:00", end: "09:00" },
    {
      key: "morning-routine",
      title: "Подготовка ко дню",
      areaId: "sila",
      initiative: "Рутина — утро и вечер",
      activity: "Подготовка ко дня",
      start: "09:00",
      end: "11:00",
      checklist: ["Туалет", "Зубы", "Теплая вода", "Зарядка", "Душ", "Уход за лицом", "Завтрак", "Заготовить обед", "Витамин D и Омега"]
    },
    {
      key: "air",
      title: "AIR",
      areaId: "sila",
      initiative: "Проявление ценности",
      activity: "Найм",
      start: "11:00",
      end: "18:00"
    },
    {
      key: "dentist",
      title: "Стоматолог",
      areaId: "balance",
      initiative: "Проактивное здоровье",
      activity: "Стоматология",
      start: "20:00",
      end: "21:00"
    }
  ];

  let changed = false;
  const newGoals = plan
    .filter((item) => !state.goals.some((goal) => goal.planKey === "plan-" + scheduledDate + "-" + item.key))
    .map((item) => {
      const entity = findEntityByName(item.areaId, item.initiative, item.activity);
      if (!entity.area || !entity.initiative || (item.activity && !entity.activity)) return null;
      return {
        id: "goal-plan-" + scheduledDate + "-" + item.key,
        planKey: "plan-" + scheduledDate + "-" + item.key,
        title: item.title,
        areaId: entity.area.id,
        initiativeId: entity.initiative.id,
        activityId: entity.activity?.id || null,
        date: scheduledDate,
        time: item.start,
        endTime: item.end,
        energy: "средняя",
        type: "single",
        done: false,
        completedDate: null,
        checklist: (item.checklist || []).map((title, index) => ({ id: `check-${item.key}-${index}`, title, done: false }))
      };
    })
    .filter(Boolean);

  if (newGoals.length) {
    state.goals.unshift(...newGoals);
    changed = true;
  }

  const routineGoal = state.goals.find((goal) => goal.planKey === "plan-" + scheduledDate + "-morning-routine");
  const routinePlan = plan.find((item) => item.key === "morning-routine");
  if (routineGoal && !goalChecklist(routineGoal).length && routinePlan?.checklist?.length) {
    routineGoal.checklist = routinePlan.checklist.map((title, index) => ({ id: `check-morning-routine-${index}`, title, done: false }));
    changed = true;
  }

  return changed;
}

function formatClock(value, fallbackMinute = 0) {
  const hourValue = Math.floor(value);
  const minuteValue = value % 1 ? Math.round((value - hourValue) * 60) : fallbackMinute;
  const hour = String(hourValue).padStart(2, "0");
  const minute = String(minuteValue).padStart(2, "0");
  return `${hour}:${minute}`;
}

function timeToCalendarValue(value) {
  const match = value?.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return {
    hour,
    minute,
    value: hour + minute / 60
  };
}

function formatEventTime(event) {
  return formatClock(event.start, event.minute || 0);
}

function formatEventRange(event) {
  return event.end === undefined ? formatEventTime(event) : `${formatEventTime(event)}-${formatClock(event.end, event.endMinute || 0)}`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function goalTypeLabel(type) {
  return "цель";
}

function goalMarker(goal) {
  if (goal.done) return "OK";
  return "";
}

function goalChecklist(goal) {
  return Array.isArray(goal?.checklist) ? goal.checklist : [];
}

function setGoalCompletion(goal, done) {
  goal.done = done;
  goal.completedDate = done ? dateKey(getToday()) : null;
  if (done) {
    goalChecklist(goal).forEach((item) => {
      item.done = true;
    });
  }
}

function refreshGoalViews() {
  saveUserData();
  if (state.activeView === "initiatives") {
    renderInitiatives();
  } else if (state.activeView === "calendar") {
    renderCalendar();
  } else if (state.activeView === "today") {
    renderGoals();
    renderTimeline();
  }
  renderRadianceExtensions();
}

function recurringInstance(recurring, key) {
  return {
    ...recurring,
    id: `${recurring.id}-${key}`,
    recurringId: recurring.id,
    date: key,
    done: recurring.doneDates.includes(key)
  };
}

function recurringEventsForDate(key) {
  const date = dateFromKey(key);
  const weekday = date.getDay();
  return state.recurringEvents
    .filter((event) => event.weekdays.includes(weekday))
    .map((event) => recurringInstance(event, key));
}

function goalHasScheduledTime(goal) {
  return Boolean(/^\d{4}-\d{2}-\d{2}$/.test(goal?.date || "") && timeToCalendarValue(goal?.time));
}

function calendarEventFromGoal(goal) {
  const time = timeToCalendarValue(goal.time);
  const endTime = timeToCalendarValue(goal.endTime);
  const initiative = findInitiativeOrDirectionBlock(goal.initiativeId);
  return {
    id: `goal-event-${goal.id}`,
    goalId: goal.id,
    date: goal.date,
    start: time.value,
    minute: time.minute,
    end: Math.min(24, endTime && endTime.value > time.value ? endTime.value : time.value + 1),
    endMinute: endTime?.minute || 0,
    title: goal.title,
    areaId: goal.areaId,
    initiativeId: goal.initiativeId,
    activityId: goal.activityId,
    type: "goal",
    detail: initiative?.name || "цель",
    done: Boolean(goal.done)
  };
}

function calendarEventsByDate(keys) {
  const uniqueKeys = [...new Set(keys)];
  const keySet = new Set(uniqueKeys);
  const byDate = new Map(uniqueKeys.map((key) => [key, []]));

  state.events.forEach((event) => {
    if (keySet.has(event.date)) byDate.get(event.date).push(event);
  });

  uniqueKeys.forEach((key) => {
    byDate.get(key).push(...recurringEventsForDate(key));
  });

  const eventGoalIds = new Set(state.events.filter((event) => event.goalId).map((event) => event.goalId));
  state.goals.forEach((goal) => {
    if (!keySet.has(goal.date) || !goalHasScheduledTime(goal) || eventGoalIds.has(goal.id)) return;
    byDate.get(goal.date).push(calendarEventFromGoal(goal));
  });

  return byDate;
}

function eventsForDate(key) {
  return calendarEventsByDate([key]).get(key) || [];
}

function renderSidebarContext() {
  const title = qs("#sideTitle");
  const container = qs("#sideInitiatives");
  const section = title.closest(".side-section");

  if (["today", "initiatives", "calendar"].includes(state.activeView)) {
    section.classList.remove("is-empty");
    title.textContent = "Направления";
    container.innerHTML = `
      ${areas
      .map(
        (area) => `
          <div class="side-area-group taxonomy-item" draggable="true" data-taxonomy-kind="direction" data-taxonomy-id="${area.id}" style="--side-color:${area.color}">
            <div class="side-entity-line side-direction-line">
              <button class="side-area-button ${area.id === state.selectedAreaId ? "active" : ""}" data-side-area="${area.id}" style="--side-color:${area.color}">
                <span class="side-area-row"><span>${escapeHtml(area.name)}</span></span>
              </button>
              <span class="taxonomy-actions">
                <button type="button" data-taxonomy-add="initiative" data-parent-id="${area.id}" aria-label="Добавить инициативу" title="Добавить инициативу">+</button>
                <button type="button" data-taxonomy-delete="direction" data-entity-id="${area.id}" aria-label="Удалить направление" title="Удалить">×</button>
              </span>
            </div>
            ${
              area.id === state.openAreaId
                ? `<div class="side-initiative-children">
                    ${area.initiatives
                      .filter((initiative) => !initiative.parentInitiativeId)
                      .map(
                        (initiative) => `
                          <div class="side-initiative-node taxonomy-item" draggable="true" data-taxonomy-kind="initiative" data-taxonomy-id="${initiative.id}" data-taxonomy-parent="${area.id}" data-taxonomy-container="${initiative.kind === "container" || initiative.activities.length > 0}">
                            <div class="side-entity-line side-initiative-line">
                              <button class="side-initiative-button ${initiative.id === state.selectedInitiativeId ? "active" : ""}" data-side-area="${area.id}" data-side-initiative="${initiative.id}" style="--side-color:${area.color}">
                                <span class="side-initiative-row"><span>${escapeHtml(initiative.name)}</span></span>
                              </button>
                              <span class="taxonomy-actions">
                                ${initiative.kind === "container" || initiative.activities.length || area.initiatives.some((child) => child.parentInitiativeId === initiative.id) ? `<button type="button" data-taxonomy-add="activity" data-parent-id="${initiative.id}" aria-label="Добавить активность" title="Добавить активность">+</button>` : ""}
                                <button type="button" data-taxonomy-delete="initiative" data-entity-id="${initiative.id}" data-parent-id="${area.id}" aria-label="Удалить инициативу" title="Удалить">×</button>
                              </span>
                              ${initiative.kind === "container" || initiative.activities.length || area.initiatives.some((child) => child.parentInitiativeId === initiative.id) ? `<button type="button" class="side-disclosure ${initiative.id === state.openInitiativeId ? "open" : ""}" data-side-area="${area.id}" data-side-initiative="${initiative.id}" aria-label="${initiative.id === state.openInitiativeId ? "Скрыть активности" : "Показать активности"}"></button>` : ""}
                            </div>
                          ${
                            initiative.id === state.openInitiativeId && (initiative.activities.length || area.initiatives.some((child) => child.parentInitiativeId === initiative.id))
                              ? `<div class="side-activity-children">
                                  ${initiative.activities
                                    .map(
                                      (activity) => `
                                        <div class="side-activity-node taxonomy-item" draggable="true" data-taxonomy-kind="activity" data-taxonomy-id="${activity.id}" data-taxonomy-parent="${initiative.id}">
                                          <button class="side-activity-button ${activity.id === state.selectedActivityId ? "active" : ""}" data-side-area="${area.id}" data-side-initiative="${initiative.id}" data-side-activity="${activity.id}" style="--side-color:${area.color}">
                                            <span>${escapeHtml(activity.name)}</span>
                                          </button>
                                          <span class="taxonomy-actions"><button type="button" data-taxonomy-delete="activity" data-entity-id="${activity.id}" data-parent-id="${initiative.id}" aria-label="Удалить активность" title="Удалить">×</button></span>
                                        </div>
                                      `
                                    )
                                    .join("")}
                                  ${area.initiatives
                                    .filter((child) => child.parentInitiativeId === initiative.id)
                                    .map(
                                      (child) => `
                                        <div class="side-activity-node side-nested-initiative-node taxonomy-item" draggable="true" data-taxonomy-kind="initiative" data-taxonomy-id="${child.id}" data-taxonomy-parent="${area.id}" data-taxonomy-container="${child.kind === "container" || child.activities.length > 0}">
                                          <button class="side-activity-button ${child.id === state.selectedInitiativeId ? "active" : ""}" data-side-area="${area.id}" data-side-initiative="${child.id}" style="--side-color:${area.color}">
                                            <span>${escapeHtml(child.name)}</span>
                                          </button>
                                          <span class="taxonomy-actions"><button type="button" data-taxonomy-delete="initiative" data-entity-id="${child.id}" data-parent-id="${area.id}" aria-label="Удалить инициативу" title="Удалить">×</button></span>
                                        </div>
                                      `
                                    )
                                    .join("")}
                                </div>`
                              : ""
                          }
                          </div>
                        `
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </div>
        `
      )
      .join("")}
      <form class="taxonomy-inline-create" id="taxonomyDirectionForm">
        <input name="directionName" type="text" autocomplete="off" aria-label="Новое направление" placeholder="">
      </form>`;

    return;
  }

  section.classList.add("is-empty");
  title.textContent = "";
  container.innerHTML = "";
}

function handleSidebarSelection(button) {
  const areaId = button.dataset.sideArea;
  const initiativeId = button.dataset.sideInitiative || null;
  const activityId = button.dataset.sideActivity || null;
  const selectedInitiative = initiativeId ? findInitiative(initiativeId) : null;

  if (!initiativeId) {
    if (state.openAreaId === areaId) {
      state.activeView = "today";
      document.body.dataset.activeView = "today";
      state.selectedAreaId = null;
      state.openAreaId = null;
      state.selectedInitiativeId = null;
      state.selectedActivityId = null;
      state.openInitiativeId = null;
      qsa(".view").forEach((item) => item.classList.toggle("active", item.id === "view-today"));
      qsa(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === "today"));
      updatePageHeader();
      renderSidebarContext();
      return;
    }
    state.selectedAreaId = areaId;
    state.openAreaId = areaId;
    state.selectedInitiativeId = null;
    state.selectedActivityId = null;
    state.openInitiativeId = null;
  } else if (activityId) {
    state.selectedAreaId = areaId;
    state.openAreaId = areaId;
    state.selectedInitiativeId = initiativeId;
    state.openInitiativeId = initiativeId;
    state.selectedActivityId = activityId;
  } else if (selectedInitiative?.kind === "container" || selectedInitiative?.activities.length) {
    state.selectedAreaId = areaId;
    state.openAreaId = areaId;
    if (state.openInitiativeId === initiativeId) {
      state.selectedInitiativeId = null;
      state.openInitiativeId = null;
      state.selectedActivityId = null;
    } else {
      state.selectedInitiativeId = initiativeId;
      state.openInitiativeId = initiativeId;
      state.selectedActivityId = null;
    }
  } else {
    state.selectedAreaId = areaId;
    state.openAreaId = areaId;
    state.selectedInitiativeId = initiativeId;
    state.selectedActivityId = null;
    state.openInitiativeId = null;
  }

  state.activeView = "initiatives";
  document.body.dataset.activeView = "initiatives";
  qsa(".view").forEach((item) => item.classList.toggle("active", item.id === "view-initiatives"));
  qsa(".nav-item").forEach((item) => item.classList.remove("active"));
  updatePageHeader();
  renderSidebarContext();
  renderInitiatives();
  renderGoalWorkspaceHost();
}

function renderTimeline() {
  const timeline = qs("#timeline");
  if (!timeline) return;
  const todayEvents = eventsForDate(dateKey(getToday())).sort((a, b) => a.start - b.start);
  if (!todayEvents.length) {
    timeline.innerHTML = `<div class="empty-inline">Нет событий</div>`;
    return;
  }

  timeline.innerHTML = todayEvents
    .map((event) => {
      const area = findArea(event.areaId) || { color: "var(--accent)", name: "Направление" };
      const initiative = findInitiativeOrDirectionBlock(event.initiativeId) || { name: "Без инициативы", area };
      return `
        <div class="time-row">
          <div class="time-label">${formatEventTime(event)}</div>
          <div class="time-block ${event.type}" style="--event-color:${area.color}">
            <strong>${event.title}</strong>
            <small>${initiative.name} / ${event.detail}</small>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderGoals() {
  const todayGoals = state.goals.filter((goal) => goal.date === dateKey(getToday()));
  if (!todayGoals.length) {
    qs("#goalList").innerHTML = `<div class="empty-inline">На сегодня целей нет</div>`;
    return;
  }

  qs("#goalList").innerHTML = todayGoals
    .map((goal, index) => {
      const area = findArea(goal.areaId) || { name: "Направление" };
      const initiative = findInitiativeOrDirectionBlock(goal.initiativeId) || { name: "Без инициативы", area };
      return `
        <article class="goal ${goal.done ? "done" : ""} ${goal.type === "group" ? "group" : ""}" data-goal="${index}" data-open-goal="${goal.id}" tabindex="0">
          <div class="goal-title">
            <button class="checkbox goal-toggle" type="button" data-entity-goal-toggle="${goal.id}" aria-label="${goal.done ? "Вернуть цель" : "Закрыть цель"}">${goalMarker(goal)}</button>
            <h3>${goal.title}</h3>
          </div>
          <div class="goal-meta">
            <span>${initiative.area.name}</span>
            <span>${initiative.name}</span>
            <span>${goal.time}</span>
            <span>${goalTypeLabel(goal.type)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderHabits() {
  const habitList = qs("#habitList");
  if (!habitList) return;
  if (!state.habits.length) {
    habitList.innerHTML = `<div class="empty-inline">Привычки пока не добавлены.</div>`;
    return;
  }

  habitList.innerHTML = state.habits
    .map(
      (habit) => `
        <article class="habit">
          <div>
            <h3>${habit.title}</h3>
            <div class="habit-meta">${habit.meta}</div>
          </div>
          <div class="habit-checks">${habit.checks.map((check) => `<i class="${check ? "done" : ""}"></i>`).join("")}</div>
        </article>
      `
    )
    .join("");
}

function renderMetrics() {
  const metricGrid = qs("#metricGrid");
  if (!metricGrid) return;
  if (!state.metrics.length) {
    metricGrid.innerHTML = `<div class="empty-inline">Метрик за сегодня пока нет.</div>`;
    return;
  }

  metricGrid.innerHTML = state.metrics
    .map((metric) => `<div class="metric"><strong>${metric.value}</strong><span>${metric.label}</span></div>`)
    .join("");
}

function calendarVisibleDays() {
  const anchor = startOfDay(state.calendarAnchor);
  if (state.calendarMode === "day") return [createCalendarDay(anchor)];
  if (state.calendarMode === "three") return Array.from({ length: 3 }, (_, index) => createCalendarDay(addDays(anchor, index)));

  const weekStart = getWeekStart(anchor);
  return Array.from({ length: 7 }, (_, index) => createCalendarDay(addDays(weekStart, index)));
}

function renderCalendar() {
  const calendarModeSelect = qs("#calendarModeSelect");
  if (calendarModeSelect) calendarModeSelect.value = state.calendarMode;

  if (state.calendarMode === "year") {
    renderYearCalendar();
    return;
  }

  if (state.calendarMode === "week") {
    renderMonthCalendar();
    return;
  }

  const days = calendarVisibleDays();
  const eventsByDate = calendarEventsByDate(days.map((day) => day.key));
  qs("#calendarTitle").textContent = formatCalendarTitle(days);
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const grid = [
    `<div class="calendar-grid" style="--days:${days.length}">`,
    `<div class="calendar-head" style="grid-column:1; grid-row:1"></div>`,
    ...days.map((day, dayIndex) => `<div class="calendar-head ${day.isToday ? "is-today" : ""}" style="grid-column:${dayIndex + 2}; grid-row:1"><strong>${day.date}</strong><span>${day.label}</span></div>`)
  ];

  hours.forEach((hour) => {
    const gridRow = hour + 2;
    grid.push(`<div class="calendar-time" data-hour="${hour}" style="grid-column:1; grid-row:${gridRow}">${String(hour).padStart(2, "0")}:00</div>`);
    days.forEach((day, dayIndex) => {
      grid.push(`<div class="calendar-slot" data-calendar-slot data-calendar-date="${day.key}" data-calendar-hour="${hour}" data-calendar-day-index="${dayIndex}" style="grid-column:${dayIndex + 2}; grid-row:${gridRow}"></div>`);
    });
  });

  days.forEach((day, dayIndex) => {
    const dayEvents = eventsByDate.get(day.key) || [];
    dayEvents.forEach((event) => {
      grid.push(renderCalendarEvent(event, dayIndex));
    });
  });

  const todayIndex = days.findIndex((day) => day.isToday);
  if (todayIndex >= 0) {
    grid.push(renderCurrentTimeLine(todayIndex));
  }

  grid.push("</div>");
  qs("#calendarCanvas").innerHTML = grid.join("");
  bindCalendarEventActions();
  bindCalendarSlotSelection();
  scrollCalendarToHour(5);
}

function scrollCalendarToHour(hour) {
  if (state.calendarMode === "week" || state.calendarMode === "year") return;
  const calendarMain = qs(".calendar-main");
  const hourLabel = qs(`.calendar-time[data-hour="${hour}"]`);
  if (!calendarMain || !hourLabel) return;

  requestAnimationFrame(() => {
    const headerHeight = qs(".calendar-head")?.offsetHeight || 54;
    calendarMain.scrollTo({
      top: Math.max(0, hourLabel.offsetTop - headerHeight),
      behavior: "auto"
    });
  });
}

function eventGridStart(event) {
  return Math.floor(event.start) + 2;
}

function eventGridSpan(event) {
  if (event.end === undefined) return 1;
  return Math.max(1, Math.ceil(event.end) - Math.floor(event.start));
}

function renderCalendarEvent(event, dayIndex) {
  const area = findArea(event.areaId) || { color: "var(--accent)", name: "Направление" };
  const initiative = findInitiativeOrDirectionBlock(event.initiativeId) || { name: "Без инициативы", area };
  const gridColumn = dayIndex + 2;
  const gridRow = eventGridStart(event);
  const gridSpan = eventGridSpan(event);
  return `
    <div class="calendar-event event-${event.type} ${event.done ? "done" : ""}" ${event.goalId ? `data-calendar-goal-open="${event.goalId}"` : ""} style="--event-color:${area.color}; grid-column:${gridColumn}; grid-row:${gridRow} / span ${gridSpan}; border-left-color:${area.color}">
      <button class="calendar-event-check" data-event-done="${event.id}" ${event.goalId ? `data-goal-id="${event.goalId}"` : ""} ${event.recurringId ? `data-recurring-id="${event.recurringId}" data-event-date="${event.date}"` : ""} aria-label="${event.done ? "Вернуть цель" : "Завершить цель"}">${event.done ? "✓" : ""}</button>
      <div class="calendar-event-body">
        <strong>${event.title}</strong>
        <span>${formatEventRange(event)} / ${initiative.name}</span>
      </div>
    </div>
  `;
}

function renderCurrentTimeLine(dayIndex) {
  const now = new Date();
  const hour = now.getHours();
  const minuteRatio = now.getMinutes() / 60;
  return `
    <div class="calendar-now-line" style="grid-column:${dayIndex + 2}; grid-row:${hour + 2}; --minute-ratio:${minuteRatio}">
      <i></i>
    </div>
  `;
}

function bindCalendarEventActions() {
  qsa("[data-event-done]:not([data-goal-id])").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const recurringId = button.dataset.recurringId;
      if (recurringId) {
        const recurringEvent = state.recurringEvents.find((item) => item.id === recurringId);
        const eventDate = button.dataset.eventDate;
        if (!recurringEvent || !eventDate) return;
        if (recurringEvent.doneDates.includes(eventDate)) {
          recurringEvent.doneDates = recurringEvent.doneDates.filter((date) => date !== eventDate);
        } else {
          recurringEvent.doneDates.push(eventDate);
        }
        refreshGoalViews();
        return;
      }
      const calendarEvent = state.events.find((item) => item.id === button.dataset.eventDone);
      if (!calendarEvent) return;
      calendarEvent.done = !calendarEvent.done;
      refreshGoalViews();
    });
  });
}

function calendarPointerTime(slot, clientY) {
  const hour = Number(slot.dataset.calendarHour);
  const rect = slot.getBoundingClientRect();
  const position = Math.min(0.999, Math.max(0, (clientY - rect.top) / Math.max(1, rect.height)));
  return Math.min(23.75, hour + Math.floor(position * 4) / 4);
}

function renderCalendarDraftSelection(preview, selection, hourHeight) {
  const startHour = Math.floor(selection.start);
  preview.style.gridColumn = String(selection.dayIndex + 2);
  preview.style.gridRow = String(startHour + 2);
  preview.style.height = `${Math.max(14, (selection.end - selection.start) * hourHeight)}px`;
  preview.style.transform = `translateY(${(selection.start - startHour) * hourHeight}px)`;
  preview.innerHTML = `
    <div class="calendar-draft-event-body">
      <strong data-calendar-draft-title>Новая цель</strong>
      <span data-calendar-draft-meta>${formatClock(selection.start)}-${formatClock(selection.end)}</span>
    </div>`;
}

function bindCalendarSlotSelection() {
  const grid = qs(".calendar-grid");
  if (!grid) return;

  grid.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest(".calendar-event")) return;
    const slot = event.target.closest("[data-calendar-slot]");
    if (!slot) return;

    event.preventDefault();
    const anchor = calendarPointerTime(slot, event.clientY);
    const hourHeight = slot.getBoundingClientRect().height || 44;
    const selection = {
      date: slot.dataset.calendarDate,
      dayIndex: Number(slot.dataset.calendarDayIndex),
      start: anchor,
      end: Math.min(24, anchor + 0.25)
    };
    let moved = false;
    const preview = document.createElement("div");
    preview.className = "calendar-draft-selection";
    preview.style.setProperty("--draft-color", "var(--accent)");
    grid.append(preview);
    renderCalendarDraftSelection(preview, selection, hourHeight);

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
    };

    const move = (moveEvent) => {
      const hovered = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest("[data-calendar-slot]");
      if (!hovered || hovered.dataset.calendarDate !== selection.date) return;
      const current = calendarPointerTime(hovered, moveEvent.clientY);
      moved = moved || Math.abs(current - anchor) >= 0.25;
      selection.start = Math.min(anchor, current);
      selection.end = Math.min(24, Math.max(anchor, current) + 0.25);
      renderCalendarDraftSelection(preview, selection, hourHeight);
    };

    const finish = () => {
      stop();
      if (!moved) {
        selection.end = Math.min(24, selection.start + 1);
        renderCalendarDraftSelection(preview, selection, hourHeight);
      }
      preview.classList.add("is-editing");
      openCalendarGoalComposer(selection, preview);
    };

    const cancel = () => {
      stop();
      preview.remove();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  });
}

function calendarGoalComposerHost() {
  let host = qs("#calendarGoalComposerHost");
  if (host) return host;
  host = document.createElement("div");
  host.id = "calendarGoalComposerHost";
  document.body.append(host);
  return host;
}

function closeCalendarGoalComposer() {
  const host = qs("#calendarGoalComposerHost");
  if (host) host.innerHTML = "";
  if (activeCalendarDraftPreview) activeCalendarDraftPreview.remove();
  activeCalendarDraftPreview = null;
}

function closeCalendarEventPopover() {
  const host = qs("#calendarEventPopoverHost");
  if (host) host.remove();
}

function openCalendarEventPopover(goalId, anchor) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal || !anchor) return;
  closeCalendarEventPopover();
  state.openNoteId = null;
  state.openGoalId = goalId;
  const area = findArea(goal.areaId) || transitArea;
  const initiative = goal.initiativeId ? taxonomyInitiativeLocation(goal.initiativeId)?.initiative : null;
  const activity = goal.activityId ? taxonomyActivityLocation(goal.activityId)?.activity : null;
  const scope = [area?.name, initiative?.name, activity?.name].filter(Boolean).join(" / ");
  const checklist = goalChecklist(goal);
  const rect = anchor.getBoundingClientRect();
  const width = 320;
  const left = rect.right + width + 12 < window.innerWidth ? rect.right + 12 : Math.max(76, rect.left - width - 12);
  const top = Math.min(Math.max(16, rect.top), Math.max(16, window.innerHeight - 360));
  const host = document.createElement("div");
  host.id = "calendarEventPopoverHost";
  host.innerHTML = `
    <section class="calendar-event-popover" style="left:${left}px; top:${top}px; --module-color:${area?.color || "#a65d70"}" role="dialog" aria-label="Цель в календаре">
      <header class="calendar-event-popover-header">
        <button class="goal-toggle ${goal.done ? "done" : ""}" type="button" data-entity-goal-toggle="${goal.id}" aria-label="${goal.done ? "Вернуть цель" : "Закрыть цель"}">${goal.done ? "✓" : ""}</button>
        <button class="icon-button" type="button" data-close-calendar-event aria-label="Закрыть">×</button>
      </header>
      <div class="calendar-event-popover-body">
        <p class="object-editor-context">${escapeHtml(scope || "Без направления")}</p>
        <h3>${escapeHtml(goal.title)}</h3>
        <p class="calendar-event-popover-text">${escapeHtml(goal.description || "Описание")}</p>
        ${checklist.length ? `
          <div class="calendar-event-popover-checklist">
            ${checklist.map((item) => `
              <label class="goal-checklist-item ${item.done ? "done" : ""}">
                <input type="checkbox" data-goal-check-item="${item.id}" ${item.done ? "checked" : ""}>
                <span>${escapeHtml(item.title)}</span>
              </label>`).join("")}
          </div>` : ""}
      </div>
    </section>
  `;
  document.body.append(host);
  host.querySelector("[data-close-calendar-event]").addEventListener("click", closeCalendarEventPopover);
  bindEntityGoalControls(host);
}

function calendarGoalDates(startKey, endKey, frequency) {
  const start = dateFromKey(startKey);
  const end = dateFromKey(endKey);
  if (end < start) return [];
  const dates = [];
  const increment = frequency === "weekly" ? 7 : 1;
  for (let day = start, checked = 0; day <= end && checked <= 1000; day = addDays(day, increment), checked += 1) {
    if (frequency !== "weekdays" || (day.getDay() !== 0 && day.getDay() !== 6)) {
      dates.push(dateKey(day));
    }
  }
  return dates;
}

function positionCalendarGoalComposer(form, anchorRect) {
  const margin = 12;
  const gap = 12;
  const width = form.offsetWidth;
  const height = form.offsetHeight;
  let side = "right";
  let left = anchorRect.right + gap;

  if (left + width > window.innerWidth - margin) {
    left = anchorRect.left - width - gap;
    side = "left";
  }
  if (left < margin) {
    left = Math.max(margin, Math.min(anchorRect.left, window.innerWidth - width - margin));
    side = "over";
  }

  const top = Math.max(margin, Math.min(anchorRect.top, window.innerHeight - height - margin));
  form.style.left = `${Math.round(left)}px`;
  form.style.top = `${Math.round(top)}px`;
  form.dataset.side = side;
}

function openCalendarGoalComposer(selection, preview) {
  const host = calendarGoalComposerHost();
  const composerAreas = [...areas].reverse();
  const initialArea = composerAreas.find((area) => area.id === state.selectedAreaId) || composerAreas[0];
  const startTime = formatClock(selection.start);
  const endTime = formatClock(selection.end);
  activeCalendarDraftPreview = preview;
  preview.style.setProperty("--draft-color", initialArea.color);

  host.innerHTML = `
    <section class="calendar-goal-composer-layer" role="dialog" aria-modal="true" aria-labelledby="calendarGoalComposerTitle">
      <button class="calendar-goal-composer-backdrop" type="button" data-close-calendar-goal aria-label="Закрыть"></button>
      <form class="calendar-goal-composer" id="calendarGoalComposerForm">
        <header class="calendar-goal-composer-header">
          <div>
            <p class="eyebrow">Новая цель</p>
            <h2 id="calendarGoalComposerTitle">Добавить в календарь</h2>
          </div>
          <button class="icon-button" type="button" data-close-calendar-goal aria-label="Закрыть">×</button>
        </header>
        <div class="calendar-selection-summary">
          <strong>${escapeHtml(formatDateKey(selection.date))}</strong>
          <span>${startTime}-${endTime}</span>
        </div>
        <label class="calendar-composer-title-field">
          <input name="title" type="text" autocomplete="off" placeholder="Название цели" required>
        </label>
        <div class="calendar-composer-classification">
          <label><span>Направление</span><select name="areaId" required>${composerAreas.map((area) => `<option value="${area.id}" ${area.id === initialArea.id ? "selected" : ""}>${escapeHtml(area.name)}</option>`).join("")}</select></label>
          <label><span>Инициатива</span><select name="initiativeId" required>${initialArea.initiatives.map((initiative) => `<option value="${initiative.id}">${escapeHtml(initiative.name)}</option>`).join("")}</select></label>
          <label class="calendar-composer-activity-field"><span>Активность</span><select name="activityId"></select></label>
        </div>
        <label class="calendar-repeat-toggle">
          <input name="repeat" type="checkbox">
          <span>Повторять цель</span>
        </label>
        <div class="calendar-repeat-fields" hidden>
          <label><span>Начало</span><input type="date" value="${selection.date}" readonly></label>
          <label><span>Периодичность</span><select name="frequency"><option value="daily">Каждый день</option><option value="weekdays">По будням</option><option value="weekly">Каждую неделю</option></select></label>
          <label><span>Повторять до</span><input name="repeatUntil" type="date" min="${selection.date}" value="${selection.date}"></label>
        </div>
        <p class="calendar-composer-error" role="alert" aria-live="polite"></p>
        <footer class="calendar-goal-composer-actions">
          <button class="secondary-action" type="button" data-close-calendar-goal>Отмена</button>
          <button class="primary-action" type="submit">Добавить</button>
        </footer>
      </form>
    </section>`;

  const form = host.querySelector("#calendarGoalComposerForm");
  const areaSelect = form.elements.areaId;
  const initiativeSelect = form.elements.initiativeId;
  const activitySelect = form.elements.activityId;
  const activityField = form.querySelector(".calendar-composer-activity-field");
  const repeatToggle = form.elements.repeat;
  const repeatFields = form.querySelector(".calendar-repeat-fields");
  const repeatUntil = form.elements.repeatUntil;
  const error = form.querySelector(".calendar-composer-error");

  const updateDraftPreview = () => {
    const title = String(form.elements.title.value || "").trim() || "Новая цель";
    const initiative = findInitiative(initiativeSelect.value);
    const titleNode = preview.querySelector("[data-calendar-draft-title]");
    const metaNode = preview.querySelector("[data-calendar-draft-meta]");
    if (titleNode) titleNode.textContent = title;
    if (metaNode) metaNode.textContent = `${startTime}-${endTime}${initiative ? ` / ${initiative.name}` : ""}`;
  };

  const updateActivities = () => {
    const initiative = findInitiative(initiativeSelect.value);
    const activities = initiative?.activities || [];
    activitySelect.innerHTML = `<option value="">Без активности</option>${activities.map((activity) => `<option value="${activity.id}">${escapeHtml(activity.name)}</option>`).join("")}`;
    activityField.hidden = !activities.length;
    updateDraftPreview();
  };

  const updateInitiatives = () => {
    const area = findArea(areaSelect.value) || composerAreas[0];
    initiativeSelect.innerHTML = area.initiatives.map((initiative) => `<option value="${initiative.id}">${escapeHtml(initiative.name)}</option>`).join("");
    preview.style.setProperty("--draft-color", area.color);
    updateActivities();
  };

  areaSelect.addEventListener("change", updateInitiatives);
  initiativeSelect.addEventListener("change", updateActivities);
  form.elements.title.addEventListener("input", updateDraftPreview);
  repeatToggle.addEventListener("change", () => {
    repeatFields.hidden = !repeatToggle.checked;
    repeatUntil.required = repeatToggle.checked;
  });
  host.querySelectorAll("[data-close-calendar-goal]").forEach((button) => button.addEventListener("click", closeCalendarGoalComposer));
  host.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCalendarGoalComposer();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    const data = Object.fromEntries(new FormData(form).entries());
    const title = String(data.title || "").trim();
    const isRepeating = repeatToggle.checked;
    const endDate = isRepeating ? String(data.repeatUntil || "") : selection.date;
    const dates = calendarGoalDates(selection.date, endDate, String(data.frequency || "daily"));
    if (!title || !dates.length) {
      error.textContent = !title ? "Введите название цели." : "Дата окончания должна быть не раньше даты начала.";
      return;
    }
    if (dates.length > 1000) {
      error.textContent = "Сократите период повторения до 1000 целей.";
      return;
    }

    const recurrenceGroupId = isRepeating ? uid("recurrence") : null;
    const goals = dates.map((date) => ({
      id: uid("goal"),
      title,
      areaId: String(data.areaId),
      initiativeId: String(data.initiativeId),
      activityId: String(data.activityId || "") || null,
      date,
      time: startTime,
      endTime,
      energy: "средняя",
      type: isRepeating ? "recurring" : "single",
      recurrenceGroupId,
      recurrenceRule: isRepeating ? { frequency: String(data.frequency), startDate: selection.date, endDate } : null,
      description: "",
      checklist: [],
      done: false,
      completedDate: null
    }));
    state.goals.unshift(...goals);
    closeCalendarGoalComposer();
    refreshGoalViews();
  });

  updateActivities();
  positionCalendarGoalComposer(form, preview.getBoundingClientRect());
  form.elements.title.focus();
}

function positionQuickComposer(form, anchorButton) {
  const buttonRect = anchorButton.getBoundingClientRect();
  const sidebarRect = anchorButton.closest(".sidebar")?.getBoundingClientRect();
  const anchorRect = sidebarRect
    ? { left: sidebarRect.right, right: sidebarRect.right, top: buttonRect.top, bottom: buttonRect.bottom }
    : buttonRect;
  positionCalendarGoalComposer(form, anchorRect);
}

function openQuickEntryChooser(anchorButton) {
  closeCalendarGoalComposer();
  const host = calendarGoalComposerHost();
  host.innerHTML = `
    <section class="calendar-goal-composer-layer" role="dialog" aria-modal="true" aria-labelledby="quickEntryChooserTitle">
      <button class="calendar-goal-composer-backdrop" type="button" data-close-calendar-goal aria-label="Закрыть"></button>
      <section class="calendar-goal-composer quick-entry-chooser" id="quickEntryChooser">
        <header class="calendar-goal-composer-header">
          <div><h2 id="quickEntryChooserTitle">Что добавить?</h2></div>
          <button class="icon-button" type="button" data-close-calendar-goal aria-label="Закрыть">×</button>
        </header>
        <div class="quick-entry-options">
          <button class="quick-entry-option" type="button" data-quick-entry-type="goal">
            <strong>Цель</strong>
          </button>
          <button class="quick-entry-option" type="button" data-quick-entry-type="note">
            <strong>Заметка</strong>
          </button>
        </div>
      </section>
    </section>`;

  const chooser = host.querySelector("#quickEntryChooser");
  host.querySelectorAll("[data-close-calendar-goal]").forEach((button) => button.addEventListener("click", closeCalendarGoalComposer));
  host.querySelectorAll("[data-quick-entry-type]").forEach((button) => {
    button.addEventListener("click", () => openQuickGoalComposer(anchorButton, button.dataset.quickEntryType));
  });
  host.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCalendarGoalComposer();
  });
  positionQuickComposer(chooser, anchorButton);
}

function openQuickGoalComposer(anchorButton, entryType = null) {
  if (!entryType) {
    openQuickEntryChooser(anchorButton);
    return;
  }
  closeCalendarGoalComposer();
  const host = calendarGoalComposerHost();
  const isNote = entryType === "note";
  const composerAreas = [...areas];
  const areaOptions = composerAreas.map((area) => `<option value="${area.id}">${escapeHtml(area.name)}</option>`).join("");

  host.innerHTML = `
    <section class="calendar-goal-composer-layer" role="dialog" aria-modal="true" aria-labelledby="quickGoalComposerTitle">
      <button class="calendar-goal-composer-backdrop" type="button" data-close-calendar-goal aria-label="Закрыть"></button>
      <form class="calendar-goal-composer quick-goal-composer" id="quickGoalComposerForm">
        <header class="calendar-goal-composer-header">
          <div>
            <p class="eyebrow">${isNote ? "Новая заметка" : "Новая цель"}</p>
            <h2 id="quickGoalComposerTitle">${isNote ? "Добавить заметку" : "Добавить цель"}</h2>
          </div>
          <button class="icon-button" type="button" data-close-calendar-goal aria-label="Закрыть">×</button>
        </header>
        <label class="calendar-composer-title-field">
          <textarea name="title" rows="1" autocomplete="off" placeholder="${isNote ? "Текст заметки" : "Название цели"}" required></textarea>
        </label>
        ${!isNote ? `
          <label class="quick-goal-description-field">
            <textarea name="description" rows="1" autocomplete="off" placeholder="Описание"></textarea>
          </label>
          <section class="quick-goal-checklist" aria-label="Пункты цели">
            <div class="quick-goal-checklist-list" data-quick-goal-checklist></div>
            <input name="checkItem" type="text" autocomplete="off" placeholder="Новый пункт">
          </section>
        ` : ""}
        ${isNote ? `
          <div class="calendar-composer-classification quick-note-classification">
            <label><span>Направление <em>необязательно</em></span><select name="areaId"><option value="">Без направления</option>${areaOptions}</select></label>
          </div>
        ` : `
          <div class="calendar-composer-classification">
            <label><span>Направление</span><select name="areaId" required><option value="">Выберите направление</option>${areaOptions}</select></label>
            <label><span>Инициатива <em>необязательно</em></span><select name="initiativeId" disabled><option value="">Сначала выберите направление</option></select></label>
            <label class="calendar-composer-activity-field" hidden><span>Активность</span><select name="activityId" disabled></select></label>
          </div>
          <section class="quick-goal-schedule">
            <div class="quick-goal-schedule-title">Дата и время <span>необязательно</span></div>
            <div class="quick-goal-schedule-fields">
              <label><span>Дата</span><input name="date" type="date"></label>
              <div class="quick-goal-time-field">
                <span>Время</span>
                <div><input name="time" type="time" aria-label="Начало"><i>—</i><input name="endTime" type="time" aria-label="Окончание"></div>
              </div>
            </div>
          </section>
          <label class="calendar-repeat-toggle is-disabled">
            <input name="repeat" type="checkbox" disabled>
            <span>Повторять цель</span>
          </label>
          <div class="calendar-repeat-fields" hidden>
            <label><span>Периодичность</span><select name="frequency"><option value="daily">Каждый день</option><option value="weekdays">По будням</option><option value="weekly">Каждую неделю</option></select></label>
            <label><span>Повторять до</span><input name="repeatUntil" type="date"></label>
          </div>
        `}
        <p class="calendar-composer-error" role="alert" aria-live="polite"></p>
        <footer class="calendar-goal-composer-actions">
          <button class="secondary-action" type="button" data-close-calendar-goal>Отмена</button>
          <button class="primary-action" type="submit">${isNote ? "Сохранить" : "Добавить"}</button>
        </footer>
      </form>
    </section>`;

  const form = host.querySelector("#quickGoalComposerForm");
  const areaSelect = form.elements.areaId;
  const error = form.querySelector(".calendar-composer-error");
  const titleField = form.elements.title;
  const descriptionField = form.elements.description;
  const checklistItems = [];

  const autoResizeTitle = () => {
    titleField.style.height = "auto";
    titleField.style.height = `${Math.min(titleField.scrollHeight, 144)}px`;
  };

  titleField.addEventListener("input", autoResizeTitle);

  const autoResizeDescription = () => {
    if (!descriptionField) return;
    descriptionField.style.height = "auto";
    descriptionField.style.height = `${Math.min(descriptionField.scrollHeight, 112)}px`;
  };

  descriptionField?.addEventListener("input", autoResizeDescription);

  if (!isNote) {
    const checklistList = form.querySelector("[data-quick-goal-checklist]");
    const checklistInput = form.elements.checkItem;
    const renderChecklist = () => {
      checklistList.innerHTML = checklistItems.map((item, index) => `
        <div class="quick-goal-checklist-item">
          <span>${escapeHtml(item.title)}</span>
          <button type="button" data-remove-quick-goal-checklist="${index}" aria-label="Удалить пункт">×</button>
        </div>`).join("");
    };
    const addChecklistItem = () => {
      const itemTitle = String(checklistInput.value || "").trim();
      if (!itemTitle) return;
      checklistItems.push({ id: uid("check"), title: itemTitle, done: false });
      checklistInput.value = "";
      renderChecklist();
    };

    checklistInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.isComposing) return;
      event.preventDefault();
      addChecklistItem();
    });
    checklistList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-quick-goal-checklist]");
      if (!removeButton) return;
      checklistItems.splice(Number(removeButton.dataset.removeQuickGoalChecklist), 1);
      renderChecklist();
    });
  }

  let initiativeSelect;
  let activitySelect;
  let activityField;
  let dateInput;
  let repeatToggle;
  let repeatLabel;
  let repeatFields;
  let repeatUntil;

  if (!isNote) {
    initiativeSelect = form.elements.initiativeId;
    activitySelect = form.elements.activityId;
    activityField = form.querySelector(".calendar-composer-activity-field");
    dateInput = form.elements.date;
    repeatToggle = form.elements.repeat;
    repeatLabel = repeatToggle.closest(".calendar-repeat-toggle");
    repeatFields = form.querySelector(".calendar-repeat-fields");
    repeatUntil = form.elements.repeatUntil;

    const updateActivities = () => {
      const initiative = findInitiative(initiativeSelect.value);
      const activities = initiative?.activities || [];
      activitySelect.innerHTML = `<option value="">Без активности</option>${activities.map((activity) => `<option value="${activity.id}">${escapeHtml(activity.name)}</option>`).join("")}`;
      activitySelect.disabled = !activities.length;
      activityField.hidden = !activities.length;
    };

    const updateInitiatives = () => {
      const area = findArea(areaSelect.value);
      if (!area) {
        initiativeSelect.disabled = true;
        initiativeSelect.innerHTML = '<option value="">Сначала выберите направление</option>';
        activitySelect.disabled = true;
        activityField.hidden = true;
        return;
      }
      initiativeSelect.disabled = false;
      initiativeSelect.innerHTML = `<option value="">Без инициативы</option>${area.initiatives.map((initiative) => `<option value="${initiative.id}">${escapeHtml(initiative.name)}</option>`).join("")}`;
      updateActivities();
    };

    const updateScheduleState = () => {
      const hasDate = Boolean(dateInput.value);
      repeatToggle.disabled = !hasDate;
      repeatLabel.classList.toggle("is-disabled", !hasDate);
      if (!hasDate && repeatToggle.checked) {
        repeatToggle.checked = false;
        repeatFields.hidden = true;
        repeatUntil.required = false;
      }
      if (hasDate) {
        repeatUntil.min = dateInput.value;
        if (!repeatUntil.value || repeatUntil.value < dateInput.value) repeatUntil.value = dateInput.value;
      }
    };

    areaSelect.addEventListener("change", updateInitiatives);
    initiativeSelect.addEventListener("change", updateActivities);
    dateInput.addEventListener("change", updateScheduleState);
    repeatToggle.addEventListener("change", () => {
      repeatFields.hidden = !repeatToggle.checked;
      repeatUntil.required = repeatToggle.checked;
    });
    updateInitiatives();
    updateScheduleState();
  }
  host.querySelectorAll("[data-close-calendar-goal]").forEach((button) => button.addEventListener("click", closeCalendarGoalComposer));
  host.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCalendarGoalComposer();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    const data = Object.fromEntries(new FormData(form).entries());
    const title = String(data.title || "").trim();

    if (!title) {
      error.textContent = isNote ? "Введите текст заметки." : "Введите название цели.";
      return;
    }
    if (isNote) {
      state.notes.unshift({
        id: uid("note"),
        text: title,
        createdAt: new Date().toISOString(),
        areaId: String(data.areaId || "") || null,
        initiativeId: null,
        activityId: null
      });
      closeCalendarGoalComposer();
      refreshThoughtViews();
      return;
    }

    const date = String(data.date || "");
    const time = String(data.time || "");
    const endTime = String(data.endTime || "");
    const isRepeating = repeatToggle.checked;
    if (!data.areaId) {
      error.textContent = "Выберите направление для цели.";
      return;
    }
    if ((time || endTime) && !date) {
      error.textContent = "Для времени нужно выбрать дату.";
      return;
    }
    if ((time && !endTime) || (!time && endTime)) {
      error.textContent = "Укажите начало и окончание времени.";
      return;
    }
    if (time && endTime && endTime <= time) {
      error.textContent = "Окончание должно быть позже начала.";
      return;
    }

    const endDate = isRepeating ? String(data.repeatUntil || "") : date;
    const dates = date ? (isRepeating ? calendarGoalDates(date, endDate, String(data.frequency || "daily")) : [date]) : [""];
    if (!dates.length) {
      error.textContent = "Дата окончания должна быть не раньше даты начала.";
      return;
    }
    if (dates.length > 1000) {
      error.textContent = "Сократите период повторения до 1000 целей.";
      return;
    }

    const recurrenceGroupId = isRepeating ? uid("recurrence") : null;
    const goals = dates.map((goalDate) => ({
      id: uid("goal"),
      title,
      areaId: String(data.areaId),
      initiativeId: String(data.initiativeId || "") || null,
      activityId: String(data.activityId || "") || null,
      date: goalDate,
      time: time || "без времени",
      endTime: endTime || "",
      energy: "средняя",
      type: isRepeating ? "recurring" : "single",
      recurrenceGroupId,
      recurrenceRule: isRepeating ? { frequency: String(data.frequency), startDate: date, endDate } : null,
      description: String(data.description || "").trim(),
      checklist: checklistItems.map((item) => ({ ...item })),
      done: false,
      completedDate: null
    }));
    state.goals.unshift(...goals);
    closeCalendarGoalComposer();
    refreshGoalViews();
  });

  positionQuickComposer(form, anchorButton);
  autoResizeTitle();
  autoResizeDescription();
  titleField.focus();
}

function renderMonthCalendar() {
  const anchor = startOfDay(state.calendarAnchor);
  const monthStart = startOfDay(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const monthEnd = startOfDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0));
  const gridStart = getWeekStart(monthStart);
  const totalDays = Math.ceil(((monthEnd - gridStart) / 86400000 + 1) / 7) * 7;
  const weekdays = Array.from({ length: 7 }, (_, index) => createCalendarDay(addDays(gridStart, index)).label);
  const dayRecords = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(gridStart, index);
    const key = dateKey(date);
    return {
      key,
      date,
      isCurrentMonth: date.getMonth() === anchor.getMonth(),
      isToday: key === dateKey(getToday())
    };
  });
  const eventsByDate = calendarEventsByDate(dayRecords.map((day) => day.key));
  const days = dayRecords.map((day) => ({ ...day, events: eventsByDate.get(day.key) || [] }));

  qs("#calendarTitle").textContent = formatMonthYear(monthStart);
  qs("#calendarCanvas").innerHTML = `
    <div class="month-calendar">
      <div class="month-weekdays">
        ${weekdays.map((weekday) => `<div>${weekday}</div>`).join("")}
      </div>
      <div class="month-grid">
        ${days
          .map(
            (day) => `
              <article class="month-day ${day.isCurrentMonth ? "" : "muted-month"} ${day.isToday ? "is-today" : ""}">
                <div class="month-day-number">${day.date.getDate()}</div>
                <div class="month-events">
                  ${day.events.map((event) => renderMonthEvent(event)).join("")}
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
  bindCalendarEventActions();
}

function renderMonthEvent(event) {
  const area = findArea(event.areaId) || { color: "var(--accent)", name: "Направление" };
  const initiative = findInitiativeOrDirectionBlock(event.initiativeId) || { name: "Без инициативы", area };
  return `
    <div class="month-event ${event.done ? "done" : ""}" ${event.goalId ? `data-calendar-goal-open="${event.goalId}"` : ""} style="--event-color:${area.color}">
      <button class="calendar-event-check" data-event-done="${event.id}" ${event.goalId ? `data-goal-id="${event.goalId}"` : ""} ${event.recurringId ? `data-recurring-id="${event.recurringId}" data-event-date="${event.date}"` : ""} aria-label="${event.done ? "Вернуть цель" : "Завершить цель"}">${event.done ? "✓" : ""}</button>
      <strong>${event.title}</strong>
      <span>${formatEventRange(event)} / ${initiative.name}</span>
    </div>
  `;
}

function renderYearCalendar() {
  const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  qs("#calendarTitle").textContent = String(state.calendarAnchor.getFullYear());
  qs("#calendarCanvas").innerHTML = `
    <div class="year-grid">
      ${months
        .map(
          (month, monthIndex) => `
            <article class="year-month">
              <h3>${month}</h3>
              <div class="year-dots">
                ${Array.from({ length: 35 }, () => `<i></i>`).join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function networkingProgress() {
  const done = state.networking.contacts.length;
  const goal = state.networking.annualGoal;
  return {
    done,
    goal,
    percent: Math.min(100, Math.round((done / goal) * 100)),
    remaining: Math.max(0, goal - done)
  };
}

function addNetworkingContact(contact) {
  const networkingLocation = taxonomyInitiativeLocation(networkingInitiativeId);
  const networkingAreaId = networkingLocation?.area.id || "sila";
  const startTime = contact.startTime?.trim() || contact.metTime?.trim() || contact.metAt?.match(/(\d{1,2})[:.](\d{2})/)?.[0]?.replace(".", ":") || "";
  const endTime = contact.endTime?.trim() || "";
  const startValue = timeToCalendarValue(startTime);
  const endValue = timeToCalendarValue(endTime);
  const metDate = contact.metDate?.trim() || dateKey(getToday());
  const normalized = {
    id: `network-contact-${Date.now()}-${state.networking.contacts.length + 1}`,
    name: contact.name?.trim() || "Новый контакт",
    place: contact.place?.trim() || "",
    metDate,
    startTime,
    endTime,
    metTime: startTime,
    metAt: contact.metAt?.trim() || formatNetworkingMoment(metDate, startTime, endTime),
    phone: contact.phone?.trim() || "",
    telegram: contact.telegram?.trim() || "",
    link: contact.link?.trim() || "",
    instagram: contact.instagram?.trim() || "",
    source: contact.source?.trim() || "ручной ввод"
  };
  state.networking.contacts.unshift(normalized);
  const goalId = `goal-networking-${Date.now()}`;
  state.goals.unshift({
    id: goalId,
    title: `Новый контакт: ${normalized.name}`,
    areaId: networkingAreaId,
    initiativeId: networkingInitiativeId,
    date: normalized.metDate,
    completedDate: normalized.metDate,
    time: normalized.metAt,
    energy: "социальная",
    type: "single",
    done: true
  });
  if (startValue) {
    const eventEnd = endValue && endValue.value > startValue.value ? endValue.value : startValue.value + 0.5;
    state.events.push({
      id: `event-networking-${Date.now()}`,
      date: normalized.metDate,
      start: startValue.value,
      minute: startValue.minute,
      end: eventEnd,
      title: `Нетворкинг: ${normalized.name}`,
      areaId: networkingAreaId,
      initiativeId: networkingInitiativeId,
      goalId,
      type: "networking",
      detail: normalized.place || "новый контакт",
      done: true
    });
  }
  saveUserData();
  return normalized;
}

function renderNetworkingModule() {
  const progress = networkingProgress();
  return `
    <section class="panel initiative-module networking-dashboard" aria-label="Нетворкинг">
      <div class="module-header">
        <div>
          <h3>Нетворкинг</h3>
          <p class="muted">Контакты, знакомства и движение к годовой цели.</p>
        </div>
        <span class="tag">мини-приложение</span>
      </div>
      <section class="networking-goal">
        <div>
          <span class="quiet">цель на год</span>
          <strong>${progress.done} / ${progress.goal}</strong>
          <p class="muted">${progress.remaining ? `Осталось ${progress.remaining} контактов.` : "Годовая цель закрыта."}</p>
        </div>
        <div class="networking-percent">${progress.percent}%</div>
        <div class="bar networking-bar"><i style="width:${progress.percent}%"></i></div>
      </section>

      <section class="networking-form-panel">
        <div class="subhead">
          <h3>Добавить контакт</h3>
          <span class="quiet">каждый контакт двигает годовую цель</span>
        </div>
        <form class="networking-form" id="networkingForm">
          <label><span>Имя и фамилия</span><input name="name" autocomplete="name" placeholder="Например: Иван Петров" required></label>
          <label><span>Место знакомства</span><input name="place" placeholder="Событие, место, компания"></label>
          <label><span>Дата знакомства</span><input name="metDate" type="date" value="${dateKey(getToday())}"></label>
          <label><span>Начало</span><input name="startTime" type="time"></label>
          <label><span>Конец</span><input name="endTime" type="time"></label>
          <label><span>Телефон</span><input name="phone" inputmode="tel" placeholder="+7 ..."></label>
          <label><span>Telegram</span><input name="telegram" placeholder="@username"></label>
          <label><span>Ссылка</span><input name="link" inputmode="url" placeholder="https://..."></label>
          <label><span>Instagram</span><input name="instagram" placeholder="@username"></label>
          <button class="primary-action" type="submit">Добавить контакт</button>
        </form>
      </section>

      <section>
        <div class="subhead">
          <h3>Контакты</h3>
          <span class="quiet">${progress.done} добавлено</span>
        </div>
        <div class="networking-list">
          ${
            state.networking.contacts.length
              ? state.networking.contacts.map(renderNetworkingContact).join("")
              : `<div class="empty-inline">Контактов пока нет. Добавь первого человека через форму или быстрый ввод.</div>`
          }
        </div>
      </section>
    </section>
  `;
}

function renderNetworkingContact(contact) {
  const meta = [
    contact.metAt,
    contact.place,
    contact.phone,
    contact.telegram,
    contact.instagram
  ].filter(Boolean);
  const links = [
    contact.link ? `<a href="${escapeHtml(contact.link)}" target="_blank" rel="noreferrer">ссылка</a>` : "",
    contact.telegram ? `<span>${escapeHtml(contact.telegram)}</span>` : "",
    contact.instagram ? `<span>${escapeHtml(contact.instagram)}</span>` : ""
  ].filter(Boolean);
  return `
    <article class="networking-contact">
      <div>
        <strong>${escapeHtml(contact.name)}</strong>
        <span>${meta.map(escapeHtml).join(" / ") || "данные можно дополнить позже"}</span>
      </div>
      ${links.length ? `<div class="networking-links">${links.join("")}</div>` : ""}
    </article>
  `;
}

function bindNetworkingForm() {
  const form = qs("#networkingForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const contact = addNetworkingContact(data);
    qs("#parsedOutput").innerHTML = `<div class="parsed-chip">Нетворкинг: ${escapeHtml(contact.name)} добавлен. Прогресс цели обновлен.</div>`;
    refreshGoalViews();
  });
}

function renderFamilyMember(slot) {
  const member = state.family.members[slot.id];
  const name = member?.name?.trim();
  return `
    <article class="family-member${name ? " is-filled" : ""}">
      <span>${slot.role}</span>
      <strong>${name ? escapeHtml(name) : "Не заполнено"}</strong>
    </article>
  `;
}

function renderFamilyTreeModule() {
  const generations = [3, 2, 1];
  return `
    <section class="panel initiative-module family-tree-dashboard" aria-label="Семейное древо">
      <div class="module-header">
        <div>
          <h3>Семейное древо</h3>
          <p class="muted">Собери три поколения рода, начиная с себя.</p>
        </div>
        <span class="tag">3 колена</span>
      </div>

      <section class="family-tree-canvas" aria-label="Три поколения семьи">
        ${generations
          .map((generation) => {
            const slots = familyTreeSlots.filter((slot) => slot.generation === generation);
            return `
              <div class="family-generation family-generation-${generation}">
                <span class="family-generation-label">${generation} колено</span>
                <div class="family-members">
                  ${slots.map(renderFamilyMember).join("")}
                </div>
              </div>
            `;
          })
          .join("")}
      </section>

      <form class="family-tree-form" id="familyTreeForm">
        <label>
          <span>Ветвь</span>
          <select name="slotId" aria-label="Выбрать ветвь рода">
            ${familyTreeSlots
              .map((slot) => `<option value="${slot.id}">${slot.generation} колено - ${slot.role}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span>Имя</span>
          <input name="name" autocomplete="name" placeholder="Имя и фамилия" required>
        </label>
        <button class="primary-action" type="submit">Сохранить имя</button>
      </form>
    </section>
  `;
}

function bindFamilyTreeModule() {
  const form = qs("#familyTreeForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || "").trim();
    const slot = familyTreeSlots.find((item) => item.id === data.slotId);
    if (!name || !slot) return;
    state.family.members[slot.id] = { name };
    saveUserData();
    renderInitiatives();
  });
}

function nutritionEntriesForDate(key = dateKey(getToday())) {
  return state.nutrition.entries.filter((entry) => entry.date === key);
}

function nutritionTotals(entries) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + Number(entry.calories || 0),
      protein: totals.protein + Number(entry.protein || 0),
      fat: totals.fat + Number(entry.fat || 0),
      carbs: totals.carbs + Number(entry.carbs || 0)
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

function formatNutritionValue(value, suffix = "") {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return String(Number.isInteger(rounded) ? rounded : rounded.toFixed(1)) + suffix;
}

function calculateNutritionValues(data) {
  const weight = Math.max(0, Number(data.weight) || 0);
  const multiplier = weight / 100;
  return {
    weight,
    calories: Math.max(0, Number(data.caloriesPer100) || 0) * multiplier,
    protein: Math.max(0, Number(data.proteinPer100) || 0) * multiplier,
    fat: Math.max(0, Number(data.fatPer100) || 0) * multiplier,
    carbs: Math.max(0, Number(data.carbsPer100) || 0) * multiplier
  };
}

function renderNutritionSummaryValue(label, value, suffix, main = false) {
  return `
    <div class="nutrition-summary-item${main ? " nutrition-summary-calories" : ""}">
      <span>${label}</span>
      <strong>${formatNutritionValue(value, suffix)}</strong>
    </div>
  `;
}

function renderNutritionEntry(entry) {
  return `
    <article class="nutrition-entry">
      <div class="nutrition-entry-title">
        <strong>${escapeHtml(entry.name)}</strong>
        <span>${formatNutritionValue(entry.weight, " г")}${entry.time ? ` · ${escapeHtml(entry.time)}` : ""}</span>
      </div>
      <div class="nutrition-entry-macros" aria-label="КБЖУ продукта">
        <span>${formatNutritionValue(entry.calories, " ккал")}</span>
        <span>Б ${formatNutritionValue(entry.protein, " г")}</span>
        <span>Ж ${formatNutritionValue(entry.fat, " г")}</span>
        <span>У ${formatNutritionValue(entry.carbs, " г")}</span>
      </div>
      <button class="nutrition-delete" type="button" data-nutrition-delete="${entry.id}" aria-label="Удалить ${escapeHtml(entry.name)}">Удалить</button>
    </article>
  `;
}

function renderNutritionModule() {
  const entries = nutritionEntriesForDate();
  const totals = nutritionTotals(entries);
  return `
    <section class="panel initiative-module nutrition-dashboard" aria-label="КБЖУ">
      <div class="module-header">
        <div>
          <h3>КБЖУ</h3>
          <p class="muted">Фиксируй продукты и сразу смотри итог за сегодня.</p>
        </div>
        <span class="tag">сегодня</span>
      </div>

      <section class="nutrition-summary" aria-label="Итог КБЖУ за сегодня">
        ${renderNutritionSummaryValue("Калории", totals.calories, " ккал", true)}
        ${renderNutritionSummaryValue("Белки", totals.protein, " г")}
        ${renderNutritionSummaryValue("Жиры", totals.fat, " г")}
        ${renderNutritionSummaryValue("Углеводы", totals.carbs, " г")}
      </section>

      <section class="nutrition-entry-panel">
        <div class="subhead">
          <div>
            <h3>Добавить продукт</h3>
            <span class="muted">КБЖУ указывается на 100 г.</span>
          </div>
        </div>
        <form class="nutrition-entry-form" id="nutritionEntryForm">
          <label class="nutrition-product-field">
            <span>Продукт</span>
            <input name="name" autocomplete="off" placeholder="Например: омлет" required>
          </label>
          <label>
            <span>Вес, г</span>
            <input name="weight" type="number" min="1" step="1" inputmode="decimal" placeholder="0" required>
          </label>
          <label>
            <span>Ккал</span>
            <input name="caloriesPer100" type="number" min="0" step="0.1" inputmode="decimal" placeholder="0" required>
          </label>
          <label>
            <span>Белки</span>
            <input name="proteinPer100" type="number" min="0" step="0.1" inputmode="decimal" placeholder="0" required>
          </label>
          <label>
            <span>Жиры</span>
            <input name="fatPer100" type="number" min="0" step="0.1" inputmode="decimal" placeholder="0" required>
          </label>
          <label>
            <span>Углеводы</span>
            <input name="carbsPer100" type="number" min="0" step="0.1" inputmode="decimal" placeholder="0" required>
          </label>
          <label class="nutrition-date-field">
            <span>Дата</span>
            <input name="date" type="date" value="${dateKey(getToday())}" required>
          </label>
          <label>
            <span>Время</span>
            <input name="time" type="time">
          </label>
          <output class="nutrition-preview" id="nutritionPreview" aria-live="polite">Укажи вес и КБЖУ на 100 г.</output>
          <button class="primary-action" type="submit">Добавить</button>
        </form>
      </section>

      <section class="nutrition-log">
        <div class="subhead">
          <div>
            <h3>Сегодня</h3>
            <span class="muted">${entries.length ? `Продуктов: ${entries.length}` : "Записей пока нет."}</span>
          </div>
        </div>
        <div class="nutrition-entry-list">
          ${entries.length ? entries.map(renderNutritionEntry).join("") : '<p class="empty-copy">Добавь первый продукт, чтобы увидеть дневной итог.</p>'}
        </div>
      </section>
    </section>
  `;
}

function bindNutritionModule() {
  const form = qs("#nutritionEntryForm");
  if (!form) return;

  const preview = qs("#nutritionPreview");
  const updatePreview = () => {
    const values = calculateNutritionValues(Object.fromEntries(new FormData(form).entries()));
    preview.innerHTML = values.weight
      ? `За порцию: <strong>${formatNutritionValue(values.calories, " ккал")}</strong> · Б ${formatNutritionValue(values.protein, " г")} · Ж ${formatNutritionValue(values.fat, " г")} · У ${formatNutritionValue(values.carbs, " г")}`
      : "Укажи вес и КБЖУ на 100 г.";
  };

  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || "").trim();
    const values = calculateNutritionValues(data);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(data.date || "") ? data.date : dateKey(getToday());
    const time = /^\d{2}:\d{2}$/.test(data.time || "") ? data.time : "";
    if (!name || values.weight <= 0) return;

    const entryId = uid("nutrition");
    state.nutrition.entries.unshift({
      id: entryId,
      name,
      date,
      time,
      ...values
    });
    state.goals.unshift({
      id: uid("goal"),
      title: `Приём пищи: ${name}`,
      areaId: "sila",
      initiativeId: nutritionInitiativeId,
      date,
      time: time || "без времени",
      endTime: "",
      done: true,
      completedDate: date,
      nutritionEntryId: entryId
    });
    refreshGoalViews();
  });

  qsa("[data-nutrition-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const entryId = button.dataset.nutritionDelete;
      state.nutrition.entries = state.nutrition.entries.filter((entry) => entry.id !== entryId);
      state.goals = state.goals.filter((goal) => goal.nutritionEntryId !== entryId);
      refreshGoalViews();
    });
  });
}

function financeTransactionsForMonth() {
  return state.finance.transactions.filter((transaction) => transaction.date?.startsWith(state.finance.selectedMonth));
}

function financePlanCategories() {
  return financeCategoryGroups
    .filter((group) => group.type === "payment" || group.type === "expense")
    .flatMap((group) => group.items.map((name) => ({ name, type: group.type, group: group.label })));
}

function renderFinanceCategoryOptions(type, selectedCategory = "") {
  const group = financeCategoryGroups.find((item) => item.type === type) || financeCategoryGroups.find((item) => item.type === "expense");
  return group.items
    .map((item, index) => `<option value="${item}"${selectedCategory ? (item === selectedCategory ? " selected" : "") : index === 0 ? " selected" : ""}>${item}</option>`)
    .join("");
}

function financeBudgetKey(category) {
  return `${state.finance.selectedMonth}:${category}`;
}

function financeBudgetFor(category) {
  return Number(state.finance.budgets[financeBudgetKey(category)] || 0);
}

function financeSummary() {
  const transactions = financeTransactionsForMonth();
  const totals = { income: 0, payment: 0, expense: 0, debt: 0, capital: 0 };
  const actualByCategory = new Map();
  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount || 0);
    if (transaction.type in totals) totals[transaction.type] += amount;
    actualByCategory.set(transaction.category, (actualByCategory.get(transaction.category) || 0) + amount);
  });
  const income = totals.income;
  const payments = totals.payment;
  const expenses = totals.expense;
  const debts = totals.debt;
  const capital = totals.capital;
  const outgoing = payments + expenses + debts + capital;
  const planned = financePlanCategories().reduce((sum, category) => sum + financeBudgetFor(category.name), 0);
  return { transactions, actualByCategory, income, payments, expenses, debts, capital, outgoing, planned, balance: income - outgoing };
}

function renderFinancePlanRow(category, actualByCategory) {
  const planned = financeBudgetFor(category.name);
  const actual = actualByCategory.get(category.name) || 0;
  const remainder = planned - actual;
  const hasPlan = planned > 0;
  const progress = hasPlan ? Math.min(100, Math.round((actual / planned) * 100)) : 0;
  return `
    <tr>
      <td><span class="finance-category-dot finance-category-${category.type}"></span>${category.name}</td>
      <td><input class="finance-budget-input" data-finance-budget="${escapeHtml(category.name)}" type="number" min="0" step="100" value="${planned || ""}" placeholder="0" aria-label="План для категории ${escapeHtml(category.name)}"></td>
      <td class="finance-number">${formatMoney(actual)}</td>
      <td class="finance-number ${hasPlan && remainder < 0 ? "is-over" : ""}">${hasPlan ? formatMoney(remainder) : "—"}</td>
      <td><span class="finance-progress" aria-label="${hasPlan ? `${progress}% плана` : "План не задан"}"><i style="width:${progress}%"></i></span></td>
    </tr>
  `;
}

function renderFinanceChart(summary) {
  const rows = financePlanCategories()
    .map((category) => ({ ...category, actual: summary.actualByCategory.get(category.name) || 0 }))
    .filter((category) => category.actual > 0)
    .sort((first, second) => second.actual - first.actual);
  if (!rows.length) {
    return `<div class="finance-chart-empty">Когда появятся расходы, здесь будет видно их распределение по категориям.</div>`;
  }
  const max = Math.max(...rows.map((row) => row.actual), 1);
  return `
    <div class="finance-chart-bars">
      ${rows
        .map(
          (row) => `
            <div class="finance-chart-row">
              <span>${row.name}</span>
              <div class="finance-chart-track"><i style="width:${Math.max(8, Math.round((row.actual / max) * 100))}%"></i></div>
              <strong>${formatMoney(row.actual)}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderFinanceTransaction(transaction) {
  const income = transaction.type === "income";
  return `
    <tr>
      <td>${formatDateKey(transaction.date)}</td>
      <td><span class="finance-operation-type ${income ? "is-income" : "is-expense"}">${financeTypeLabels[transaction.type] || "Операция"}</span></td>
      <td>${escapeHtml(transaction.category || "Без категории")}${transaction.note ? `<small>${escapeHtml(transaction.note)}</small>` : ""}</td>
      <td class="finance-number ${income ? "is-income" : "is-expense"}">${income ? "+" : "−"}${formatMoney(transaction.amount)}</td>
      <td><button class="finance-delete" type="button" data-finance-delete="${transaction.id}">Удалить</button></td>
    </tr>
  `;
}

function renderFinanceModule() {
  const summary = financeSummary();
  const defaultEntryDate = dateKey(getToday()).startsWith(state.finance.selectedMonth) ? dateKey(getToday()) : `${state.finance.selectedMonth}-01`;
  return `
    <section class="panel initiative-module finance-dashboard" aria-label="Финансовый планер">
      <div class="module-header finance-module-header">
        <div>
          <h3>Финансовый планер</h3>
          <p class="muted">Поступления, расходы, план и фактическое движение средств.</p>
        </div>
        <div class="finance-period-control">
          <label for="financeMonth">Период</label>
          <input id="financeMonth" type="month" value="${state.finance.selectedMonth}">
        </div>
      </div>

      <section class="finance-summary" aria-label="Сводка за месяц">
        <div class="finance-summary-item finance-balance"><span>Остаток за период</span><strong class="${summary.balance < 0 ? "is-over" : ""}">${formatMoney(summary.balance)}</strong></div>
        <div class="finance-summary-item"><span>Поступления</span><strong class="is-income">${formatMoney(summary.income)}</strong></div>
        <div class="finance-summary-item"><span>Исходящие</span><strong>${formatMoney(summary.outgoing)}</strong></div>
        <div class="finance-summary-item"><span>Запланировано</span><strong>${formatMoney(summary.planned)}</strong></div>
      </section>

      <section class="finance-entry-panel">
        <div class="subhead"><h3>Новая операция</h3></div>
        <form class="finance-entry-form" id="financeEntryForm">
          <label><span>Тип</span><select name="type"><option value="income">Поступление</option><option value="payment">Платёж</option><option value="expense" selected>Расход</option><option value="debt">Долг</option><option value="capital">Капитал</option></select></label>
          <label><span>Категория</span><select name="category">${renderFinanceCategoryOptions("expense")}</select></label>
          <label><span>Сумма</span><input name="amount" type="number" min="1" step="1" inputmode="decimal" placeholder="0" required></label>
          <label><span>Дата</span><input name="date" type="date" value="${defaultEntryDate}" required></label>
          <label class="finance-note-field"><span>Комментарий</span><input name="note" placeholder="Например: ресторан, счёт или источник"></label>
          <button class="primary-action" type="submit">Добавить операцию</button>
        </form>
      </section>

      <div class="finance-board">
        <section class="finance-section finance-plan-section">
          <div class="subhead"><div><h3>План и факт</h3><span class="muted">Платежи и расходы за ${formatFinanceMonth(state.finance.selectedMonth).toLowerCase()}</span></div></div>
          <div class="finance-table-scroll">
            <table class="finance-table">
              <thead><tr><th>Категория</th><th>План</th><th>Факт</th><th>Остаток</th><th></th></tr></thead>
              <tbody>${financePlanCategories().map((category) => renderFinancePlanRow(category, summary.actualByCategory)).join("")}</tbody>
            </table>
          </div>
        </section>

        <section class="finance-section finance-chart-section">
          <div class="subhead"><div><h3>Структура расходов</h3><span class="muted">По фактическим операциям</span></div></div>
          ${renderFinanceChart(summary)}
        </section>
      </div>

      <section class="finance-section finance-transactions-section">
        <div class="subhead"><div><h3>Операции</h3><span class="muted">${summary.transactions.length ? `${summary.transactions.length} за выбранный период` : "Пока без операций"}</span></div></div>
        <div class="finance-table-scroll">
          ${
            summary.transactions.length
              ? `<table class="finance-table finance-transactions-table"><thead><tr><th>Дата</th><th>Тип</th><th>Категория</th><th>Сумма</th><th></th></tr></thead><tbody>${summary.transactions.map(renderFinanceTransaction).join("")}</tbody></table>`
              : `<div class="empty-inline">Добавь поступление или расход. Финансовая картина за ${formatFinanceMonth(state.finance.selectedMonth).toLowerCase()} появится здесь.</div>`
          }
        </div>
      </section>
    </section>
  `;
}

function bindFinanceModule() {
  const monthInput = qs("#financeMonth");
  if (monthInput) {
    monthInput.addEventListener("change", () => {
      state.finance.selectedMonth = monthInput.value || dateKey(getToday()).slice(0, 7);
      saveUserData();
      renderInitiatives();
    });
  }

  qsa("[data-finance-budget]").forEach((input) => {
    input.addEventListener("change", () => {
      const amount = Math.max(0, Number(input.value) || 0);
      state.finance.budgets[financeBudgetKey(input.dataset.financeBudget)] = amount;
      saveUserData();
      renderInitiatives();
    });
  });

  const form = qs("#financeEntryForm");
  if (form) {
    const typeSelect = form.elements.type;
    const categorySelect = form.elements.category;
    typeSelect.addEventListener("change", () => {
      categorySelect.innerHTML = renderFinanceCategoryOptions(typeSelect.value);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const amount = Number(data.amount);
      if (!Number.isFinite(amount) || amount <= 0) return;
      const transaction = {
        id: `finance-transaction-${Date.now()}`,
        type: data.type,
        category: data.category,
        amount,
        date: data.date,
        note: data.note?.trim() || "",
        source: "ручной ввод"
      };
      state.finance.transactions.unshift(transaction);
      saveUserData();
      renderInitiatives();
      qs("#parsedOutput").innerHTML = `<div class="parsed-chip">Финансы: операция «${financeTypeLabels[transaction.type].toLowerCase()}» на ${formatMoney(transaction.amount)} добавлена.</div>`;
    });
  }

  qsa("[data-finance-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.finance.transactions = state.finance.transactions.filter((transaction) => transaction.id !== button.dataset.financeDelete);
      saveUserData();
      renderInitiatives();
    });
  });
}

function renderDirectionGoalBlock(block, extraClass = "") {
  const area = directionAreaForBlock(block);
  const goals = area ? directionGoalsForBlock(area, block) : [];
  const progress = goals.length ? Math.round((goals.filter((goal) => goal.done).length / goals.length) * 100) : 0;
  return `
    <section class="direction-goal-block ${extraClass}">
      <div class="direction-goal-heading">
        <div class="direction-goal-title"><h3>${block.name}</h3></div>
        <button class="goal-expand-button" type="button" data-goal-expand="${block.id}" aria-expanded="false" aria-label="Открыть список целей">
          <span class="goal-expand-chevron">⌄</span>
        </button>
      </div>
      <div class="direction-goal-progress"><span style="width:${progress}%"></span></div>
      <div class="direction-goal-items" data-goal-items="${block.id}" hidden>
        ${goals.map((goal) => `
          <div class="direction-goal-item goal-row-open ${goal.done ? "done" : ""}" role="listitem" tabindex="0" data-open-goal="${goal.id}">
            <button class="goal-toggle ${goal.done ? "done" : ""}" type="button" data-entity-goal-toggle="${goal.id}" aria-label="${goal.done ? "Вернуть цель" : "Закрыть цель"}">${goal.done ? "✓" : ""}</button>
            <div class="goal-item-copy">
              <span class="initiative-goal-title">${goal.title}</span>
              <span class="goal-item-scope">${area?.name || ""}${goal.scope ? ` · ${goal.scope}` : ""}</span>
            </div>
          </div>`).join("") || `<div class="empty-inline">Целей пока нет.</div>`}
      </div>
    </section>`;
}

function thoughtScopeKey(scope = {}) {
  if (scope.activityId) return `activity:${scope.activityId}`;
  if (scope.initiativeId) return `initiative:${scope.initiativeId}`;
  if (scope.areaId) return `direction:${scope.areaId}`;
  return "global";
}

function thoughtsForScope(scope = {}) {
  const notes = state.notes.filter((note) => {
    if (scope.activityId) return note.activityId === scope.activityId;
    if (scope.initiativeId) return note.initiativeId === scope.initiativeId;
    if (scope.areaId) return note.areaId === scope.areaId;
    return true;
  });
  return notes.sort((first, second) => String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
}

function thoughtScopeLabel(note) {
  const area = note.areaId ? findArea(note.areaId) : null;
  const initiative = note.initiativeId ? taxonomyInitiativeLocation(note.initiativeId)?.initiative : null;
  const activity = note.activityId ? taxonomyActivityLocation(note.activityId)?.activity : null;
  return [area?.name, initiative?.name, activity?.name].filter(Boolean).join(" / ");
}

function renderThoughtRows(notes, showScope = false) {
  if (!notes.length) return "";
  return `
    <div class="thought-list">
      ${notes.map((note) => {
        const scopeLabel = showScope ? thoughtScopeLabel(note) : "";
        return `
          <article class="thought-item thought-row-open" data-open-note="${note.id}" tabindex="0">
            <p>${escapeHtml(note.text)}</p>
            <div class="thought-item-meta">
              ${scopeLabel ? `<span>${escapeHtml(scopeLabel)}</span>` : `<span></span>`}
              <button class="icon-button thought-delete" type="button" data-thought-delete="${note.id}" aria-label="Удалить заметку" title="Удалить">×</button>
            </div>
          </article>`;
      }).join("")}
    </div>`;
}

function renderThoughtsSection(area, initiative = null, activity = null, variant = "entity") {
  const scope = {
    areaId: area?.id || null,
    initiativeId: initiative?.id || null,
    activityId: activity?.id || null
  };
  const scopeKey = thoughtScopeKey(scope);
  const notes = thoughtsForScope(scope);
  const expanded = state.openThoughtScopes.has(scopeKey);
  const visibleNotes = expanded ? notes : notes.slice(0, 3);
  return `
    <section class="entity-thoughts ${variant === "direction" ? "direction-thoughts" : ""}" data-thoughts-section="${scopeKey}">
      <div class="thoughts-header">
        <div><h3>Мысли</h3><span>${notes.length}</span></div>
        ${notes.length > 3 ? `<button class="secondary-action small" type="button" data-thoughts-toggle="${scopeKey}" aria-expanded="${expanded}">${expanded ? "Свернуть" : "Все мысли"}</button>` : ""}
      </div>
      ${renderThoughtRows(visibleNotes)}
      <form class="thought-inline-form" data-thought-form data-thought-scope="${scopeKey}" data-area-id="${scope.areaId || ""}" data-initiative-id="${scope.initiativeId || ""}" data-activity-id="${scope.activityId || ""}">
        <textarea name="thought" rows="1" aria-label="Новая мысль" placeholder="Новая мысль" required></textarea>
        <button class="icon-button" type="submit" aria-label="Добавить мысль" title="Добавить">+</button>
      </form>
    </section>`;
}

function renderDirectionDashboard(area) {
  const delegationBlock = area.directionBlocks.find((block) => block.name === "ДЕЛЕГИРОВАНИЕ");
  const strategicBlocks = area.directionBlocks.filter((block) => block !== delegationBlock);
  return `
    <section class="panel direction-dashboard" style="--direction-color:${area.color}">
      <div class="panel-header">
        <div>
          <h2><button class="taxonomy-inline-name taxonomy-title-name" type="button" data-taxonomy-rename="direction" data-entity-id="${area.id}" title="Изменить название">${escapeHtml(area.name)}</button></h2>
        </div>
      </div>

      <div class="direction-block-list">
        ${strategicBlocks.map((block) => renderDirectionGoalBlock(block)).join("")}
        ${renderThoughtsSection(area, null, null, "direction")}
      </div>

      ${
        delegationBlock
          ? `
            <section class="direction-delegation-panel">
              ${renderDirectionGoalBlock(delegationBlock, "delegation-goal-block")}
            </section>
          `
          : ""
      }
    </section>
  `;
}

function entityGoals(initiative, activity = null) {
  const savedGoals = state.goals.filter(
    (goal) =>
      goal.initiativeId === initiative.id &&
      (activity ? goal.activityId === activity.id : !goal.activityId)
  );
  const seededGoals = activity ? activity.goals : initiative.goals;
  return [...(seededGoals || []), ...savedGoals];
}

function scheduledGoalTime(goal) {
  if (!goalHasScheduledTime(goal)) return "";
  const range = goal.endTime ? `${goal.time}-${goal.endTime}` : goal.time;
  return `${formatDateKey(goal.date)}, ${range}`;
}

function goalTimeRange(goal) {
  if (!goalHasScheduledTime(goal)) return "";
  return goal.endTime ? `${goal.time}-${goal.endTime}` : goal.time;
}

function goalDateLabel(goal) {
  return /^\d{4}-\d{2}-\d{2}$/.test(goal?.date || "") ? goal.date.split("-").reverse().join(".") : "-";
}

function renderEntityGoals(goals) {
  const activeGoals = goals.filter((goal) => !goal.done);
  if (!activeGoals.length) return `<div class="empty-inline">Активных целей пока нет.</div>`;

  return `
    <div class="initiative-goal-table" role="list">
      <div class="initiative-goal-table-head" aria-hidden="true">
        <span>Цель</span>
        <span>Дата</span>
        <span>Время</span>
      </div>
      ${activeGoals
        .map(
          (goal) => `
            <div class="initiative-goal goal-row-open" role="listitem" tabindex="0" data-open-goal="${goal.id || ""}">
              ${goal.id ? `<button class="goal-toggle" type="button" data-entity-goal-toggle="${goal.id}" aria-label="Закрыть цель ${escapeHtml(goal.title)}"></button>` : `<span class="checkbox"></span>`}
              <span class="initiative-goal-title">${escapeHtml(goal.title)}</span>
              <time class="initiative-goal-date">${goalDateLabel(goal)}</time>
              <time class="initiative-goal-time">${goalTimeRange(goal) || "-"}</time>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderGoalWorkspace(goal, area) {
  if (!goal) return "";
  const checklist = goalChecklist(goal);
  const initiative = goal.initiativeId ? taxonomyInitiativeLocation(goal.initiativeId)?.initiative : null;
  const activity = goal.activityId ? taxonomyActivityLocation(goal.activityId)?.activity : null;
  const scope = [area?.name, initiative?.name, activity?.name].filter(Boolean).join(" / ");
  return `
    <article class="object-editor goal-workspace" id="goalWorkspace" aria-labelledby="goalWorkspaceTitle" style="--module-color:${area?.color || "#a65d70"}">
      <header class="object-editor-toolbar">
        <button class="goal-toggle ${goal.done ? "done" : ""}" type="button" data-entity-goal-toggle="${goal.id}" aria-label="${goal.done ? "Вернуть цель" : "Закрыть цель"}">${goal.done ? "✓" : ""}</button>
        <span>Цель</span>
        <button class="icon-button" type="button" data-close-goal-workspace aria-label="Закрыть редактор">×</button>
      </header>
      <div class="object-editor-body">
        <p class="object-editor-context">${escapeHtml(scope || "Без направления")}</p>
        <textarea class="object-title-editor" id="goalTitleEditor" rows="1" aria-label="Название цели">${escapeHtml(goal.title)}</textarea>
        <div class="object-schedule-editor">
          <label><span>Дата</span><input id="goalDateEditor" type="date" value="${escapeHtml(goal.date || "")}"></label>
          <label><span>Начало</span><input id="goalTimeEditor" type="time" value="${goalHasScheduledTime(goal) ? escapeHtml(goal.time) : ""}"></label>
          <label><span>Окончание</span><input id="goalEndTimeEditor" type="time" value="${escapeHtml(goal.endTime || "")}"></label>
        </div>
        <textarea class="goal-description" id="goalDescription" rows="1" placeholder="Описание">${escapeHtml(goal.description || "")}</textarea>
        <section class="goal-checklist-section">
          <div class="goal-checklist" id="goalChecklist">
            ${checklist.length
              ? checklist.map((item) => `
                  <label class="goal-checklist-item ${item.done ? "done" : ""}">
                    <input type="checkbox" data-goal-check-item="${item.id}" ${item.done ? "checked" : ""}>
                    <span>${escapeHtml(item.title)}</span>
                  </label>`).join("")
              : ""}
          </div>
          <form class="goal-checklist-form" id="goalChecklistForm">
            <input name="checkItem" type="text" autocomplete="off" placeholder="Новый пункт">
            <button class="secondary-action small" type="submit">+ Пункт</button>
          </form>
        </section>
      </div>
    </article>
  `;
}

function renderNoteWorkspace(note) {
  const scope = thoughtScopeLabel(note);
  return `
    <article class="object-editor note-workspace" id="noteWorkspace" aria-labelledby="noteWorkspaceTitle">
      <header class="object-editor-toolbar">
        <span>Заметка</span>
        <button class="icon-button" type="button" data-close-note-workspace aria-label="Закрыть редактор">×</button>
      </header>
      <div class="object-editor-body">
        <p class="object-editor-context">${escapeHtml(scope || "Без направления")}</p>
        <h2 class="sr-only" id="noteWorkspaceTitle">Редактор заметки</h2>
        <textarea class="note-content-editor" id="noteContentEditor" aria-label="Текст заметки" placeholder="Запиши мысль...">${escapeHtml(note.text)}</textarea>
        <button class="object-delete-button" type="button" data-delete-open-note="${note.id}">Удалить заметку</button>
      </div>
    </article>`;
}

function renderArchivedGoalsPanel(area, entityName, goals) {
  const archivedGoals = goals.filter((goal) => goal.done);
  return `
    <section class="panel initiative-module archive-goals-module" id="archiveGoalsPanel" style="--module-color:${area.color}" hidden>
      <div class="module-header">
        <div>
          <h3>Архивные цели</h3>
          <p class="muted">${escapeHtml(entityName)}</p>
        </div>
      </div>
      <div class="archive-goals-list">
        ${
          archivedGoals.length
            ? archivedGoals
                .map(
                  (goal) => `
                    <div class="archive-goal-row">
                      ${goal.id ? `<button class="goal-toggle archive-goal-check" type="button" data-entity-goal-toggle="${goal.id}" aria-label="Вернуть цель ${escapeHtml(goal.title)}">✓</button>` : `<span class="archive-goal-check">✓</span>`}
                      <span class="archive-goal-title">${escapeHtml(goal.title)}</span>
                      ${scheduledGoalTime(goal) ? `<time>${scheduledGoalTime(goal)}</time>` : ""}
                    </div>
                  `
                )
                .join("")
            : `<div class="empty-inline">Закрытых целей пока нет.</div>`
        }
      </div>
    </section>
  `;
}

function renderEntityGoalForm(area, initiative, activity = null) {
  return `
    <form class="entity-goal-form" id="entityGoalForm" data-area-id="${area.id}" data-initiative-id="${initiative.id}" ${activity ? `data-activity-id="${activity.id}"` : ""} hidden>
      <label class="entity-goal-title-field">
        <span>Цель</span>
        <input name="title" type="text" required placeholder="Сформулируй цель">
      </label>
      <label>
        <span>Дата</span>
        <input name="date" type="date" value="${dateKey(getToday())}">
      </label>
      <div class="entity-goal-time-range">
        <span>Время</span>
        <div>
          <label><span>С</span><input name="time" type="time" aria-label="Начало"></label>
          <i>-</i>
          <label><span>До</span><input name="endTime" type="time" aria-label="Конец"></label>
        </div>
      </div>
      <button class="primary-action small" type="submit">Добавить</button>
    </form>
  `;
}

function taxonomyRenameButton(kind, entity, extraClass = "") {
  return `<button class="taxonomy-inline-name ${extraClass}" type="button" data-taxonomy-rename="${kind}" data-entity-id="${entity.id}" title="Изменить название">${escapeHtml(entity.name)}</button>`;
}

function renderEntityCard(area, initiative, activity = null) {
  const entity = activity || initiative;
  const goals = entityGoals(initiative, activity);
  const todayKey = dateKey(getToday());
  const activeToday = goals.filter((goal) => !goal.done && goal.date === todayKey);
  return `
    <section class="panel initiative-core-card">
      <div class="panel-header">
        <div>
          <p class="eyebrow taxonomy-breadcrumb">
            ${taxonomyRenameButton("direction", area)}
            ${activity ? `<span>/</span>${taxonomyRenameButton("initiative", initiative)}` : ""}
          </p>
          <h2>${taxonomyRenameButton(activity ? "activity" : "initiative", entity, "taxonomy-title-name")}</h2>
        </div>
        <div class="entity-header-actions">
          <span class="entity-today-count"><strong>${activeToday.length}</strong> сегодня</span>
          <button class="secondary-action small" type="button" data-toggle-goal-archive aria-expanded="false">Архив</button>
        </div>
      </div>
      <div class="initiative-detail-grid">
        <section>
          <div class="subhead">
            <h3>Цели</h3>
            <button class="secondary-action small" type="button" data-show-entity-goal-form>+ Цель</button>
          </div>
          ${renderEntityGoalForm(area, initiative, activity)}
          <div class="initiative-goals detail-goals">
            ${renderEntityGoals(goals)}
          </div>
        </section>
      </div>
      ${renderThoughtsSection(area, initiative, activity)}
    </section>
    ${renderArchivedGoalsPanel(area, entity.name, goals)}
  `;
}

function renderQuickNotes() {
  const host = qs("#quickNotesList");
  const toggle = qs("#toggleQuickNotes");
  const count = qs("#quickNotesCount");
  if (!host || !toggle || !count) return;
  const notes = thoughtsForScope();
  const expanded = state.openThoughtScopes.has("global");
  count.textContent = String(notes.length);
  toggle.firstChild.textContent = expanded ? "Скрыть " : "Все ";
  toggle.setAttribute("aria-expanded", String(expanded));
  host.hidden = !expanded;
  host.innerHTML = expanded ? renderThoughtRows(notes, true) : "";
}

function refreshThoughtViews() {
  saveUserData();
  renderQuickNotes();
  if (state.activeView === "initiatives") renderInitiatives();
  renderGoalWorkspaceHost();
}

function bindThoughtControls(root = document) {
  if (!root || root.dataset.thoughtControlsBound === "true") return;
  root.dataset.thoughtControlsBound = "true";

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-thought-form]");
    if (!form || !root.contains(form)) return;
    event.preventDefault();
    const text = String(new FormData(form).get("thought") || "").trim();
    if (!text) return;
    state.notes.unshift({
      id: uid("note"),
      text,
      createdAt: new Date().toISOString(),
      areaId: form.dataset.areaId || null,
      initiativeId: form.dataset.initiativeId || null,
      activityId: form.dataset.activityId || null
    });
    form.reset();
    refreshThoughtViews();
  });

  root.addEventListener("keydown", (event) => {
    const input = event.target.closest("[data-thought-form] textarea");
    if (!input || event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    input.closest("form").requestSubmit();
  });

  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-thoughts-toggle]");
    if (toggle && root.contains(toggle)) {
      const scopeKey = toggle.dataset.thoughtsToggle;
      if (state.openThoughtScopes.has(scopeKey)) state.openThoughtScopes.delete(scopeKey);
      else state.openThoughtScopes.add(scopeKey);
      if (scopeKey === "global") renderQuickNotes();
      else renderInitiatives();
      return;
    }

    const deleteButton = event.target.closest("[data-thought-delete]");
    if (deleteButton && root.contains(deleteButton)) {
      event.stopPropagation();
      state.notes = state.notes.filter((note) => note.id !== deleteButton.dataset.thoughtDelete);
      if (state.openNoteId === deleteButton.dataset.thoughtDelete) state.openNoteId = null;
      refreshThoughtViews();
      return;
    }

    const thought = event.target.closest("[data-open-note]");
    if (thought && root.contains(thought)) openNoteWorkspace(thought.dataset.openNote);
  });

  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const thought = event.target.closest("[data-open-note]");
    if (!thought || event.target.closest("button, textarea, input")) return;
    event.preventDefault();
    openNoteWorkspace(thought.dataset.openNote);
  });
}

function bindEntityGoalControls(root = document) {
  const select = (selector) => root.querySelector(selector);
  const selectAll = (selector) => [...root.querySelectorAll(selector)];
  const form = select("#entityGoalForm");
  const showFormButton = select("[data-show-entity-goal-form]");
  const archiveButton = select("[data-toggle-goal-archive]");
  const archivePanel = select("#archiveGoalsPanel");

  bindTaxonomyNameEditors(root);
  bindThoughtControls(root);

  showFormButton?.addEventListener("click", () => {
    if (!form) return;
    form.hidden = false;
    showFormButton.hidden = true;
    form.elements.title.focus();
  });

  archiveButton?.addEventListener("click", () => {
    if (!archivePanel) return;
    const nextExpanded = archivePanel.hidden;
    archivePanel.hidden = !nextExpanded;
    archiveButton.setAttribute("aria-expanded", String(nextExpanded));
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    if (!title) return;
    const time = String(data.get("time") || "");
    const endTime = String(data.get("endTime") || "");
    if ((time && !endTime) || (!time && endTime)) {
      form.elements[time ? "endTime" : "time"].focus();
      return;
    }
    state.goals.unshift({
      id: `goal-${Date.now()}`,
      title,
      areaId: form.dataset.areaId,
      initiativeId: form.dataset.initiativeId,
      activityId: form.dataset.activityId || null,
      date: String(data.get("date") || ""),
      time: time || "без времени",
      endTime: endTime || "",
      energy: "средняя",
      type: "single",
      done: false,
      completedDate: null
    });
    refreshGoalViews();
  });

  const closeGoalWorkspace = () => {
    state.openGoalId = null;
    refreshGoalViews();
  };
  selectAll("[data-close-goal-workspace]").forEach((button) => button.addEventListener("click", closeGoalWorkspace));

  const workspaceGoal = state.goals.find((goal) => goal.id === state.openGoalId);
  const titleEditor = select("#goalTitleEditor");
  const dateEditor = select("#goalDateEditor");
  const timeEditor = select("#goalTimeEditor");
  const endTimeEditor = select("#goalEndTimeEditor");
  const description = select("#goalDescription");
  let descriptionResizeFrame = 0;
  const resizeDescription = () => {
    if (!description) return;
    cancelAnimationFrame(descriptionResizeFrame);
    descriptionResizeFrame = requestAnimationFrame(() => {
      description.style.height = "auto";
      description.style.height = `${Math.max(40, description.scrollHeight)}px`;
    });
  };
  resizeDescription();
  if (titleEditor) {
    const resizeTitle = () => {
      titleEditor.style.height = "auto";
      titleEditor.style.height = `${Math.max(44, titleEditor.scrollHeight)}px`;
    };
    resizeTitle();
    titleEditor.addEventListener("input", () => {
      if (!workspaceGoal) return;
      workspaceGoal.title = titleEditor.value;
      scheduleUserDataSave();
      resizeTitle();
    });
  }
  dateEditor?.addEventListener("change", () => {
    if (!workspaceGoal) return;
    workspaceGoal.date = dateEditor.value;
    scheduleUserDataSave();
  });
  timeEditor?.addEventListener("change", () => {
    if (!workspaceGoal) return;
    workspaceGoal.time = timeEditor.value || "без времени";
    scheduleUserDataSave();
  });
  endTimeEditor?.addEventListener("change", () => {
    if (!workspaceGoal) return;
    workspaceGoal.endTime = endTimeEditor.value;
    scheduleUserDataSave();
  });
  description?.addEventListener("input", (event) => {
    if (!workspaceGoal) return;
    workspaceGoal.description = event.target.value;
    scheduleUserDataSave();
    resizeDescription();
  });

  select("#goalChecklistForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!workspaceGoal) return;
    const title = String(new FormData(event.currentTarget).get("checkItem") || "").trim();
    if (!title) return;
    workspaceGoal.checklist = [...goalChecklist(workspaceGoal), { id: "check-" + Date.now(), title, done: false }];
    refreshGoalViews();
  });

  selectAll("[data-goal-check-item]").forEach((input) => {
    input.addEventListener("change", () => {
      if (!workspaceGoal) return;
      const item = goalChecklist(workspaceGoal).find((entry) => entry.id === input.dataset.goalCheckItem);
      if (!item) return;
      item.done = input.checked;
      const checklist = goalChecklist(workspaceGoal);
      if (checklist.length && checklist.every((entry) => entry.done)) {
        setGoalCompletion(workspaceGoal, true);
      } else if (workspaceGoal.done) {
        setGoalCompletion(workspaceGoal, false);
      }
      refreshGoalViews();
    });
  });
}

function renderInitiatives() {
  const detail = qs("#initiativeDetail");
  if (!state.selectedInitiativeId) {
    const area = state.selectedAreaId ? findArea(state.selectedAreaId) : null;
    if (area) {
      detail.innerHTML = renderDirectionDashboard(area);
      bindDirectionGoalToggles();
      bindTaxonomyNameEditors(detail);
      bindThoughtControls(detail);
      return;
    }
    detail.innerHTML = `
      <div class="panel empty-state">
        <div class="empty-icon">Radiance</div>
        <p class="eyebrow">Направления</p>
        <h2>Выбери направление слева</h2>
        <p class="muted">После выбора направления здесь появится его дашборд, а ниже в меню слева откроется список рабочих инициатив.</p>
      </div>
    `;
    return;
  }

  const selected = findInitiative(state.selectedInitiativeId);
  if (!selected) return;

  const initiative = selected;
  const area = selected.area;

  if (state.selectedActivityId) {
    const activity = findActivity(state.selectedActivityId);
    if (!activity) return;
    renderActivityDetail(activity);
    return;
  }

  qs("#initiativeDetail").innerHTML = `
    ${renderEntityCard(area, initiative)}
    ${initiative.id === nutritionInitiativeId ? renderNutritionModule() : ""}
    ${initiative.id === networkingInitiativeId ? renderNetworkingModule() : ""}
    ${initiative.id === financialControlInitiativeId ? renderFinanceModule() : ""}
    ${initiative.id === familyInitiativeId ? renderFamilyTreeModule() : ""}
  `;
  if (initiative.id === nutritionInitiativeId) bindNutritionModule();
  if (initiative.id === networkingInitiativeId) bindNetworkingForm();
  if (initiative.id === financialControlInitiativeId) bindFinanceModule();
  if (initiative.id === familyInitiativeId) bindFamilyTreeModule();
  bindEntityGoalControls(qs("#initiativeDetail"));
}

function bindDirectionGoalToggles() {
  qsa(".goal-expand-button").forEach((button) => {
    button.addEventListener("click", () => {
      const blockId = button.dataset.goalBlock || button.dataset.goalExpand;
      const items = qs(`[data-goal-items="${blockId}"]`);
      if (!items) return;
      const isExpanded = !items.hidden;
      items.hidden = isExpanded;
      button.setAttribute("aria-expanded", String(!isExpanded));
      button.classList.toggle("expanded", !isExpanded);
      const label = isExpanded ? "Показать список целей" : "Скрыть список целей";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });
  });
}

function renderActivityDetail(activity) {
  qs("#initiativeDetail").innerHTML = `
    ${renderEntityCard(activity.area, activity.initiative, activity)}
  `;
  bindEntityGoalControls(qs("#initiativeDetail"));
}

function renderHealth() {
  qs("#vitals").innerHTML = vitals
    .map(
      ([name, value, note]) => `
        <div class="vital">
          <div><h3>${name}</h3><span class="muted">${note}</span></div>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");

  qs("#labList").innerHTML = labs
    .map(([name, date, note]) => `<article class="lab"><h3>${name}</h3><span class="muted">${date} / ${note}</span></article>`)
    .join("");
}

function parseNaturalInput(text) {
  const lower = text.toLowerCase();
  const results = [];
  const sleepStart = lower.match(/уснул(?:а)?(?: сегодня)? в (\d{1,2}[:.]\d{2})/);
  const wakeTime = lower.match(/проснул[а-я]* в (\d{1,2}[:.]\d{2})/);
  const networking = lower.match(/познакомил[асься]* с ([^,.]+)/);

  if (/(заверш|закрой|закрыть|закончил|закончить).{0,24}сон|сон.{0,24}(заверш|закрой|закрыть|закончил|закончить)/.test(lower)) {
    const sleepEvent = state.events.find((event) => event.title.toLowerCase() === "сон" && !event.done);
    if (sleepEvent) {
      sleepEvent.done = true;
      results.push("Сон завершен вручную.");
    } else {
      results.push("Активного сна для завершения не нашел.");
    }
  }

  if (sleepStart && wakeTime) {
    const start = sleepStart[1].replace(".", ":");
    const end = wakeTime[1].replace(".", ":");
    const hour = Number(start.split(":")[0]);
    const minute = Number(start.split(":")[1]);
    state.events.unshift({ id: `event-sleep-${Date.now()}`, date: dateKey(getToday()), start: hour, minute, end: Number(end.split(":")[0]), title: "Сон", areaId: "balance", initiativeId: "balance-1", type: "sleep", detail: "добавлено из ввода", done: false });
    state.metrics[0] = { value: estimateSleep(start, end), label: "сон сегодня" };
    results.push(`Сон: ${start}-${end} / БЛАГО / Сон`);
  }

  const meal = lower.match(/съел(?:а)? ([^.]+)/);
  if (meal) {
    const description = meal[1].trim();
    const calories = estimateCalories(description);
    state.events.push({ id: `event-food-${Date.now()}`, date: dateKey(getToday()), start: 10, minute: 15, end: 10.5, title: "Еда", areaId: "sila", initiativeId: "sila-2", type: "food", detail: `${calories} ккал, оценка`, done: false });
    state.metrics[1] = { value: String(calories), label: "ккал занесено" };
    results.push(`Питание: ${description} / СИЛА / Приём пищи`);
  }

  const work = lower.match(/(\d+|один|два|три)\s+час[а-я]* работал[а-я\s]*над (?:инициативой |проектом )?([^.]+)/);
  if (work) {
    const hours = wordToNumber(work[1]);
    const initiativeName = work[2].trim();
    const networkingLocation = taxonomyInitiativeLocation(networkingInitiativeId);
    const networkingAreaId = networkingLocation?.area.id || "sila";
    const networkingAreaName = networkingLocation?.area.name || "РЕЛИЗ";
    state.events.push({ id: `event-work-${Date.now()}`, date: dateKey(getToday()), start: 15, minute: 0, end: 15 + hours, title: "Работа над инициативой", areaId: networkingAreaId, initiativeId: networkingInitiativeId, type: "work", detail: initiativeName, done: false });
    state.goals.unshift({ id: `goal-work-${Date.now()}`, title: `Продолжить: ${initiativeName}`, areaId: networkingAreaId, initiativeId: networkingInitiativeId, date: dateKey(getToday()), time: "без времени", energy: "средняя", type: "single", done: false });
    results.push(`Работа: ${hours} ч / ${networkingAreaName} / Нетворкинг`);
  }

  if (networking) {
    const name = networking[1].trim().replace(/\s+/g, " ");
    const phone = text.match(/(?:телефон|номер)[:\s]*([+()0-9\s-]{7,})/i)?.[1] || "";
    const telegram = text.match(/(?:telegram|телеграм|тг)[:\s]*(@?[a-zA-Z0-9_]{4,})/i)?.[1] || "";
    const instagram = text.match(/(?:instagram|инстаграм|инста)[:\s]*(@?[a-zA-Z0-9_.]{2,})/i)?.[1] || "";
    const link = text.match(/https?:\/\/\S+/i)?.[0] || "";
    const place = text.match(/(?:в|на)\s+([^,.]+?)(?:\s+познакомил|,|\.|$)/i)?.[1] || "";
    const range = text.match(/(?:с|от)\s+(\d{1,2}[:.]\d{2})\s+(?:до|по)\s+(\d{1,2}[:.]\d{2})/i);
    const time = text.match(/(?:в|около)\s+(\d{1,2}[:.]\d{2})/)?.[1]?.replace(".", ":") || "";
    const startTime = range?.[1]?.replace(".", ":") || time;
    const endTime = range?.[2]?.replace(".", ":") || "";
    const contact = addNetworkingContact({
      name,
      phone,
      telegram,
      instagram,
      link,
      place,
      metDate: dateKey(getToday()),
      startTime,
      endTime,
      source: text
    });
    const progress = networkingProgress();
    const networkingAreaName = taxonomyInitiativeLocation(networkingInitiativeId)?.area.name || "РЕЛИЗ";
    results.push(`Нетворкинг: ${contact.name} / ${networkingAreaName} / Нетворкинг. Цель: ${progress.done}/${progress.goal}, ${progress.percent}%.`);
  }

  return results.length ? results : ["Не нашел явных событий. В следующей версии здесь будет AI-разбор через API."];
}

function estimateSleep(start, end) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes < 0) minutes += 24 * 60;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

function estimateCalories(description) {
  let total = 250;
  if (description.includes("омлет")) total += 260;
  if (description.includes("трех яиц") || description.includes("3 яиц")) total += 80;
  if (description.includes("тост")) total += 110;
  return total;
}

function wordToNumber(value) {
  return { один: 1, два: 2, три: 3 }[value] || Number(value);
}

function calendarStepDays() {
  if (state.calendarMode === "day") return 1;
  if (state.calendarMode === "three") return 3;
  return 7;
}

function updatePageHeader() {
  const viewMeta = {
    today: { title: "Сегодня", eyebrow: "Дашборд дня" },
    initiatives: { title: "Направления", eyebrow: "Второй уровень меню" },
    calendar: { title: "Календарь", eyebrow: state.calendarMode === "year" ? String(state.calendarAnchor.getFullYear()) : formatCalendarTitle(calendarVisibleDays()) }
  };

  viewMeta.today.eyebrow = formatFullDate(getToday());
  const pageTitle = qs("#pageTitle");
  const topEyebrow = qs("#topEyebrow");
  if (pageTitle) pageTitle.textContent = viewMeta[state.activeView].title;
  if (topEyebrow) topEyebrow.textContent = viewMeta[state.activeView].eyebrow;
}

function taxonomyInitiativeLocation(initiativeId) {
  for (const area of areas) {
    const index = area.initiatives.findIndex((initiative) => initiative.id === initiativeId);
    if (index >= 0) return { area, initiative: area.initiatives[index], index };
  }
  return null;
}

function taxonomyActivityLocation(activityId) {
  for (const area of areas) {
    for (const initiative of area.initiatives) {
      const index = initiative.activities.findIndex((activity) => activity.id === activityId);
      if (index >= 0) return { area, initiative, activity: initiative.activities[index], index };
    }
  }
  return null;
}

function taxonomyEntityForRename(kind, entityId) {
  if (kind === "direction") return findArea(entityId);
  if (kind === "initiative") return taxonomyInitiativeLocation(entityId)?.initiative;
  if (kind === "activity") return taxonomyActivityLocation(entityId)?.activity;
  return null;
}

function bindTaxonomyNameEditors(root = document) {
  root.querySelectorAll("[data-taxonomy-rename]").forEach((button) => {
    button.addEventListener("click", () => {
      const entity = taxonomyEntityForRename(button.dataset.taxonomyRename, button.dataset.entityId);
      if (!entity) return;

      const input = document.createElement("input");
      input.type = "text";
      input.value = entity.name;
      input.className = `taxonomy-name-editor${button.classList.contains("taxonomy-title-name") ? " taxonomy-title-editor" : ""}`;
      input.setAttribute("aria-label", "Изменить название");
      button.replaceWith(input);
      input.focus();
      input.select();

      let finished = false;
      const finish = (save) => {
        if (finished) return;
        finished = true;
        const name = input.value.trim();
        if (save && name && name !== entity.name) {
          entity.name = name;
          refreshTaxonomy();
          return;
        }
        renderInitiatives();
      };

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finish(true);
        }
        if (event.key === "Escape") {
          event.preventDefault();
          finish(false);
        }
      });
      input.addEventListener("blur", () => finish(true));
    });
  });
}

function refreshTaxonomy() {
  rebuildTaxonomyIndexes();
  saveUserData();
  renderSidebarContext();
  if (state.activeView === "initiatives") renderInitiatives();
}

function openTaxonomyComposer(kind, parentId, anchorButton) {
  closeCalendarGoalComposer();
  const host = calendarGoalComposerHost();
  const labels = {
    direction: ["Новое направление", "Добавить направление"],
    initiative: ["Новая инициатива", "Добавить инициативу"],
    activity: ["Новая активность", "Добавить активность"]
  };
  const [eyebrow, title] = labels[kind];
  const directionColors = ["#a98ed5", "#83bd99", "#e77979", "#72a5d8", "#d39a63", "#a65d70"];

  host.innerHTML = `
    <section class="calendar-goal-composer-layer" role="dialog" aria-modal="true" aria-labelledby="taxonomyComposerTitle">
      <button class="calendar-goal-composer-backdrop" type="button" data-close-calendar-goal aria-label="Закрыть"></button>
      <form class="calendar-goal-composer taxonomy-composer" id="taxonomyComposerForm">
        <header class="calendar-goal-composer-header">
          <div><p class="eyebrow">${eyebrow}</p><h2 id="taxonomyComposerTitle">${title}</h2></div>
          <button class="icon-button" type="button" data-close-calendar-goal aria-label="Закрыть">×</button>
        </header>
        <label class="calendar-composer-title-field"><input name="name" type="text" autocomplete="off" placeholder="Название" required></label>
        ${
          kind === "initiative"
            ? `<label><span>Тип</span><select name="initiativeKind"><option value="container">Инициатива-контейнер</option><option value="initiative">Инициатива</option></select></label>`
            : ""
        }
        ${
          kind === "direction"
            ? `<fieldset class="direction-color-swatches"><legend>Цвет</legend>${directionColors
                .map((color, index) => `<label style="--swatch:${color}"><input type="radio" name="color" value="${color}" ${index === 0 ? "checked" : ""}><span></span></label>`)
                .join("")}</fieldset>`
            : ""
        }
        <p class="calendar-composer-error" role="alert"></p>
        <footer class="calendar-goal-composer-actions">
          <button class="secondary-action" type="button" data-close-calendar-goal>Отмена</button>
          <button class="primary-action" type="submit">Добавить</button>
        </footer>
      </form>
    </section>`;

  const form = host.querySelector("#taxonomyComposerForm");
  const error = form.querySelector(".calendar-composer-error");
  host.querySelectorAll("[data-close-calendar-goal]").forEach((button) => button.addEventListener("click", closeCalendarGoalComposer));
  host.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCalendarGoalComposer();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || "").trim();
    if (!name) {
      error.textContent = "Введите название.";
      return;
    }

    if (kind === "direction") {
      const area = {
        id: uid("direction"),
        name,
        icon: "",
        color: String(data.color || directionColors[0]),
        score: 0,
        directionBlocks: [],
        initiatives: []
      };
      areas.push(area);
      state.openAreaId = area.id;
      state.selectedAreaId = area.id;
    } else if (kind === "initiative") {
      const area = findArea(parentId);
      if (!area) return;
      const initiative = {
        id: uid("initiative"),
        name,
        status: "инициатива",
        kind: String(data.initiativeKind || "container"),
        activities: [],
        goals: []
      };
      area.initiatives.push(initiative);
      state.openAreaId = area.id;
    } else {
      const location = taxonomyInitiativeLocation(parentId);
      if (!location) return;
      location.initiative.kind = "container";
      location.initiative.activities.push({ id: uid("activity"), name, status: "активность", goals: [] });
      state.openAreaId = location.area.id;
      state.openInitiativeId = location.initiative.id;
    }

    closeCalendarGoalComposer();
    refreshTaxonomy();
  });

  const anchor = anchorButton.getBoundingClientRect();
  const sidebar = anchorButton.closest(".sidebar")?.getBoundingClientRect();
  positionCalendarGoalComposer(form, sidebar ? { left: sidebar.right, right: sidebar.right, top: anchor.top, bottom: anchor.bottom } : anchor);
  form.elements.name.focus();
}

function deleteTaxonomyEntity(kind, entityId, parentId) {
  let entity = null;
  let index = -1;
  let parentName = "";

  if (kind === "direction") {
    index = areas.findIndex((area) => area.id === entityId);
    if (index >= 0) entity = areas.splice(index, 1)[0];
  } else if (kind === "initiative") {
    const area = findArea(parentId);
    index = area?.initiatives.findIndex((initiative) => initiative.id === entityId) ?? -1;
    if (area && index >= 0) {
      entity = area.initiatives.splice(index, 1)[0];
      parentName = area.name;
    }
  } else {
    const location = taxonomyActivityLocation(entityId);
    if (location) {
      index = location.index;
      entity = location.initiative.activities.splice(index, 1)[0];
      parentId = location.initiative.id;
      parentName = location.initiative.name;
    }
  }
  if (!entity) return;

  state.taxonomyTrash.unshift({
    id: uid("trash"),
    kind,
    parentId: parentId || null,
    parentName,
    index,
    entity: JSON.parse(JSON.stringify(entity)),
    deletedAt: new Date().toISOString()
  });
  if (entityId === state.selectedAreaId || entityId === state.selectedInitiativeId || entityId === state.selectedActivityId) {
    state.selectedAreaId = null;
    state.selectedInitiativeId = null;
    state.selectedActivityId = null;
    state.openAreaId = null;
    state.openInitiativeId = null;
    activateView("today");
  }
  refreshTaxonomy();
}

function restoreTaxonomyEntity(trashId) {
  const trashIndex = state.taxonomyTrash.findIndex((item) => item.id === trashId);
  if (trashIndex < 0) return false;
  const item = state.taxonomyTrash[trashIndex];
  const entity = JSON.parse(JSON.stringify(item.entity));
  let collection = null;

  if (item.kind === "direction") collection = areas;
  if (item.kind === "initiative") collection = findArea(item.parentId)?.initiatives || null;
  if (item.kind === "activity") collection = taxonomyInitiativeLocation(item.parentId)?.initiative.activities || null;
  if (!collection) return false;

  collection.splice(Math.min(Math.max(item.index, 0), collection.length), 0, entity);
  state.taxonomyTrash.splice(trashIndex, 1);
  refreshTaxonomy();
  return true;
}

function taxonomyCollection(kind, parentId) {
  if (kind === "direction") return areas;
  if (kind === "initiative") return findArea(parentId)?.initiatives || null;
  return taxonomyInitiativeLocation(parentId)?.initiative.activities || null;
}

function updateInitiativeAreaReferences(initiative, areaId) {
  const activityIds = new Set(initiative.activities.map((activity) => activity.id));
  const referencesInitiative = (item) =>
    item.initiativeId === initiative.id || (item.activityId && activityIds.has(item.activityId));
  let changed = false;
  [state.goals, state.events, state.recurringEvents, state.notes, state.habits, state.metrics]
    .filter(Array.isArray)
    .forEach((collection) => {
      collection.forEach((item) => {
        if (referencesInitiative(item) && item.areaId !== areaId) {
          item.areaId = areaId;
          changed = true;
        }
      });
    });
  [initiative.goals, ...initiative.activities.map((activity) => activity.goals)]
    .filter(Array.isArray)
    .forEach((goals) => goals.forEach((goal) => {
      if (goal && typeof goal === "object" && "areaId" in goal && goal.areaId !== areaId) {
        goal.areaId = areaId;
        changed = true;
      }
    }));
  return changed;
}

function reconcileInitiativeAreaReferences() {
  let changed = false;
  areas.forEach((area) => {
    area.initiatives.forEach((initiative) => {
      if (updateInitiativeAreaReferences(initiative, area.id)) changed = true;
    });
  });
  return changed;
}

function moveInitiativeToArea(source, targetAreaId, targetInitiativeId = null, insertAfter = false) {
  const sourceLocation = taxonomyInitiativeLocation(source.id);
  const targetArea = findArea(targetAreaId);
  if (!sourceLocation || !targetArea) return false;
  if (sourceLocation.area.id === targetArea.id && !targetInitiativeId && !sourceLocation.initiative.parentInitiativeId) return false;

  const targetInitiative = targetInitiativeId
    ? targetArea.initiatives.find((item) => item.id === targetInitiativeId)
    : null;
  const [initiative] = sourceLocation.area.initiatives.splice(sourceLocation.index, 1);
  initiative.parentInitiativeId = targetInitiative?.parentInitiativeId || null;
  let targetIndex = targetInitiativeId
    ? targetArea.initiatives.findIndex((item) => item.id === targetInitiativeId)
    : targetArea.initiatives.length;
  if (targetIndex < 0) targetIndex = targetArea.initiatives.length;
  targetArea.initiatives.splice(targetIndex + (targetInitiativeId && insertAfter ? 1 : 0), 0, initiative);

  if (sourceLocation.area.id !== targetArea.id) updateInitiativeAreaReferences(initiative, targetArea.id);
  if (state.selectedInitiativeId === initiative.id || state.openInitiativeId === initiative.id) {
    state.selectedAreaId = targetArea.id;
  }
  state.openAreaId = targetArea.id;
  refreshTaxonomy();
  return true;
}

function nestInitiativeInContainer(source, targetInitiativeId) {
  const sourceLocation = taxonomyInitiativeLocation(source.id);
  const targetLocation = taxonomyInitiativeLocation(targetInitiativeId);
  if (!sourceLocation || !targetLocation || sourceLocation.initiative.id === targetLocation.initiative.id) return false;
  if (sourceLocation.initiative.kind === "container" || sourceLocation.initiative.activities.length) return false;
  if (targetLocation.initiative.kind !== "container" && !targetLocation.initiative.activities.length) return false;
  if (sourceLocation.initiative.parentInitiativeId === targetLocation.initiative.id) return false;

  const initiative = sourceLocation.initiative;
  initiative.parentInitiativeId = targetLocation.initiative.id;
  targetLocation.initiative.kind = "container";
  if (sourceLocation.area.id !== targetLocation.area.id) {
    sourceLocation.area.initiatives.splice(sourceLocation.index, 1);
    targetLocation.area.initiatives.push(initiative);
    updateInitiativeAreaReferences(initiative, targetLocation.area.id);
  }

  state.selectedAreaId = targetLocation.area.id;
  state.openAreaId = targetLocation.area.id;
  state.selectedInitiativeId = initiative.id;
  state.openInitiativeId = targetLocation.initiative.id;
  state.selectedActivityId = null;
  refreshTaxonomy();
  return true;
}

function reorderTaxonomyEntity(source, target, insertAfter, dropInto = false) {
  if (!source || source.id === target.id) return;
  if (source.kind === "initiative") {
    if (target.kind === "direction") {
      moveInitiativeToArea(source, target.id);
      return;
    }
    if (target.kind === "initiative") {
      if (dropInto) {
        nestInitiativeInContainer(source, target.id);
        return;
      }
      moveInitiativeToArea(source, target.parentId, target.id, insertAfter);
      return;
    }
  }
  if (source.kind !== target.kind || source.parentId !== target.parentId) return;
  const collection = taxonomyCollection(source.kind, source.parentId);
  if (!collection) return;
  const sourceIndex = collection.findIndex((item) => item.id === source.id);
  if (sourceIndex < 0) return;
  const [entity] = collection.splice(sourceIndex, 1);
  let targetIndex = collection.findIndex((item) => item.id === target.id);
  if (targetIndex < 0) targetIndex = collection.length;
  collection.splice(targetIndex + (insertAfter ? 1 : 0), 0, entity);
  refreshTaxonomy();
}

function clearTaxonomyDropIndicators() {
  qsa(".taxonomy-item.drop-before, .taxonomy-item.drop-after, .taxonomy-item.drop-into")
    .forEach((node) => node.classList.remove("drop-before", "drop-after", "drop-into"));
}

function markTaxonomyDropTarget(source, item, clientY) {
  if (!source || !item) return null;
  const target = {
    kind: item.dataset.taxonomyKind,
    id: item.dataset.taxonomyId,
    parentId: item.dataset.taxonomyParent || ""
  };
  const initiativeToDirection = source.kind === "initiative" && target.kind === "direction" && target.id !== source.parentId;
  const initiativeToInitiative = source.kind === "initiative" && target.kind === "initiative" && target.id !== source.id;
  const reorderWithinParent = target.kind === source.kind && target.parentId === source.parentId && target.id !== source.id;
  if (!initiativeToDirection && !initiativeToInitiative && !reorderWithinParent) return null;

  clearTaxonomyDropIndicators();
  if (initiativeToDirection) {
    item.classList.add("drop-into");
    return { target, insertAfter: false, dropInto: true };
  }
  const hitBox = item.querySelector(":scope > .side-entity-line") || item;
  const rect = hitBox.getBoundingClientRect();
  const sourceLocation = source.kind === "initiative" ? taxonomyInitiativeLocation(source.id) : null;
  const canNestInContainer = initiativeToInitiative
    && item.dataset.taxonomyContainer === "true"
    && sourceLocation
    && sourceLocation.initiative.parentInitiativeId !== target.id
    && sourceLocation.initiative.kind !== "container"
    && sourceLocation.initiative.activities.length === 0;
  const relativeY = (clientY - rect.top) / rect.height;
  if (canNestInContainer && relativeY >= 0.25 && relativeY <= 0.75) {
    item.classList.add("drop-into");
    return { target, insertAfter: false, dropInto: true };
  }
  const insertAfter = clientY > rect.top + rect.height / 2;
  item.classList.add(insertAfter ? "drop-after" : "drop-before");
  return { target, insertAfter, dropInto: false };
}

function searchableRadianceItems(query) {
  const needle = query.trim().toLocaleLowerCase("ru-RU");
  if (!needle) return [];
  const items = [];
  areas.forEach((area) => {
    items.push({ kind: "direction", id: area.id, title: area.name, context: "Направление" });
    area.initiatives.forEach((initiative) => {
      items.push({ kind: "initiative", id: initiative.id, title: initiative.name, context: area.name });
      initiative.activities.forEach((activity) => {
        items.push({ kind: "activity", id: activity.id, title: activity.name, context: `${area.name} / ${initiative.name}` });
      });
    });
  });
  state.goals.forEach((goal) => {
    const area = findArea(goal.areaId);
    items.push({ kind: "goal", id: goal.id, title: goal.title, context: ["Цель", area?.name].filter(Boolean).join(" · ") });
  });
  state.notes.forEach((note) => {
    items.push({ kind: "note", id: note.id, title: note.text, context: ["Заметка", thoughtScopeLabel(note)].filter(Boolean).join(" · ") });
  });
  return items
    .filter((item) => `${item.title} ${item.context}`.toLocaleLowerCase("ru-RU").includes(needle))
    .slice(0, 30);
}

function renderSearchResults(query = "") {
  const host = qs("#searchResults");
  if (!host) return;
  const items = searchableRadianceItems(query);
  if (!query.trim()) {
    host.innerHTML = `<div class="search-empty"><svg aria-hidden="true"><use href="#i-search" /></svg><strong>Поиск по Radiance</strong><span>Цели, заметки и вся структура в одном месте.</span></div>`;
    return;
  }
  host.innerHTML = items.length
    ? `<div class="search-result-list">${items.map((item) => `
        <button type="button" data-search-kind="${item.kind}" data-search-id="${item.id}">
          <span>${escapeHtml(item.title)}</span>
          <small>${escapeHtml(item.context)}</small>
        </button>`).join("")}</div>`
    : `<div class="search-empty"><strong>Ничего не найдено</strong><span>Попробуйте изменить запрос.</span></div>`;
}

function closeSearch() {
  const layer = qs("#searchLayer");
  if (!layer) return;
  layer.hidden = true;
  qs(".app-shell").removeAttribute("inert");
  qs("#globalSearchInput").value = "";
  renderSearchResults();
  if (searchReturnFocus?.isConnected) searchReturnFocus.focus();
  searchReturnFocus = null;
}

function openSearch() {
  const layer = qs("#searchLayer");
  if (!layer) return;
  searchReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : qs("#searchButton");
  qs(".app-shell").setAttribute("inert", "");
  layer.hidden = false;
  renderSearchResults();
  requestAnimationFrame(() => qs("#globalSearchInput").focus());
}

function trapSearchFocus(event) {
  const layer = qs("#searchLayer");
  if (layer.hidden || event.key !== "Tab") return;
  const focusable = qsa("button:not([disabled]), input:not([disabled])", layer).filter((node) => node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openSearchResult(kind, id) {
  if (kind === "goal") openGoalWorkspace(id);
  if (kind === "note") openNoteWorkspace(id);
  if (kind === "direction") {
    state.selectedAreaId = id;
    state.selectedInitiativeId = null;
    state.selectedActivityId = null;
    state.openAreaId = id;
    activateView("initiatives");
  }
  if (kind === "initiative") {
    const location = taxonomyInitiativeLocation(id);
    if (location) {
      state.selectedAreaId = location.area.id;
      state.selectedInitiativeId = id;
      state.selectedActivityId = null;
      state.openAreaId = location.area.id;
      activateView("initiatives");
    }
  }
  if (kind === "activity") {
    const location = taxonomyActivityLocation(id);
    if (location) {
      state.selectedAreaId = location.area.id;
      state.selectedInitiativeId = location.initiative.id;
      state.selectedActivityId = id;
      state.openAreaId = location.area.id;
      state.openInitiativeId = location.initiative.id;
      activateView("initiatives");
    }
  }
  closeSearch();
}

function bindNavigation() {
  qsa(".nav-item[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activateView(button.dataset.view);
    });
  });

  const sideInitiatives = qs("#sideInitiatives");
  sideInitiatives.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-taxonomy-add]");
    if (addButton) {
      event.preventDefault();
      event.stopPropagation();
      openTaxonomyComposer(addButton.dataset.taxonomyAdd, addButton.dataset.parentId || null, addButton);
      return;
    }
    const deleteButton = event.target.closest("[data-taxonomy-delete]");
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      deleteTaxonomyEntity(deleteButton.dataset.taxonomyDelete, deleteButton.dataset.entityId, deleteButton.dataset.parentId || null);
      return;
    }
    const button = event.target.closest("[data-side-area]");
    if (button) handleSidebarSelection(button);
  });

  sideInitiatives.addEventListener("submit", (event) => {
    const form = event.target.closest("#taxonomyDirectionForm");
    if (!form) return;
    event.preventDefault();
    const name = String(new FormData(form).get("directionName") || "").trim();
    if (!name) return;
    const directionColors = ["#a98ed5", "#83bd99", "#e77979", "#72a5d8", "#d39a63", "#a65d70"];
    const area = {
      id: uid("direction"),
      name,
      icon: "",
      color: directionColors[areas.length % directionColors.length],
      score: 0,
      directionBlocks: [],
      initiatives: []
    };
    areas.push(area);
    state.selectedAreaId = area.id;
    state.openAreaId = area.id;
    refreshTaxonomy();
  });

  sideInitiatives.addEventListener("dragstart", (event) => {
    const item = event.target.closest(".taxonomy-item");
    if (!item) return;
    draggedTaxonomyEntity = {
      kind: item.dataset.taxonomyKind,
      id: item.dataset.taxonomyId,
      parentId: item.dataset.taxonomyParent || ""
    };
    item.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.dataset.taxonomyId);
  });

  sideInitiatives.addEventListener("dragover", (event) => {
    const item = event.target.closest(".taxonomy-item");
    if (!item || !draggedTaxonomyEntity) return;
    const drop = markTaxonomyDropTarget(draggedTaxonomyEntity, item, event.clientY);
    if (!drop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  sideInitiatives.addEventListener("drop", (event) => {
    const item = event.target.closest(".taxonomy-item");
    if (!item || !draggedTaxonomyEntity) return;
    event.preventDefault();
    const target = {
      kind: item.dataset.taxonomyKind,
      id: item.dataset.taxonomyId,
      parentId: item.dataset.taxonomyParent || ""
    };
    reorderTaxonomyEntity(
      draggedTaxonomyEntity,
      target,
      item.classList.contains("drop-after"),
      item.classList.contains("drop-into")
    );
    draggedTaxonomyEntity = null;
  });

  sideInitiatives.addEventListener("dragend", () => {
    draggedTaxonomyEntity = null;
    qsa(".taxonomy-item.is-dragging").forEach((node) => node.classList.remove("is-dragging"));
    clearTaxonomyDropIndicators();
  });

  qs("#searchButton").addEventListener("click", openSearch);
  qs("#globalSearchInput").addEventListener("input", (event) => renderSearchResults(event.target.value));
  qs("#searchLayer").addEventListener("click", (event) => {
    if (event.target.closest("[data-close-search]")) closeSearch();
    const result = event.target.closest("[data-search-kind]");
    if (result) openSearchResult(result.dataset.searchKind, result.dataset.searchId);
  });
  qs("#searchLayer").addEventListener("keydown", trapSearchFocus);
  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape" && !qs("#searchLayer").hidden) closeSearch();
  });
}

function activateView(view) {
  qsa(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  qsa(".view").forEach((item) => item.classList.toggle("active", item.id === `view-${view}`));
  state.activeView = view;
  document.body.dataset.activeView = view;
  closeCalendarEventPopover();
  if (state.activeView === "today" || state.activeView === "calendar") {
    state.selectedAreaId = null;
    state.selectedInitiativeId = null;
    state.selectedActivityId = null;
    state.openAreaId = null;
    state.openInitiativeId = null;
  }
  updatePageHeader();
  renderSidebarContext();
  if (state.activeView === "calendar") renderCalendar();
  if (state.activeView === "initiatives") renderInitiatives();
  if (state.activeView === "health") renderHealth();
  renderGoalWorkspaceHost();
}

function bindActions() {
  const voiceInput = qs("#voiceText");
  const quickCaptureLayer = qs("#quickCaptureLayer");
  const quickCaptureButton = qs("#quickCaptureButton");
  bindThoughtControls(qs("#quickInput"));
  let voiceResizeFrame = 0;
  const resizeVoiceInput = () => {
    cancelAnimationFrame(voiceResizeFrame);
    voiceResizeFrame = requestAnimationFrame(() => {
      const minimumHeight = 46;
      const maximumHeight = 240;
      voiceInput.style.height = `${minimumHeight}px`;
      const scrollHeight = voiceInput.scrollHeight;
      const nextHeight = voiceInput.value
        ? Math.min(Math.max(scrollHeight, minimumHeight), maximumHeight)
        : minimumHeight;
      voiceInput.style.height = `${nextHeight}px`;
      voiceInput.style.overflowY = scrollHeight > maximumHeight ? "auto" : "hidden";
    });
  };

  voiceInput.addEventListener("input", resizeVoiceInput);
  resizeVoiceInput();

  const setQuickCaptureOpen = (open) => {
    quickCaptureLayer.hidden = !open;
    quickCaptureButton.classList.toggle("active", open);
    quickCaptureButton.setAttribute("aria-expanded", String(open));
    if (open) window.requestAnimationFrame(() => voiceInput.focus());
  };

  quickCaptureButton.addEventListener("click", () => setQuickCaptureOpen(quickCaptureLayer.hidden));
  quickCaptureLayer.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-quick-capture]")) setQuickCaptureOpen(false);
  });

  window.addEventListener("keydown", (event) => {
    if (event.altKey) document.documentElement.classList.add("alt-mode");
    if (event.key === "Escape" && !quickCaptureLayer.hidden) setQuickCaptureOpen(false);
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "Alt") document.documentElement.classList.remove("alt-mode");
  });

  window.addEventListener("blur", () => {
    document.documentElement.classList.remove("alt-mode");
  });

  qs("#parseButton").addEventListener("click", () => {
    const results = parseNaturalInput(qs("#voiceText").value);
    saveUserData();
    qs("#parsedOutput").innerHTML = results.map((item) => `<div class="parsed-chip">${item}</div>`).join("");
    renderMetrics();
    refreshGoalViews();
  });

  qs("#clearButton").addEventListener("click", () => {
    voiceInput.value = "";
    resizeVoiceInput();
    qs("#parsedOutput").innerHTML = "";
  });

  qs("#micButton").addEventListener("click", () => {
    qs("#parsedOutput").innerHTML = '<div class="parsed-chip">В локальном MVP диктовка заменена текстовым вводом. Логика уже раскладывает события по направлениям и инициативам.</div>';
  });

  qs("#themeToggle").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    if (dark) document.documentElement.dataset.theme = "dark";
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(themeStorageKey, dark ? "dark" : "light");
    } catch (error) {
      console.warn("Radiance theme save failed", error);
    }
  });

  qs("#calendarModeSelect").addEventListener("change", (event) => {
    state.calendarMode = event.target.value;
    renderCalendar();
    updatePageHeader();
  });

  qs("#prevCalendar").addEventListener("click", () => {
    if (state.calendarMode === "year") {
      const previousYear = new Date(state.calendarAnchor);
      previousYear.setFullYear(previousYear.getFullYear() - 1);
      state.calendarAnchor = startOfDay(previousYear);
    } else if (state.calendarMode === "week") {
      state.calendarAnchor = addMonths(state.calendarAnchor, -1);
    } else {
      state.calendarAnchor = addDays(state.calendarAnchor, -calendarStepDays());
    }
    renderCalendar();
    updatePageHeader();
  });

  qs("#nextCalendar").addEventListener("click", () => {
    if (state.calendarMode === "year") {
      const nextYear = new Date(state.calendarAnchor);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      state.calendarAnchor = startOfDay(nextYear);
    } else if (state.calendarMode === "week") {
      state.calendarAnchor = addMonths(state.calendarAnchor, 1);
    } else {
      state.calendarAnchor = addDays(state.calendarAnchor, calendarStepDays());
    }
    renderCalendar();
    updatePageHeader();
  });

  qs("#todayCalendar").addEventListener("click", () => {
    state.calendarAnchor = getToday();
    renderCalendar();
    updatePageHeader();
  });
}

function render() {
  document.body.dataset.activeView = state.activeView;
  renderSidebarContext();
  renderQuickNotes();
  renderTimeline();
  renderGoals();
  renderHabits();
  renderMetrics();
  updatePageHeader();
  bindNavigation();
  bindActions();
}

// Goal workspace and hidden transit direction.

function directionAreaForBlock(block) {
  return directionAreaByBlock.get(block);
}

function resolveDirectionGoalScope(area, scope = "") {
  const parts = scope.split("/").map((part) => part.trim()).filter(Boolean);
  const initiative = area.initiatives.find((item) => item.name === parts[0]) || area.initiatives[0];
  const activity = initiative?.activities?.find((item) => item.name === parts[1]) || null;
  return { initiative, activity };
}

function ensureDirectionGoals() {
  let changed = false;
  areas.forEach((area) => {
    (area.directionBlocks || []).forEach((block) => {
      (block.items || []).forEach((item, index) => {
        const id = `direction-${area.id}-${block.id}-${index + 1}`;
        if (state.goals.some((goal) => goal.id === id)) return;
        const { initiative, activity } = resolveDirectionGoalScope(area, item.scope);
        state.goals.push({
          id,
          title: item.title,
          areaId: area.id,
          initiativeId: initiative?.id || null,
          activityId: activity?.id || null,
          directionBlockId: block.id,
          scope: item.scope || initiative?.name || "",
          date: "",
          time: "",
          endTime: "",
          description: "",
          checklist: [],
          done: Boolean(item.done),
          completedDate: item.done ? dateKey(getToday()) : null
        });
        changed = true;
      });
    });
  });
  if (changed) saveUserData();
}

function directionGoalsForBlock(area, block) {
  return state.goals.filter((goal) => goal.areaId === area.id && goal.directionBlockId === block.id);
}

function ensureGoalWorkspaceHost() {
  let host = document.querySelector("#detailPaneContent");
  if (!host) {
    host = document.createElement("div");
    host.id = "detailPaneContent";
    document.body.append(host);
  }
  return host;
}

function renderDetailPaneEmpty() {
  return `<div class="detail-pane-empty" aria-hidden="true"></div>`;
}

function renderTodayInlineComposer(mode) {
  const isNote = mode === "note";
  const areaOptions = areas.map((area) => `<option value="${area.id}">${escapeHtml(area.name)}</option>`).join("");
  return `
    <form class="calendar-goal-composer quick-goal-composer today-inline-composer" id="todayInlineComposerForm" data-today-composer-form="${mode}" novalidate>
      <label class="calendar-composer-title-field">
        <textarea name="title" rows="1" autocomplete="off" placeholder="${isNote ? "Текст заметки" : "Название цели"}" required></textarea>
      </label>
      ${!isNote ? `
        <label class="quick-goal-description-field">
          <textarea name="description" rows="1" autocomplete="off" placeholder="Описание"></textarea>
        </label>
        <section class="quick-goal-checklist" aria-label="Пункты цели">
          <div class="quick-goal-checklist-list" data-today-goal-checklist></div>
          <input name="checkItem" type="text" autocomplete="off" placeholder="Новый пункт">
        </section>
      ` : ""}
      ${isNote ? `
        <div class="calendar-composer-classification quick-note-classification today-composer-classification">
          <label><span class="sr-only">Направление</span><select name="areaId" aria-label="Направление"><option value="">Без направления</option>${areaOptions}</select></label>
        </div>
      ` : `
        <div class="today-composer-options">
          <div class="calendar-composer-classification today-composer-classification">
            <label class="calendar-composer-direction-field"><span class="sr-only">Направление</span><select name="areaId" aria-label="Направление" required><option value="">Выберите направление</option>${areaOptions}</select></label>
            <label class="calendar-composer-initiative-field" hidden><span class="sr-only">Инициатива</span><select name="initiativeId" aria-label="Инициатива" disabled><option value="">Без инициативы</option></select></label>
            <label class="calendar-composer-activity-field" hidden><span class="sr-only">Активность</span><select name="activityId" aria-label="Активность" disabled></select></label>
          </div>
          <button class="icon-button today-schedule-toggle" type="button" data-toggle-today-schedule aria-expanded="false" aria-label="Добавить дату и время" title="Дата и время"><svg aria-hidden="true"><use href="#i-calendar" /></svg></button>
        </div>
        <section class="quick-goal-schedule today-goal-schedule" data-today-schedule hidden>
          <div class="quick-goal-schedule-fields">
            <label><span>Дата</span><input name="date" type="date"></label>
            <div class="quick-goal-time-field">
              <span>Время</span>
              <div><input name="time" type="time" aria-label="Начало"><i>—</i><input name="endTime" type="time" aria-label="Окончание"></div>
            </div>
          </div>
        </section>
      `}
      <p class="calendar-composer-error" role="alert" aria-live="polite"></p>
    </form>`;
}

function renderTodayWorkspaceStart(mode = null) {
  return `
    <section class="today-workspace-start" aria-label="Добавить цель или заметку">
      <div class="today-workspace-modes" role="tablist" aria-label="Тип новой записи">
        <button class="${mode === "goal" ? "active" : ""}" type="button" role="tab" aria-selected="${mode === "goal"}" data-today-composer-mode="goal">Цель</button>
        <button class="${mode === "note" ? "active" : ""}" type="button" role="tab" aria-selected="${mode === "note"}" data-today-composer-mode="note">Заметка</button>
        <button class="today-workspace-mobile-close" type="button" data-cancel-today-composer aria-label="Закрыть">×</button>
      </div>
      ${mode ? renderTodayInlineComposer(mode) : ""}
    </section>`;
}

function bindTodayWorkspaceStart(host, mode, scope = {}) {
  if (!mode) return;

  const form = host.querySelector("#todayInlineComposerForm");
  const isNote = mode === "note";
  const titleField = form.elements.title;
  const descriptionField = form.elements.description;
  const error = form.querySelector(".calendar-composer-error");
  const checklistItems = [];

  const autoResize = (field, maximumHeight) => {
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, maximumHeight)}px`;
  };
  titleField.addEventListener("input", () => autoResize(titleField, 144));
  descriptionField?.addEventListener("input", () => autoResize(descriptionField, 112));

  if (isNote && scope.areaId) {
    form.elements.areaId.value = scope.areaId;
  }

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    if (event.target === form.elements.checkItem) return;
    if (!event.target.matches('textarea, input[type="text"]')) return;
    event.preventDefault();
    form.requestSubmit();
  });

  if (!isNote) {
    const areaSelect = form.elements.areaId;
    const initiativeSelect = form.elements.initiativeId;
    const activitySelect = form.elements.activityId;
    const initiativeField = form.querySelector(".calendar-composer-initiative-field");
    const activityField = form.querySelector(".calendar-composer-activity-field");
    const checklistList = form.querySelector("[data-today-goal-checklist]");
    const checklistInput = form.elements.checkItem;
    const schedule = form.querySelector("[data-today-schedule]");
    const scheduleToggle = form.querySelector("[data-toggle-today-schedule]");

    const renderChecklist = () => {
      checklistList.innerHTML = checklistItems.map((item, index) => `
        <div class="quick-goal-checklist-item">
          <span>${escapeHtml(item.title)}</span>
          <button type="button" data-remove-today-goal-checklist="${index}" aria-label="Удалить пункт">×</button>
        </div>`).join("");
    };
    const addChecklistItem = () => {
      const itemTitle = String(checklistInput.value || "").trim();
      if (!itemTitle) return;
      checklistItems.push({ id: uid("check"), title: itemTitle, done: false });
      checklistInput.value = "";
      renderChecklist();
    };
    const updateActivities = () => {
      const initiative = findInitiative(initiativeSelect.value);
      const activities = initiative?.activities || [];
      activitySelect.innerHTML = `<option value="">Без активности</option>${activities.map((activity) => `<option value="${activity.id}">${escapeHtml(activity.name)}</option>`).join("")}`;
      activitySelect.disabled = !activities.length;
      activityField.hidden = !activities.length;
    };
    const updateInitiatives = () => {
      const area = findArea(areaSelect.value);
      if (!area) {
        initiativeSelect.disabled = true;
        initiativeSelect.innerHTML = '<option value="">Без инициативы</option>';
        initiativeField.hidden = true;
        activitySelect.disabled = true;
        activityField.hidden = true;
        return;
      }
      initiativeSelect.disabled = false;
      initiativeField.hidden = false;
      initiativeSelect.innerHTML = `<option value="">Без инициативы</option>${area.initiatives.map((initiative) => `<option value="${initiative.id}">${escapeHtml(initiative.name)}</option>`).join("")}`;
      updateActivities();
    };

    checklistInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.isComposing) return;
      event.preventDefault();
      addChecklistItem();
    });
    checklistList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-today-goal-checklist]");
      if (!removeButton) return;
      checklistItems.splice(Number(removeButton.dataset.removeTodayGoalChecklist), 1);
      renderChecklist();
    });
    areaSelect.addEventListener("change", updateInitiatives);
    initiativeSelect.addEventListener("change", updateActivities);
    scheduleToggle.addEventListener("click", () => {
      const expanded = schedule.hidden;
      schedule.hidden = !expanded;
      scheduleToggle.classList.toggle("active", expanded);
      scheduleToggle.setAttribute("aria-expanded", String(expanded));
      scheduleToggle.setAttribute("aria-label", expanded ? "Скрыть дату и время" : "Добавить дату и время");
      if (expanded) form.elements.date.focus();
    });
    if (scope.areaId) areaSelect.value = scope.areaId;
    updateInitiatives();
    if (scope.initiativeId && !initiativeSelect.disabled) {
      initiativeSelect.value = scope.initiativeId;
      updateActivities();
    }
    if (scope.activityId && !activitySelect.disabled) {
      activitySelect.value = scope.activityId;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    const data = Object.fromEntries(new FormData(form).entries());
    const title = String(data.title || "").trim();
    if (!title) {
      error.textContent = isNote ? "Введите текст заметки." : "Введите название цели.";
      return;
    }

    if (isNote) {
      const noteAreaId = String(data.areaId || "") || null;
      const keepSelectedScope = Boolean(noteAreaId && noteAreaId === scope.areaId);
      const note = {
        id: uid("note"),
        text: title,
        createdAt: new Date().toISOString(),
        areaId: noteAreaId,
        initiativeId: keepSelectedScope ? scope.initiativeId || null : null,
        activityId: keepSelectedScope ? scope.activityId || null : null
      };
      state.notes.unshift(note);
      state.todayComposerMode = null;
      state.openNoteId = note.id;
      refreshThoughtViews();
      return;
    }

    const date = String(data.date || "");
    const time = String(data.time || "");
    const endTime = String(data.endTime || "");
    if (!data.areaId) {
      error.textContent = "Выберите направление для цели.";
      return;
    }
    if ((time || endTime) && !date) {
      error.textContent = "Для времени нужно выбрать дату.";
      return;
    }
    if ((time && !endTime) || (!time && endTime)) {
      error.textContent = "Укажите начало и окончание времени.";
      return;
    }
    if (time && endTime && endTime <= time) {
      error.textContent = "Окончание должно быть позже начала.";
      return;
    }

    const goal = {
      id: uid("goal"),
      title,
      areaId: String(data.areaId),
      initiativeId: String(data.initiativeId || "") || null,
      activityId: String(data.activityId || "") || null,
      date,
      time: time || "без времени",
      endTime,
      energy: "средняя",
      type: "single",
      description: String(data.description || "").trim(),
      checklist: checklistItems.map((item) => ({ ...item, done: false })),
      done: false,
      completedDate: null
    };
    state.goals.unshift(goal);
    state.todayComposerMode = null;
    state.openGoalId = goal.id;
    refreshGoalViews();
  });

  autoResize(titleField, 144);
  autoResize(descriptionField, 112);
  titleField.focus();
}

function openTodayComposer(mode) {
  state.openGoalId = null;
  state.openNoteId = null;
  state.todayComposerMode = mode;
  if (!["today", "initiatives"].includes(state.activeView)) {
    activateView("today");
    return;
  }
  renderGoalWorkspaceHost();
}

function activeComposerScope() {
  if (state.activeView !== "initiatives") return {};
  return {
    areaId: state.selectedAreaId || "",
    initiativeId: state.selectedInitiativeId || "",
    activityId: state.selectedActivityId || ""
  };
}

function renderGoalWorkspaceHost() {
  const host = ensureGoalWorkspaceHost();
  const goal = state.goals.find((item) => item.id === state.openGoalId);
  const note = state.notes.find((item) => item.id === state.openNoteId);
  const scope = activeComposerScope();
  const defaultInitiativeMode = state.activeView === "initiatives" && scope.areaId ? "goal" : null;
  const composerMode = state.todayComposerMode || defaultInitiativeMode;
  const composerPanelOpen = ["today", "initiatives"].includes(state.activeView) && Boolean(composerMode);
  document.body.classList.toggle("has-open-object", Boolean(goal || note || composerPanelOpen));
  if (goal) {
    host.innerHTML = renderGoalWorkspace(goal, findArea(goal.areaId) || transitArea);
    const checklistForm = host.querySelector("#goalChecklistForm");
    checklistForm?.querySelector("button")?.remove();
    bindEntityGoalControls(host);
    return;
  }

  if (!note && state.activeView === "today") {
    host.innerHTML = renderTodayWorkspaceStart(state.todayComposerMode);
    bindTodayWorkspaceStart(host, state.todayComposerMode);
    return;
  }

  if (!note && state.activeView === "initiatives" && composerMode) {
    host.innerHTML = renderTodayWorkspaceStart(composerMode);
    bindTodayWorkspaceStart(host, composerMode, scope);
    return;
  }

  if (!note) {
    host.innerHTML = renderDetailPaneEmpty();
    return;
  }
  host.innerHTML = renderNoteWorkspace(note);
  const editor = host.querySelector("#noteContentEditor");
  editor.addEventListener("input", () => {
    note.text = editor.value;
    scheduleUserDataSave();
  });
  host.querySelector("[data-close-note-workspace]").addEventListener("click", () => {
    state.openNoteId = null;
    refreshThoughtViews();
  });
  host.querySelector("[data-delete-open-note]").addEventListener("click", () => {
    state.notes = state.notes.filter((item) => item.id !== note.id);
    state.openNoteId = null;
    refreshThoughtViews();
  });
}

function openGoalWorkspace(goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal) return;
  state.openNoteId = null;
  state.todayComposerMode = null;
  state.openGoalId = goalId;
  renderGoalWorkspaceHost();
}

function openNoteWorkspace(noteId) {
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  state.openGoalId = null;
  state.todayComposerMode = null;
  state.openNoteId = noteId;
  renderGoalWorkspaceHost();
}

function renderTransitGoals() {
  const panel = document.querySelector("#transitGoals");
  if (!panel) return;
  const goals = state.goals.filter((goal) => goal.areaId === transitArea.id && !goal.done);
  panel.innerHTML = goals.length ? `
    <div class="initiative-goal-table transit-goal-list" role="list">
      <div class="initiative-goal-table-head" aria-hidden="true"><span>Цель</span><span>Дата</span><span>Время</span></div>
      ${goals.map((goal) => `
        <div class="initiative-goal goal-row-open transit-goal-row" role="listitem" tabindex="0" data-open-goal="${goal.id}">
          <button class="goal-toggle" type="button" data-entity-goal-toggle="${goal.id}" aria-label="Закрыть цель"></button>
          <span class="initiative-goal-title">${goal.title}</span>
          <span>${goalDateLabel(goal)}</span>
          <span>${goalTimeRange(goal) || "-"}</span>
        </div>`).join("")}
    </div>` : `<div class="empty-inline">Целей в дороге пока нет.</div>`;
}

function ensureTransitPanel() {
  if (document.querySelector("#transitPanel")) {
    renderTransitGoals();
    return;
  }
  const todayGrid = document.querySelector("#view-today .today-grid");
  if (!todayGrid) return;
  const panel = document.createElement("section");
  panel.className = "panel transit-panel";
  panel.id = "transitPanel";
  panel.innerHTML = `
    <div class="panel-header">
      <h2>В дороге</h2>
      <button class="secondary-action small" id="showTransitGoalForm" type="button">+ Цель</button>
    </div>
    <form class="entity-goal-form transit-goal-form" id="transitGoalForm" hidden>
      <label class="entity-goal-title-field"><span>Цель</span><input name="title" type="text" autocomplete="off" placeholder="Куда и зачем" required></label>
      <label><span>Дата</span><input name="date" type="date" required></label>
      <div class="entity-goal-time-range"><span>Время</span><div><input name="time" type="time" aria-label="Начало"><span>—</span><input name="endTime" type="time" aria-label="Окончание"></div></div>
      <button class="primary-action small" type="submit">Добавить</button>
    </form>
    <div id="transitGoals"></div>`;
  todayGrid.append(panel);
  const form = panel.querySelector("#transitGoalForm");
  form.querySelector('[name="date"]').value = dateKey(getToday());
  panel.querySelector("#showTransitGoalForm").addEventListener("click", () => {
    form.hidden = !form.hidden;
    if (!form.hidden) form.querySelector('[name="title"]').focus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    state.goals.push({
      id: `goal-${Date.now()}`,
      title: String(data.get("title") || "").trim(),
      areaId: transitArea.id,
      initiativeId: null,
      activityId: null,
      date: String(data.get("date") || ""),
      time: String(data.get("time") || ""),
      endTime: String(data.get("endTime") || ""),
      description: "",
      checklist: [],
      done: false,
      completedDate: null
    });
    form.reset();
    form.querySelector('[name="date"]').value = dateKey(getToday());
    form.hidden = true;
    refreshGoalViews();
  });
  renderTransitGoals();
}

function renderRadianceExtensions() {
  const sideTitle = document.querySelector("#sideTitle");
  if (sideTitle) {
    sideTitle.hidden = true;
    sideTitle.textContent = "";
  }
  renderGoalWorkspaceHost();
}

function finishGoalWithAnimation(goal, source) {
  if (goal.done) {
    setGoalCompletion(goal, false);
    refreshGoalViews();
    return;
  }
  const row = source.closest(".initiative-goal, .direction-goal-item, .archive-goal-row, .goal-item, .calendar-event");
  if (row) row.classList.add("goal-completing");
  window.setTimeout(() => {
    setGoalCompletion(goal, true);
    if (state.openGoalId === goal.id) state.openGoalId = null;
    refreshGoalViews();
  }, 320);
}

document.addEventListener("click", (event) => {
  const todayComposerButton = event.target.closest("[data-today-composer-mode]");
  if (todayComposerButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openTodayComposer(todayComposerButton.dataset.todayComposerMode);
    return;
  }
  const cancelTodayComposerButton = event.target.closest("[data-cancel-today-composer]");
  if (cancelTodayComposerButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    state.todayComposerMode = null;
    renderGoalWorkspaceHost();
    return;
  }
  const toggle = event.target.closest("[data-entity-goal-toggle], [data-archive-goal-toggle], [data-event-done][data-goal-id]");
  if (toggle) {
    const goalId = toggle.dataset.entityGoalToggle || toggle.dataset.archiveGoalToggle || toggle.dataset.goalId;
    const goal = state.goals.find((item) => item.id === goalId);
    if (!goal) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finishGoalWithAnimation(goal, toggle);
    return;
  }
  const row = event.target.closest("[data-open-goal]");
  if (row) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (row.classList.contains("goal") && state.activeView !== "today") {
      openCalendarEventPopover(row.dataset.openGoal, row);
    } else {
      openGoalWorkspace(row.dataset.openGoal);
    }
    return;
  }
  const calendarEvent = event.target.closest(".calendar-event, .month-event");
  const calendarGoalId = calendarEvent?.dataset.calendarGoalOpen || calendarEvent?.querySelector("[data-goal-id]")?.dataset.goalId;
  if (calendarGoalId) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openCalendarEventPopover(calendarGoalId, calendarEvent);
  }
}, true);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest("[data-open-goal]");
  if (!row || event.target.closest("button, input, textarea, select")) return;
  event.preventDefault();
  if (row.classList.contains("goal") && state.activeView !== "today") {
    openCalendarEventPopover(row.dataset.openGoal, row);
  } else {
    openGoalWorkspace(row.dataset.openGoal);
  }
});

async function bootstrapDolmatovLifeOS() {
  loadSavedTheme();
  const localSnapshot = loadUserData();

  try {
    cloudSync = await createCloudSync({
      structureVersion,
      localSnapshot: localSnapshot || userDataSnapshot()
    });
    if (cloudSync.remoteSnapshot) {
      const remoteSnapshot = cloudSync.remoteSnapshot;
      applyUserData(remoteSnapshot, JSON.stringify(remoteSnapshot));
      localStorage.setItem(storageKey, JSON.stringify(remoteSnapshot));
    }
  } catch (error) {
    console.warn("Dolmatov Life OS cloud connection failed", error);
    document.body.dataset.cloudState = "error";
  }

  const restoredUniqueDirection = restoreDeletedDirectionOnce("unique");
  const restoredNetworkingInitiative = restoreNetworkingInitiativeOnce();
  const movedRequestedInitiatives = moveRequestedInitiativesOnce();
  const restoredSleepOrder = restoreSleepOrderAfterTransferTestOnce();
  const restoredConvertedInitiatives = restoreInitiativesConvertedToActivities();
  const reconciledInitiativeAreas = reconcileInitiativeAreaReferences();
  if (clearAllGoalsOnce() || restoredUniqueDirection || restoredNetworkingInitiative || movedRequestedInitiatives || restoredSleepOrder || restoredConvertedInitiatives || reconciledInitiativeAreas) saveUserData();

  render();
  renderRadianceExtensions();
}

bootstrapDolmatovLifeOS();
