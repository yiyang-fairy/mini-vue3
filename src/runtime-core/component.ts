import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  };
  return component;
}
export function setupComponent(instance: {}) {
  // initProps()  // 处理props
  // initSlots() // 处理插槽
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
  const component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult: any) {
  // setupResult 可能时 function 或者 obj
  // 如果是function 就是组件的render函数
  // 如果是 obj 就添加到组件的上下文中
  if (typeof setupResult === "object") {
    instance.setupResult = setupResult;
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const component = instance.type;
  instance.render = component.render;
}
