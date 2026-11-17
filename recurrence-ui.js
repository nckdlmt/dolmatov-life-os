import { isRecurringGoal, recurrenceSettings } from './goal-schedule.js?v=calendar-edit-2';

const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const weekdays = [[1,'Пн'],[2,'Вт'],[3,'Ср'],[4,'Чт'],[5,'Пт'],[6,'Сб'],[0,'Вс']];

export function renderRecurrenceControls(goal = {}) {
  const enabled = isRecurringGoal(goal), rule = goal.recurrence || {};
  const settings = recurrenceSettings({...goal,date:goal.date || '2027-01-11'});
  return `<section class="goal-recurrence" aria-label="Повторение цели" data-repeat-origin="${escape(JSON.stringify({date:goal.date,rule}))}" data-custom-weekdays="${rule.frequency==='custom'&&rule.weekdays?.length?'true':'false'}">
    <label class="calendar-repeat-toggle"><input name="repeat" type="checkbox" ${enabled?'checked':''}><span>Повторяемая цель</span></label>
    <div class="goal-recurrence-fields" ${enabled?'':'hidden'}>
      <label><span>Периодичность</span><select name="frequency" aria-label="Периодичность">
        ${[['none','Нет'],['daily','Ежедневно'],['weekly','Еженедельно'],['monthly','Ежемесячно'],['yearly','Ежегодно'],['weekdays','Каждый будний день (пн–пт)'],['custom','Произвольно']].map(([value,label])=>`<option value="${value}" ${value===(rule.frequency || 'daily')?'selected':''}>${label}</option>`).join('')}
      </select></label>
      <button type="button" class="secondary-action" data-edit-custom-repeat ${rule.frequency==='custom'?'':'hidden'}>Настроить произвольно</button>
      <label><span>Повторять до · необязательно</span><input name="repeatUntil" type="date" value="${escape(rule.until)}" aria-label="Повторять до"></label>
      <small class="goal-schedule-hint">Одна цель. Изменения применяются ко всем повторениям; выполнение отмечается отдельно за каждый день.</small>
    </div>
    <dialog class="recurrence-dialog" aria-label="Повторять произвольно">
      <header><button type="button" data-cancel-repeat aria-label="Отмена настройки повторения">×</button><h3>Повторять произвольно</h3><button type="button" data-save-repeat aria-label="Сохранить повторение">✓</button></header>
      <div class="recurrence-custom-body">
        <label><span>Повтор</span><select name="repeatBasis" aria-label="Способ повторения"><option value="scheduled" ${settings.basis==='scheduled'?'selected':''}>По датам расписания</option><option value="completion" ${settings.basis==='completion'?'selected':''}>После выполнения</option></select></label>
        <fieldset><legend>Частота</legend><div class="recurrence-interval"><span>Каждые</span><input name="repeatInterval" type="number" min="1" max="999" step="1" value="${settings.interval}" aria-label="Интервал повторения"><select name="repeatUnit" aria-label="Единица повторения">${[['day','День'],['week','Неделя'],['month','Месяц'],['year','Год']].map(([value,label])=>`<option value="${value}" ${settings.unit===value?'selected':''}>${label}</option>`).join('')}</select></div></fieldset>
        <fieldset data-repeat-weekdays ${settings.unit==='week'?'':'hidden'}><legend>Дни недели</legend><div class="recurrence-weekdays">${weekdays.map(([value,label])=>`<label><input type="checkbox" name="repeatWeekday" value="${value}" ${settings.weekdays.includes(value)?'checked':''}><span>${label}</span></label>`).join('')}</div></fieldset>
        <p class="goal-schedule-hint" data-custom-repeat-description></p><p class="calendar-composer-error" data-custom-repeat-error role="alert"></p>
      </div>
    </dialog>
  </section>`;
}

export function readRecurrence(root) {
  const field = name => root.querySelector(`[name="${name}"]`);
  if (!field('repeat')?.checked || field('frequency')?.value === 'none') return null;
  const frequency = field('frequency').value;
  const result = { frequency, until:field('repeatUntil')?.value || '',
    ...(frequency==='custom'?{basis:field('repeatBasis').value, interval:Number(field('repeatInterval').value),unit:field('repeatUnit').value,
      weekdays:[...root.querySelectorAll('[name="repeatWeekday"]:checked')].map(input=>Number(input.value))}:{}) };
  const origin = JSON.parse(root.querySelector('.goal-recurrence')?.dataset.repeatOrigin || '{}');
  const signature = rule => JSON.stringify([rule.frequency,rule.basis || 'scheduled',rule.unit || '',Number(rule.interval)||1,[...(rule.weekdays||[])].sort()]);
  const date=root.querySelector('[name="date"], #goalDateEditor')?.value;
  if (origin.rule && origin.date===date && signature(origin.rule)===signature(result)) {
    for (const key of ['anchorDate','weekPhaseOffset','nextDate']) if(origin.rule[key]!==undefined)result[key]=origin.rule[key];
  }
  return result;
}

