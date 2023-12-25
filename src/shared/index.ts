export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue);
};

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str) => {
  return str ? "on" + capitalize(str) : "";
};

export const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
};
