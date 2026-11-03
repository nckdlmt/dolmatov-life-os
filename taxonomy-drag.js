export function canDropInitiativeOnDirection({
  sourceKind,
  targetKind,
  targetAreaId,
  sourceAreaId,
  parentInitiativeId
}) {
  return sourceKind === "initiative"
    && targetKind === "direction"
    && Boolean(sourceAreaId)
    && (targetAreaId !== sourceAreaId || Boolean(parentInitiativeId));
}

export function canNestInitiativeInContainer({
  sourceKind,
  targetKind,
  sourceId,
  targetId,
  sourceParentInitiativeId,
  targetIsContainer,
  sourceIsContainer,
  sourceHasActivities
}) {
  return sourceKind === "initiative"
    && targetKind === "initiative"
    && sourceId !== targetId
    && targetIsContainer
    && sourceParentInitiativeId !== targetId
    && !sourceIsContainer
    && !sourceHasActivities;
}
