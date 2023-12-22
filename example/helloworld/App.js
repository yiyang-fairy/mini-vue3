import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
  render() {
    //ui
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "weight"],
        onClick: () => {
          console.log("hi");
        },
      },
      [
        h("div", {}, "hi,  " + this.msg),
        h(Foo, {
          count: 1,
        }),
      ]
      // "hi,  " + this.msg
      //
      // array:
      // [
      //   h("p", { id: "p1", class: "green" }, "hihi"),
      //   h("p", { id: "p2", class: ["blue", "bg-red"] }, "mimimimi"),
      // ]
    );
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
