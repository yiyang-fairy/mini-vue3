import { render } from "./render";
import { createVNode } from "./vnode";

export function createApp(roootComponent) {
  return {
    //返回一个APP对象
    mount(rootContainer) {
      //先转换成虚拟节点
      //后续的逻辑操作都是根据虚拟节点做处理
      const vnode = createVNode(roootComponent);
      render(vnode, rootContainer);
    },
  };
}
