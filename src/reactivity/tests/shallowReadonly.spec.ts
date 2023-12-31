import { isReactive, isReadonly, readonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReactive(props.n)).toBe(false);
  });
  it("warn when call set", () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
    });
    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
  });
});
