import { bundle } from "jsr:@deno/emit";

const result = await bundle(
  new URL("./main.ts", import.meta.url)
);

const { code } = result;

await Deno.writeTextFile("./dist/bundle.js", `(function () {${code}})()`);