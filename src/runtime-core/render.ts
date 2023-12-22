import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  //调用patch 方法, 方便后续递归调用
  patch(vnode, container);
}

function patch(vnode, container) {
  //处理组件

  //判断vnode是不是element类型
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ElEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}
function processComponent(vnode, container) {
  //挂载组件
  mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container);
  //所有 subTree 初始化之后，将根节点的 el 赋值给组件的 el
  initialVNode.el = subTree.el;
}
function processElement(vnode, container) {
  mountElement(vnode, container);
  // updateElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const { type, props, children, shapeFlag } = vnode;
  vnode.el = document.createElement(type);
  const el = vnode.el;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }

  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  container.append(el);
}

function updateElement(vnode: any, container: any) {
  throw new Error("Function not implemented.");
}
function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}
