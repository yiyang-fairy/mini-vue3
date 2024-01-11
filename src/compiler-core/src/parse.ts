import { NodeTypes } from "./ast";

export function baseParse(content) {
  const context = createParseContext(content);

  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any = [];

  let node;
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  }

  nodes.push(node);
  return nodes;
}

function parseInterpolation(context) {
  // {{message}} -> message

  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;

  const content = context.source.slice(0, rawContentLength).trim();

  advanceBy(context, rawContentLength + closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION, //"interpolation",
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION, //"simple_expression",
      content,
    },
  };
}

function advanceBy(context, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
  };
}

function createParseContext(content) {
  return {
    source: content,
  };
}
