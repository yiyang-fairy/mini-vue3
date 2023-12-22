export const enum ShapeFlags {
  ElEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3, // 1000
}

export function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ElEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
