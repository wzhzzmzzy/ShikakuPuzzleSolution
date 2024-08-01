import { assertEquals } from "jsr:@std/assert@1";
import { QuestionMaze } from "./lib/question_maze.ts";
import { q_0801_easy } from "./const/question_easy.ts";
import { q_0801_medium } from "./const/question_medium.ts";
import { q_0801_expert } from "./const/question_expert.ts";

Deno.test("solve maze", () => {
  console.log(new QuestionMaze(q_0801_expert).solve())
});