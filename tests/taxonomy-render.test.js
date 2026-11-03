import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("visible taxonomy rows can start native drag operations", async () => {
  const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
  assert.match(source, /class="side-area-button[^\n]+draggable="true"/);
  assert.match(source, /class="side-initiative-button[^\n]+draggable="true"/);
  assert.match(source, /class="side-activity-button[^\n]+draggable="true"/);
});
