import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    patchProp: hostPatchProp,
    remove: hostRemove,
    setElement: hostSetElementText,
  } = options;

  function render(vnode, container) {
    //调用patch 方法, 方便后续递归调用
    patch(null, vnode, container, null, null);
  }

  // n1 代表之前的虚拟节点， n2 代表现在的虚拟节点
  // n1 不存在表示是初始化， n1 存在表示是更新
  function patch(n1, n2, container, parentComponent, anchor) {
    //处理组件

    //判断vnode是不是element类型
    // fragment 类型只渲染 children
    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ElEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    //挂载组件
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        // 初始化
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance, anchor);
        //所有 subTree 初始化之后，将根节点的 el 赋值给组件的 el
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        //更新
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const precSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(precSubTree, subTree, container, instance, anchor);
      }
    });
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      // updateElement(vnode, container);
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log({ n1, n2 }, "patchElement");
    const el = (n2.el = n1.el);
    // 对比 props
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    patchProps(oldProps, newProps, el);
    // 对比 children
    patchChildren(n1, n2, el, parentComponent, anchor);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;
    console.log({ c1, c2, prevShapeFlag, shapeFlag }, "patchChildren");
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 先把老的 children 清空
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    console.log({ i, e1, e2 });

    // 当新数组比老数组多的时候，需要挂载
    if (i > e1) {
      if (i <= e2) {
        const anchor = e2 + 1 < c2.length ? c2[e2 + 1].el : null;
        patch(null, c2[i], container, parentComponent, anchor);
      }
    } else if (i > e2) {
      // 当老数组比新数组多的时候，需要卸载
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 乱序部分
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      hostRemove(el);
    }
  }

  function patchProps(oldProps, newProps, el) {
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode;
    vnode.el = hostCreateElement(type);
    const el = vnode.el;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }

    hostInsert(el, container);
  }

  function updateElement(vnode: any, container: any) {
    throw new Error("Function not implemented.");
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
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
