import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
function applicationFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, end);
}

for (const destination of ['same-area', 'other-area', 'other-container']) {
  test(`actual move handlers preserve identity and references: ${destination}`, () => {
    const child = { id: 'family', name: 'Род', goals: [], activities: [], parentInitiativeId: 'container-a', kind: 'initiative' };
    const areas = [
      { id: 'a', initiatives: [{ id: 'container-a', kind: 'container', activities: [] }, child] },
      { id: 'b', initiatives: [{ id: 'container-b', kind: 'container', activities: [] }] }
    ];
    const state = { goals: [{ initiativeId: 'family', areaId: 'a' }], events: [], recurringEvents: [], notes: [], habits: [], metrics: [] };
    const context = vm.createContext({ areas, state, findArea: id => areas.find(a => a.id === id), refreshTaxonomy() {} });
    vm.runInContext(['taxonomyInitiativeLocation', 'taxonomyActivityLocation', 'updateInitiativeAreaReferences', 'moveInitiativeToArea', 'nestInitiativeInContainer', 'reorderTaxonomyEntity'].map(applicationFunction).join('\n'), context);
    context.reorderTaxonomyEntity({ kind: 'initiative', id: 'family', parentId: 'a' }, destination === 'other-container' ? { kind: 'initiative', id: 'container-b', parentId: 'b' } : { kind: 'direction', id: destination === 'same-area' ? 'a' : 'b' }, false, destination === 'other-container');
    const area = areas.find(a => a.initiatives.includes(child));
    assert.equal(area.id, destination === 'same-area' ? 'a' : 'b');
    assert.equal(child.parentInitiativeId, destination === 'other-container' ? 'container-b' : null);
    assert.equal(state.goals[0].areaId, area.id);
    assert.equal(child.id, 'family');
  });
}
