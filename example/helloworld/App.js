import { h } from "../../lib/guide-mini-vue.esm.js";
export const App = {
  render() {
    //ui
    return h(
      "div",
      {
        id: "root",
        class: ["red", "weight"],
      },
      // "hi, mimi-vue"
      //  + this.msg
      // array:
      [
        h("p", { id: "p1", class: "green" }, "hihi"),
        h("p", { id: "p2", class: ["blue", "bg-red"] }, "mimimimi"),
      ]
    );
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
