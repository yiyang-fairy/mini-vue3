import typescript from "@rollup/plugin-typescript";
import { SourceMap } from "module";

export default {
  input: "./src/index.ts",
  output: [
    {
      format: "cjs",
      file: "lib/guide-mini-vue.cjs.js",
    },
    {
      format: "es",
      file: "lib/guide-mini-vue.esm.js",
      sourceMap: true,
    },
  ],
  plugins: [typescript()],
};
