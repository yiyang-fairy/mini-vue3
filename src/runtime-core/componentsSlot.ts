import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(instance.slots, children);
  }
}

function normalizeObjectSlots(slots, children) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeValue(value(props));
  }
}

function normalizeValue(value) {
  return Array.isArray(value) ? value : [value];
}
