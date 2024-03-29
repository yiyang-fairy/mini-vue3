import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root: any, options: any = {}) {
  const context = createTransformContext(root, options);
  //  遍历 深度优先
  traverseNode(root, context);
  // 修改text content

  createRootCodegen(root, context);
  root.helpers = [...context.helpers.keys()];
}

function createRootCodegen(root, context) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = root.children[0];
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper: (key) => {
      context.helpers.set(key, 1);
    },
  };
  return context;
}

function traverseNode(node: any, context) {
  const nodeTransforms = context.nodeTransforms;
  const exitFns: any = [];
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    const onExit = transform(node, context);
    if (onExit) {
      exitFns.push(onExit);
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
      break;

    default:
      break;
  }

  for (let i = exitFns.length - 1; i >= 0; i--) {
    exitFns[i]();
  }
}

function traverseChildren(node: any, context) {
  const children = node.children;

  for (let i = 0; i < children.length; i++) {
    traverseNode(children[i], context);
  }
}
