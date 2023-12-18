import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  //调用patch 方法, 方便后续递归调用
  patch(vnode, container);
}

function patch(vnode, container) {
  //处理组件

  //判断是不是element类型
  processComponent(vnode, container);
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
