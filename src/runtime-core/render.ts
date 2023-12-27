import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container, parentComponent) {
  //调用patch 方法, 方便后续递归调用
  patch(vnode, container, parentComponent);
}

function patch(vnode, container, parentComponent) {
  //处理组件

  //判断vnode是不是element类型
  // fragment 类型只渲染 children
  const { shapeFlag, type } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ElEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
  }
}

function processComponent(vnode, container, parentComponent) {
  //挂载组件
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVNode, container, parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container, instance);
  //所有 subTree 初始化之后，将根节点的 el 赋值给组件的 el
  initialVNode.el = subTree.el;
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent);
  // updateElement(vnode, container);
}

function mountElement(vnode: any, container: any, parentComponent) {
  const { type, props, children, shapeFlag } = vnode;
  vnode.el = document.createElement(type);
  const el = vnode.el;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
  }

  for (const key in props) {
    const val = props[key];
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    }

    el.setAttribute(key, val);
  }

  container.append(el);
}

function updateElement(vnode: any, container: any) {
  throw new Error("Function not implemented.");
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container, parentComponent);
  });
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
