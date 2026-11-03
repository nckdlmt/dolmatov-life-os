import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("initiative rows use the pointer drag controller instead of native button drag", async () => {
  const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
  assert.match(source, /addEventListener\("pointerdown"/);
  assert.match(source, /document\.elementFromPoint/);
  assert.match(source, /class="side-initiative-button[^\n]+draggable="false"/);
  assert.match(source, /side-nested-initiative-node[^\n]+draggable="false"/);
});
