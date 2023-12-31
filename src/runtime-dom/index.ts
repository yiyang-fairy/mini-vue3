import { createRenderer } from "../runtime-core";

export function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevVal, nextVal) {
  const isOn = (key) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}

function insert(child, parent, anchor = null) {
  parent.insertBefore(child, anchor);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElement,
});

function remove(el) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}

function setElement(el, text) {
  el.textContent = text;
}

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core/index";
