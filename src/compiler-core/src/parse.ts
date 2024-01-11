import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content) {
  const context = createParseContext(content);

  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any = [];

  let node;
  const s = context.source;
  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      console.log("parse element");
      node = parseElement(context);
    }
  }

  nodes.push(node);
  return nodes;
}

function parseElement(context) {
  // element
  // 解析 tag
  const element = parseTag(context, TagType.Start);

  parseTag(context, TagType.End);

  return element;
}

function parseTag(context, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];

  // 删除处理完成的代码
  advanceBy(context, match[0].length);
  advanceBy(context, 1);

  if (type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag: "div",
  };
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
