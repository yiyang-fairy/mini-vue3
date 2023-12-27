import { getCurrentInstance } from "./component";

export function provide(key, value) {
  // 存
  const currentInstance: any = getCurrentInstance();
  if (!currentInstance) return;

  let { provides } = currentInstance;
  const parentProvides = currentInstance.parent?.provides;

  if (provides === parentProvides) {
    provides = currentInstance.provides = Object.create(parentProvides);
  }

  provides[key] = value;
}

export function inject(key, defaultValue?) {
  // 取
  const currentInstance: any = getCurrentInstance();
  if (!currentInstance) return;

  const parentProvides = currentInstance.parent.provides;

  if (key in parentProvides) {
    return parentProvides[key];
  } else if (defaultValue) {
    if (typeof defaultValue === "function") {
      return defaultValue();
    }
    return defaultValue;
  }
}
