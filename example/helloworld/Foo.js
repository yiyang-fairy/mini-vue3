import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    return h(
      "div",
      {
        // id: "foo",
        // class: "bg-red",
      },
      "foo,  " + this.count
    );
  },
  setup(props) {
    console.log(props);
    props.count++;
  },
};
