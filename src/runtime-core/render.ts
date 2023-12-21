import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  //调用patch 方法, 方便后续递归调用
  patch(vnode, container);
}

function patch(vnode, container) {
  //处理组件

  //判断vnode是不是element类型
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}
function processComponent(vnode, container) {
  //挂载组件
  mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  patch(subTree, container);
}
function processElement(vnode, container) {
  mountElement(vnode, container);
  // updateElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode;
  console.log("11", type, props, children, container);
  const el = document.createElement(type);
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
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
