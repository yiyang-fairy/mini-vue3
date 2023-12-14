import { isTracking, trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "./shared";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  private _rawValue: any;
  public dep;
  constructor(value) {
    // 如果value是对象， 要用reactive包裹
    this._value = convert(value);
    this._rawValue = value;
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (!hasChanged(this._rawValue, newValue)) return;

    this._rawValue = newValue;
    this._value = convert(newValue);

    triggerEffects(this.dep);
  }
}
export function ref(value) {
  return new RefImpl(value);
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}
