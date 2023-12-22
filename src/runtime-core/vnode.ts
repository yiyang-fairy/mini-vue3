import { ShapeFlags, getShapeFlag } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
  };

  if (typeof vnode.children === "string") {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(vnode.children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}
