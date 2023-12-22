import { h } from "../../lib/guide-mini-vue.esm.js";

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
      },
      "hi,  " + this.msg
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
