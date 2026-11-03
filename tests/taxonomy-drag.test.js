import assert from "node:assert/strict";
import test from "node:test";

import {
  canDropInitiativeOnDirection,
  canNestInitiativeInContainer
} from "../taxonomy-drag.js";

test("a nested initiative can be dropped onto its own direction to leave a container", () => {
  assert.equal(canDropInitiativeOnDirection({
    sourceKind: "initiative",
    targetKind: "direction",
    targetAreaId: "love",
    sourceAreaId: "love",
    parentInitiativeId: "love-container"
  }), true);
});

test("a top-level initiative is not redundantly dropped onto its current direction", () => {
  assert.equal(canDropInitiativeOnDirection({
    sourceKind: "initiative",
    targetKind: "direction",
    targetAreaId: "love",
    sourceAreaId: "love",
    parentInitiativeId: null
  }), false);
});

test("an initiative can be moved directly to another direction", () => {
  assert.equal(canDropInitiativeOnDirection({
    sourceKind: "initiative",
    targetKind: "direction",
    targetAreaId: "fizio",
    sourceAreaId: "love",
    parentInitiativeId: "love-container"
  }), true);
});

test("a nested initiative can be moved into another container", () => {
  assert.equal(canNestInitiativeInContainer({
    sourceKind: "initiative",
    targetKind: "initiative",
    sourceId: "nested-initiative",
    targetId: "other-container",
    sourceParentInitiativeId: "current-container",
    targetIsContainer: true,
    sourceIsContainer: false,
    sourceHasActivities: false
  }), true);
});

test("dropping an initiative back into its current container is ignored", () => {
  assert.equal(canNestInitiativeInContainer({
    sourceKind: "initiative",
    targetKind: "initiative",
    sourceId: "nested-initiative",
    targetId: "current-container",
    sourceParentInitiativeId: "current-container",
    targetIsContainer: true,
    sourceIsContainer: false,
    sourceHasActivities: false
  }), false);
});
