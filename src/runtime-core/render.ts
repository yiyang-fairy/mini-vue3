import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    patchProp: hostPatchProp,
  } = options;

  function render(vnode, container) {
    //调用patch 方法, 方便后续递归调用
    patch(null, vnode, container, null);
  }

  // n1 代表之前的虚拟节点， n2 代表现在的虚拟节点
  // n1 不存在表示是初始化， n1 存在表示是更新
  function patch(n1, n2, container, parentComponent) {
    //处理组件

    //判断vnode是不是element类型
    // fragment 类型只渲染 children
    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ElEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
    }
  }

  function processComponent(n1, n2, container, parentComponent) {
    //挂载组件
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        // 初始化
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance);
        //所有 subTree 初始化之后，将根节点的 el 赋值给组件的 el
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        //更新
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const precSubTree = instance.subTree;
        instance.subTree = subTree;
        console.log({ subTree, precSubTree });
        patch(precSubTree, subTree, container, instance);
      }
    });
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      // updateElement(vnode, container);
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    console.log({ n1, n2 }, "patch element");
    // 对比 props
    // 对比 children
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = vnode;
    vnode.el = hostCreateElement(type);
    const el = vnode.el;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, val);
    }

    hostInsert(el, container);
  }

  function updateElement(vnode: any, container: any) {
    throw new Error("Function not implemented.");
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  return {
    createApp: createAppAPI(render),
  };
}
