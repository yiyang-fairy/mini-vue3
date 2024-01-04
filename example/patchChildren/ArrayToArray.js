import { ref, h } from "../../lib/guide-mini-vue.esm.js";

const nextChildren = [h("div", {}, "Hello"), h("div", {}, "B")];
const prevChildren = [h("div", {}, "Array to Array"), h("div", {}, "B")];

export const ArrayToArray = {
  name: "ArrayToArray",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