export function recurrenceError(rule, date) {
  if (!rule) return '';
  if (!date) return 'Укажите дату начала повторений.';
  if (rule.until && rule.until < date) return 'Повторение не может закончиться раньше начала.';
  if (rule.frequency==='custom' && (!Number.isInteger(rule.interval)||rule.interval<1||rule.interval>999)) return 'Укажите интервал от 1 до 999.';
  if (rule.frequency==='custom' && rule.unit==='week' && !rule.weekdays?.length) return 'Выберите хотя бы один день недели.';
  return '';
}

export function bindRecurrenceControls(root, onChange = () => {}) {
  const section=root.querySelector('.goal-recurrence');
  if (!section) return;
  const field=name=>section.querySelector(`[name="${name}"]`);
  const date=root.querySelector('[name="date"], #goalDateEditor');
  const dialog=section.querySelector('dialog');
  const fields=section.querySelector('.goal-recurrence-fields');
  const customButton=section.querySelector('[data-edit-custom-repeat]');
  let previousFrequency=field('frequency').value, draftBackup=null;
  const sync=()=>{
    fields.hidden=!field('repeat').checked;
    customButton.hidden=field('frequency').value!=='custom';
    field('repeatUntil').min=date?.value || '';
    const d=date?.value?new Date(`${date.value}T12:00:00`):null;
    if(d && section.dataset.customWeekdays!=='true' && !dialog.open) section.querySelectorAll('[name="repeatWeekday"]').forEach(input=>{input.checked=Number(input.value)===d.getDay();});
    const label={weekly:d?`Еженедельно (${d.toLocaleDateString('ru-RU',{weekday:'long'})})`:'Еженедельно',monthly:d?`Ежемесячно (${d.getDate()}-й день)`:'Ежемесячно',yearly:d?`Ежегодно (${d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'})})`:'Ежегодно'};
    [...field('frequency').options].forEach(option=>{if(label[option.value]) option.textContent=label[option.value];});
    section.querySelector('[data-repeat-weekdays]').hidden=field('repeatUnit').value!=='week';
    section.querySelector('[data-custom-repeat-description]').textContent=field('repeatBasis').value==='completion'
      ? 'Следующее повторение появится после выполнения текущего. Интервал отсчитывается от фактической даты выполнения.'
      : 'Повторения привязаны к расписанию. Если нужного числа нет в месяце, используется последний день месяца.';
  };
  const notify=()=>{sync();onChange(readRecurrence(root));};
  const openCustom=()=>{
    draftBackup=[...dialog.querySelectorAll('input,select')].map(input=>({input,value:input.value,checked:input.checked}));
    sync();dialog.showModal();
  };
  const cancel=()=>{
    draftBackup?.forEach(({input,value,checked})=>{input.value=value;if(input.type==='checkbox')input.checked=checked;});
    field('frequency').value=previousFrequency;dialog.close();sync();
  };
  field('repeat').addEventListener('change',()=>{if(field('repeat').checked&&field('frequency').value==='none')field('frequency').value='daily';notify();});
  field('frequency').addEventListener('change',()=>{
    if(field('frequency').value==='custom'){openCustom();return;}
    if(field('frequency').value==='none')field('repeat').checked=false;
    previousFrequency=field('frequency').value;notify();
  });
  field('repeatUntil').addEventListener('change',notify);
  date?.addEventListener('input',sync);
  field('repeatUnit').addEventListener('change',sync);
  field('repeatBasis').addEventListener('change',sync);
  section.querySelectorAll('[name="repeatWeekday"]').forEach(input=>input.addEventListener('change',()=>{section.dataset.customWeekdays='true';}));
  customButton.addEventListener('click',openCustom);
  section.querySelector('[data-cancel-repeat]').addEventListener('click',cancel);
  dialog.addEventListener('cancel',event=>{event.preventDefault();cancel();});
  dialog.addEventListener('keydown',event=>{
    event.stopPropagation();
    if(event.key==='Enter' && event.target.tagName!=='BUTTON') {
      event.preventDefault();section.querySelector('[data-save-repeat]').click();
    }
  });
  section.querySelector('[data-save-repeat]').addEventListener('click',()=>{
    const error=recurrenceError(readRecurrence(root),date?.value || '2027-01-11');
    section.querySelector('[data-custom-repeat-error]').textContent=error;
    if(error)return;
    section.dataset.customWeekdays='true';
    previousFrequency='custom';dialog.close();notify();
  });
  sync();
}
