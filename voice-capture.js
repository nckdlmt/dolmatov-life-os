import { parseVoiceCommand } from './voice-command.js';
import { localDictation } from './local-dictation.js';

export function bindVoiceCapture({areas, save}) {
  const byId = id => document.getElementById(id);
  const mic = byId('micButton');
  const input = byId('voiceText');
  const status = byId('parsedOutput');
  const form = byId('voiceReview');
  const {kind, title, area, initiative} = form.elements;
  let current = null;
  let preferLocal = false;
  let timer;

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
    clearTimeout(timer);
    if (session) {
      session.abort();
      status.textContent = '';
    }
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
    const prefix = input.value.trim();
    let spoken = '';
    let session;
    function transcript(words) {
      if (current !== session || !words.trim()) return;
      spoken = words.trim();
      input.value = [prefix, spoken].filter(Boolean).join(' ');
      input.dispatchEvent(new Event('input'));
    }
    function finish(message = '') {
      if (current !== session) return;
      reset();
      if (spoken) review(parseVoiceCommand(input.value, areas));
      else status.textContent = message || 'Речь не распознана. Нажмите кружок и повторите.';
    }
    const localHint = 'Нажмите кружок ещё раз для распознавания на устройстве.';
    function retryLocally(reason) {
      if (current !== session) return;
      preferLocal = true;
      finish(reason + ' ' + localHint);
    }
    function showStatus(message) {
      if (current === session) status.textContent = message;
    }
    if (preferLocal || !Speech) {
      session = localDictation({status: showStatus, transcript, finish, fail: finish});
    } else {
      let native;
      let stopping = false;
      session = {
        start() {
          showStatus('Подключаю микрофон… Если появится запрос, разрешите доступ.');
          timer = setTimeout(() => retryLocally('Служба диктовки браузера не ответила.'), 15000);
          native = new Speech();
          native.lang = 'ru-RU';
          native.interimResults = true;
          native.continuous = false;
          bindNativeEvents();
          native.start();
        },
        stop() {
          if (stopping) return;
          stopping = true;
          clearTimeout(timer);
          showStatus('Завершаю расшифровку…');
          timer = setTimeout(() => retryLocally('Браузер не завершил расшифровку.'), 1600);
          native.stop();
        },
        abort() {
          if (!native) return;
          native.onresult = native.onerror = native.onend = native.onstart = null;
          try { native.abort(); } catch { /* Already ended. */ }
        }
      };
      function bindNativeEvents() {
        native.onstart = () => {
          if (current !== session || stopping) return;
          clearTimeout(timer);
          timer = setTimeout(() => retryLocally('Браузер не вернул текст.'), 20000);
          showStatus('Слушаю. Когда закончите, нажмите красный квадрат.');
        };
        native.onresult = event => {
          if (current !== session) return;
          transcript(Array.from(event.results, result => result[0].transcript).join(' '));
          if (spoken && !stopping) clearTimeout(timer);
        };
        native.onerror = event => {
          if (event.error === 'audio-capture') finish('Браузер не получил звук. Проверьте выбранный микрофон и доступ к нему.');
          else if (event.error === 'not-allowed') retryLocally('Браузер отказал в доступе к диктовке. Проверьте разрешение на микрофон.');
          else retryLocally(event.error === 'no-speech' ? 'Браузер не услышал речь.' : 'Служба диктовки браузера недоступна.');
        };
        native.onend = () => spoken ? finish() : retryLocally('Браузер завершил диктовку без текста.');
      }
    }
    current = session;
    form.hidden = true;
    mic.setAttribute('aria-pressed', 'true');
    mic.title = 'Остановить диктовку';
    mic.setAttribute('aria-label', mic.title);
    byId('parseButton').disabled = true;
    input.readOnly = true;
    try { session.start(); }
    catch { retryLocally('Не удалось запустить диктовку браузера.'); }
  });
  window.addEventListener('pagehide', reset);
  return {reset, reviewText() {
    const draft = parseVoiceCommand(input.value, areas);
    if (!draft.kind && !draft.areaId) return false;
    review(draft);
    return true;
  }};
}
