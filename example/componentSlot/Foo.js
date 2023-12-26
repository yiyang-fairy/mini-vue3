import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    const age = 10;
    const foo = h("p", {}, "foo");
    console.log(this.$slot, "this.$slot");
    return h("div", {}, [
      renderSlots(this.$slot, "header", { age }),
      foo,
      renderSlots(this.$slot, "footer"),
    ]);
  },
  setup() {
    return {};
  },
};
