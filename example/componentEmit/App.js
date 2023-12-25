import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
  render() {
    window.self = this;
    return h("div", {}, [
      h("div", {}, "hi,  " + this.msg),
      h(Foo, {
        onAdd(a, b, c) {
          console.log("on add", { a, b, c });
        },
        onAddFoo() {
          console.log("on add-foo");
        },
      }),
    ]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
