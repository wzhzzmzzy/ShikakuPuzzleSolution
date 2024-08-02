import { clickStart, addButton } from "./lib/browser.ts";

const prepare = () => {
  window.start = clickStart
  window.onload = () => {
    // setTimeout(() => {
      addButton()
    // }, 500)
  }
  console.log("loaded, use `window.start()` and the question solved")
}

if (typeof window !== 'undefined') {
  prepare()
}