import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{message }}");
      console.log(ast, "111111111111");
      // const text = ast.children[0];

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
      // expect(1).toBe(2);

      // expect(text).toStrictEqual({
      //   type: NodeTypes.TEXT,
      //   content: "some text",
      // });
    });
  });
});
