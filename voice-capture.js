import { parseVoiceCommand } from './voice-command.js';

export function bindVoiceCapture({areas, save}) {
  const byId = id => document.getElementById(id);
  const mic = byId('micButton');
  const input = byId('voiceText');
  const status = byId('parsedOutput');
  const form = byId('voiceReview');
  const {kind, title, area, initiative} = form.elements;
  let current = null;

  function fill(select, rows, placeholder, value) {
    select.replaceChildren(new Option(placeholder, ''), ...rows.map(row => new Option(row.name, row.id)));
    select.value = value || '';
  }
  function initiatives(value) {
    const parent = areas.find(a => a.id === area.value);
    fill(initiative, parent?.initiatives || [], 'Без инициативы', value);
    initiative.disabled = !parent;
  }
  function review(draft) {
    form.hidden = false;
    kind.value = draft.kind;
    title.value = draft.title;
    fill(area, areas, 'Выберите направление', draft.areaId);
    initiatives(draft.initiativeId);
    status.textContent = 'Проверьте текст и место сохранения.';
  }
  function reset() {
    const session = current;
    current = null;
    if (session) session.abort();
    mic.setAttribute('aria-pressed', 'false');
    mic.setAttribute('aria-label', 'Начать диктовку');
    mic.title = 'Начать диктовку';
    byId('parseButton').disabled = false;
    form.hidden = true;
    input.readOnly = false;
  }
  area.addEventListener('change', () => initiatives(''));
  input.addEventListener('input', () => { form.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.hidden) return;
    const parent = areas.find(a => a.id === area.value);
    const child = parent?.initiatives.find(i => i.id === initiative.value);
    if (!parent || (initiative.value && !child) || !title.value.trim() || !kind.value) {
      status.textContent = 'Уточните тип, текст и направление.';
      return;
    }
    save(kind.value, title.value.trim(), parent.id, child?.id || null);
    status.textContent = 'Сохранено · ' + [parent.name, child?.name].filter(Boolean).join(' → ');
    input.value = '';
    input.dispatchEvent(new Event('input'));
  });
  mic.addEventListener('click', () => {
    if (current) { current.stop(); return; }
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      status.textContent = 'В этом браузере используйте микрофон клавиатуры или введите команду и нажмите «Разобрать».';
      input.focus();
      return;
    }
    const session = new Speech();
    session.lang = 'ru-RU';
    session.interimResults = true;
    session.continuous = false;
    const prefix = input.value.trim();
    let spoken = '';
    let failed = false;
    current = session;
    form.hidden = true;
    session.onresult = event => {
      if (current !== session) return;
      spoken = Array.from(event.results, result => result[0].transcript).join(' ').trim();
      input.value = [prefix, spoken].filter(Boolean).join(' ');
      input.dispatchEvent(new Event('input'));
    };
    session.onerror = event => {
      if (current !== session) return;
      failed = true;
      status.textContent = event.error === 'not-allowed' ? 'Разрешите доступ к микрофону или введите текст.'
        : 'Диктовка прервалась. Проверьте текст или повторите запись.';
    };
    session.onend = () => {
      if (current !== session) return;
      current = null;
      reset();
      if (failed) return;
      if (spoken) review(parseVoiceCommand(input.value, areas));
      else status.textContent = 'Речь не распознана. Попробуйте ещё раз.';
    };
    try {
      session.start();
      mic.setAttribute('aria-pressed', 'true');
      mic.title = 'Остановить диктовку';
      mic.setAttribute('aria-label', mic.title);
      byId('parseButton').disabled = true;
      input.readOnly = true;
      status.textContent = 'Слушаю… Назовите цель или мысль, направление и инициативу.';
    } catch {
      reset();
      status.textContent = 'Микрофон недоступен. Можно ввести текст.';
    }
  });
  window.addEventListener('pagehide', reset);
  return {reset, reviewText() {
    const draft = parseVoiceCommand(input.value, areas);
    if (!draft.kind && !draft.areaId) return false;
    review(draft);
    return true;
  }};
}
