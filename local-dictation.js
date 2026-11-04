// Loaded only if the browser's speech service is unavailable.
let modelPromise;
function loadModel() {
  if (!modelPromise) {
    modelPromise = import('./vendor/speech/vosk-0.0.8.js').then(() => {
      const url = new URL('./vendor/speech/ru-0.22.tar.gz', import.meta.url).href;
      const model = new window.Vosk.Model(url, -2);
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(fail, 180000);
        function fail() {
          clearTimeout(timeout);
          model.terminate();
          reject(new Error('Не удалось загрузить русский словарь. Проверьте соединение и повторите запись.'));
        }
        model.addEventListener('load', event => {
          clearTimeout(timeout);
          if (event.detail.result) resolve(model);
          else fail();
        }, {once: true});
      });
    }).catch(error => { modelPromise = null; throw error; });
  }
  return modelPromise;
}

export function localDictation({status, transcript, finish, fail}) {
  let cancelled = false;
  let stopping = false;
  let context, stream, processor, recognizer, timer;
  let submitted = 0;
  let received = 0;
  let finalText = '';

  function releaseAudio() {
    processor?.disconnect();
    if (processor) processor.onaudioprocess = null;
    stream?.getTracks().forEach(track => track.stop());
    if (context && context.state !== 'closed') context.close().catch(() => {});
    context = null;
  }
  function abort() {
    cancelled = true;
    clearTimeout(timer);
    releaseAudio();
    recognizer?.remove();
    recognizer = null;
  }
  async function start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Этот браузер не даёт сайту доступ к микрофону. Откройте сайт в обычном браузере.');
      context = new (window.AudioContext || window.webkitAudioContext)();
      const resumed = context.resume();
      status('Разрешите сайту использовать микрофон.');
      const permission = navigator.mediaDevices.getUserMedia({audio: {channelCount: 1, echoCancellation: true}});
      // Release a late permission grant even if the user already closed the panel.
      await Promise.all([permission.then(value => {
        if (cancelled) value.getTracks().forEach(track => track.stop());
        else stream = value;
      }), resumed]);
      if (cancelled) return;
      status('Готовлю распознавание на устройстве. При первом запуске загрузится около 50 МБ.');
      const model = await loadModel();
      if (cancelled) return;
      recognizer = new model.KaldiRecognizer(context.sampleRate);
      function result(message) {
        received++;
        const {text, partial} = message.result;
        if (text) finalText = [finalText, text].filter(Boolean).join(' ');
        const words = [finalText, partial].filter(Boolean).join(' ');
        if (words) transcript(words);
        if (stopping && received > submitted) finish();
      }
      recognizer.on('result', result);
      recognizer.on('partialresult', result);
      recognizer.on('error', () => fail('Не удалось распознать звук. Повторите запись.'));
      const source = context.createMediaStreamSource(stream);
      processor = context.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = event => {
        if (stopping || cancelled) return;
        submitted++;
        recognizer.acceptWaveform(event.inputBuffer);
      };
      source.connect(processor);
      processor.connect(context.destination);
      stream.getAudioTracks()[0].onended = () => { if (!cancelled && !stopping) stop(); };
      status('Слушаю. Когда закончите, нажмите красный квадрат.');
    } catch (error) {
      if (!cancelled) fail(error.name === 'NotAllowedError'
        ? 'Доступ к микрофону закрыт. Разрешите микрофон для этого сайта в настройках браузера.'
        : error.name === 'NotFoundError' ? 'Микрофон не найден. Проверьте выбранное устройство ввода.' : error.message);
    }
  }
  function stop() {
    if (stopping) return;
    if (!recognizer) { finish(); return; }
    stopping = true;
    releaseAudio();
    status('Завершаю расшифровку…');
    timer = setTimeout(finish, 4000);
    recognizer.retrieveFinalResult();
  }
  return {start, stop, abort};
}
