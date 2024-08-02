import { Loc, Question, Rect } from './question.ts'
import { QuestionMaze } from './question_maze.ts'

export const getMazeElement = () => document.getElementsByClassName('overlay')[0] as HTMLDivElement

export const questionParser = (el?: HTMLDivElement) => {
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
    maze: [] as [number, number, number][]
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

const loc2Idx = (loc: Loc, size: number) => {
  const { x, y } = loc;
  return x * size + y
}

export const answerDispatch = (question: Question, answers: Rect[] | null) => {
  const mazeEl = getMazeElement()
  if (!answers) {
    console.warn('failed')
    return
  }
  answers.forEach(({ ls, re }, i) => {
    const leftIndex = loc2Idx(ls, question.size!)
    const rightIndex = loc2Idx(re, question.size!)

    const leftEl = mazeEl.children[leftIndex]
    const rightEl = mazeEl.children[rightIndex]

    setTimeout(() => {
      leftEl.dispatchEvent(new MouseEvent('mousedown'))
      rightEl.dispatchEvent(new MouseEvent('mousemove'))
      rightEl.dispatchEvent(new MouseEvent('mouseup'))
    }, 100 * i)
  })
}

let btn: HTMLButtonElement
export const clickStart = (only_parse = false) => {
  try {
      const startBtn = document.getElementsByClassName('start-game-container')[0]
      .getElementsByTagName('button')[0]
      startBtn.click();
  } catch (e){
     console.log('game started')
  }

  setTimeout(() => {
    if (btn) btn.disabled = true
    window.currentQuestion = questionParser()
    if (only_parse) return;
    const startT = Date.now()
    console.log('solving')
    window.answer = new QuestionMaze(window.currentQuestion).solve()
    console.log('solved in', Date.now() - startT, 'ms')
    console.log('start writing answer!')
    answerDispatch(window.currentQuestion, window.answer)
    if (btn) btn.disabled = false
  }, 100);
}

export const addButton = ()=>{
    if (typeof window === 'undefined') {
        console.log('no browser')
        return;
    }
    if (window.location.hostname.includes('shikakuofthe')) {
        const actionContainer = document.getElementsByClassName('actions')[0];
        btn = document.createElement('button');
        btn.className = 'button';
        btn.style.background = '#0ea5e9'; // tw-sky-500
        btn.style.width = '100%';
        btn.innerText = 'Answer'
        btn.addEventListener('click', () => {
            clickStart()
        })
        actionContainer.appendChild(btn);
    } else {
        console.log('no support website')
    }
};

declare global {
  interface Window {
    currentQuestion: Question;
    answer: Rect[] | null;
    start: typeof clickStart
  }
}