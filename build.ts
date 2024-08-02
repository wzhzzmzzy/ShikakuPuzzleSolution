import { bundle } from "jsr:@deno/emit";

const result = await bundle(
  new URL("./main.ts", import.meta.url)
);

const { code } = result;

const scriptHeader = `// ==UserScript==
// @name         Daily shikaku puzzles
// @namespace    http://tampermonkey.net/
// @version      2024-08-01
// @description  try to take over the world!
// @author       You
// @match        https://shikakuofthe.day/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shikakuofthe.day
// @grant        none
// ==/UserScript==`

await Deno.writeTextFile("./dist/bundle.js", `${scriptHeader}
(function () {${code}})()
`);