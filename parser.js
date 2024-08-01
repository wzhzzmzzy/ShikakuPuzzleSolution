// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars
// deno-lint-ignore no-unused-vars

const getMazeElement = () => document.getElementsByClassName('overlay')[0]
const questionParser = (el) => {
  if (!el) el = getMazeElement()
  const blocks = Array.from(el.children)
  const size = Math.sqrt(blocks.length)
  const level = size === 5 ? 1 :
    size === 10 ? 2 :
    size === 20 ? 3 :
    size === 30 ? 4 :
    size === 40 ? 5 : 6
  const question = {
    level,
    size,
    maze: []
  }

  for (const blockIdx in blocks) {
    const innerNumber = Number(blocks[blockIdx].innerHTML)
    if (isNaN(innerNumber) || !innerNumber) continue;
    const i = Math.floor(Number(blockIdx) / size)
    const j = Number(blockIdx) % size
    question.maze.push([i, j, innerNumber])
  }

  return question
}

const loc2Idx = (loc, size) => {
  const { x, y } = loc;
  return x * size + y
}
const answerDispatch = (question, answers) => {
  const mazeEl = getMazeElement()
  answers.forEach(({ ls, re }, i) => {
    const leftIndex = loc2Idx(ls, question.size)
    const rightIndex = loc2Idx(re, question.size)

    const leftEl = mazeEl.children[leftIndex]
    const rightEl = mazeEl.children[rightIndex]

    setTimeout(() => {
      leftEl.dispatchEvent(new MouseEvent('mousedown'))
      rightEl.dispatchEvent(new MouseEvent('mousemove'))
      rightEl.dispatchEvent(new MouseEvent('mouseup'))
    }, 100 * i)
  })
}
const clickStart = (only_parse = false) => {
  try {
      const startBtn = document.getElementsByClassName('start-game-container')[0]
      .getElementsByTagName('button')[0]
      startBtn.click();
  } catch (e){
     console.log('game started')
  }

  setTimeout(() => {
    window.currentQuestion = questionParser()
    if (only_parse) return;
    const startT = Date.now()
    console.log('solving')
    window.answer = new QuestionMaze(window.currentQuestion).solve()
    console.log('solved in', Date.now() - startT, 'ms')
    console.log('start writing answer!')
    answerDispatch(window.currentQuestion, window.answer)
  }, 100);
}

export {
  loc2Idx,
  answerDispatch,
  questionParser,
  clickStart
}
