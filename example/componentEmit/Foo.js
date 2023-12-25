import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const foo = h("p", {}, "foo");
    return h("div", {}, [btn, foo]);
  },
  setup(props, { emit }) {
    const emitAdd = () => {
      emit("add", 1, 2, "hahaha");
      emit("add-foo");
    };

    return {
      emitAdd,
    };
  },
};
