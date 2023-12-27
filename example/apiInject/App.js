import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";
export const App = {
  name: "App",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)]);
  },
};
const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooTwo");
    const foo = inject("foo");
    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, "ProviderTwo foo: " + this.foo),
      h(Consumer),
    ]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const hi = inject("hi", "hello");
    const ok = inject("ok", () => "ok");
    return {
      foo,
      bar,
      hi,
      ok,
    };
  },
  render() {
    return h(
      "div",
      {},
      `Consumer: - ${this.foo} - ${this.bar} -${this.hi} - ${this.ok}`
    );
  },
};
