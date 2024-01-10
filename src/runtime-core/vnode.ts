import { ShapeFlags, getShapeFlag } from "../shared/ShapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
    key: props && props.key,
    component: null,
  };

  if (typeof vnode.children === "string") {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(vnode.children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}

export function createTextVNode(text) {
  return createVNode(Text, {}, text);
}
