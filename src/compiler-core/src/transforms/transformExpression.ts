import { NodeTypes } from "../ast";

export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = precessExpression(node.content);
  }
}
function precessExpression(node: any) {
  node.content = `_ctx.${node.content}`;
  return node;
}
