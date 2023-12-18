import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private getter: any;
  private lock = false; // 懒执行，不是第一次获取就锁起来,依赖的响应式的值变化时解锁
  private _value;
  private effect;
  constructor(getter) {
    this.getter = getter;
    this.effect = new ReactiveEffect(getter, () => {
      if (this.lock) {
        this.lock = false;
      }
    });
  }
  get value() {
    if (!this.lock) {
      this.lock = true;
      this._value = this.effect.run();
    }

    return this._value;
  }
}
export function computed(getter) {
  return new ComputedRefImpl(getter);
}
