import test from 'node:test';
import assert from 'node:assert/strict';
import {bindVoiceCapture} from '../voice-capture.js';

test('finishes a dictated draft when the browser delivers a late result but never ends', t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  class Field extends EventTarget {
    value = '';
    setAttribute() {}
    replaceChildren() {}
  }
  const ids = Object.fromEntries(['micButton','voiceText','parsedOutput','voiceReview','parseButton'].map(id => [id,new Field()]));
  ids.voiceReview.elements = Object.fromEntries(['kind','title','area','initiative'].map(id => [id,new Field()]));
  let engine;
  class Speech {
    start() { engine = this; this.onstart(); }
    stop() {}
    abort() {}
  }
  const browser = new EventTarget();
  browser.SpeechRecognition = Speech;
  globalThis.window = browser;
  globalThis.document = {getElementById: id => ids[id]};
  globalThis.Option = class {};
  t.after(() => { delete globalThis.window; delete globalThis.document; delete globalThis.Option; });
  bindVoiceCapture({areas:[{id:'love',name:'Любовь',initiatives:[]}],save:assert.fail});
  const click = () => ids.micButton.dispatchEvent(new Event('click'));
  click();
  click();
  engine.onresult({results:[[{transcript:'цель позвонить маме в направление любовь'}]]});
  t.mock.timers.tick(2000);
  assert.equal(ids.voiceReview.hidden,false);
  assert.equal(ids.voiceReview.elements.title.value,'позвонить маме');
  assert.equal(ids.voiceReview.elements.area.value,'love');
  assert.equal(ids.parseButton.disabled,false);
});
