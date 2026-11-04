// Read only the spoken routing clauses. A name in the body (e.g. «улучшить сон»)
// stays part of the entry unless it is explicitly introduced as a destination.
export function parseVoiceCommand(input, areas) {
  const token = /[\p{L}\p{N}]+/gu;
  const words = [...input.matchAll(token)].map(m => ({
    word: m[0].toLocaleLowerCase('ru').replaceAll('ё', 'е'), at: m.index, end: m.index + m[0].length
  }));
  const typeAt = words.findIndex(({word}) => /^(цель|задач[ау]|мысль)$/.test(word));
  const kind = typeAt < 0 ? '' : words[typeAt].word === 'мысль' ? 'note' : 'goal';
  const names = areas.flatMap(a => [
    {name:a.name, area:a.id, id:null},
    ...a.initiatives.map(i => ({name:i.name, area:a.id, id:i.id}))
  ]).map(n => ({...n, parts:n.name.toLocaleLowerCase('ru').replaceAll('ё','е').match(token) || []}))
    .filter(n => n.parts.length).sort((a,b) => b.parts.length - a.parts.length);
  const routes = [];
  const removed = [];
  for (let i=0; i<words.length; i++) {
    let j=i;
    const prep = /^(в|во)$/.test(words[j].word);
    if (prep) j++;
    const label = words[j]?.word || '';
    const areaLabel = /^(направлени[еи]|сфер[ауе])$/.test(label);
    const initLabel = /^инициатив[ауе]$/.test(label);
    if (areaLabel || initLabel) j++;
    if (!prep && !areaLabel && !initLabel && !(typeAt >= 0 && i < typeAt)) continue;
    const hits = names.filter(n => (!areaLabel || !n.id) && (!initLabel || n.id)
      && n.parts.every((part,k) => words[j+k]?.word === part));
    if (!hits.length) continue;
    const size = hits[0].parts.length;
    routes.push(hits.filter(n => n.parts.length === size));
    removed.push([words[i].at,words[j+size-1].end]);
    i=j+size-1;
  }
  const areaRoutes = routes.filter(h => h.every(n => !n.id));
  const explicit = [...new Set(areaRoutes.flat().map(n => n.area))];
  const candidates = routes.flat().filter(n => n.id && (!explicit.length || explicit.includes(n.area)));
  const unique = [...new Map(candidates.map(n => [n.id,n])).values()];
  const initiative = unique.length === 1 ? unique[0] : null;
  const areaId = explicit.length === 1 ? explicit[0] : !explicit.length ? initiative?.area : null;
  if (typeAt >= 0) removed.push([words[typeAt].at,words[typeAt].end]);
  let title=input;
  for (const [start,end] of removed.sort((a,b)=>b[0]-a[0])) title=title.slice(0,start)+' '+title.slice(end);
  title=title.trim().replace(/^[\s,.:;—–-]*(?:(?:добавь|запиши|создай|поставь)\s*)?/iu,'')
    .replace(/^[\s,.:;—–-]+|[\s,:;—–-]+$/gu,'').replace(/\s+/g,' ').trim();
  return {kind,title,areaId:areaId || '',initiativeId:initiative?.id || ''};
}
