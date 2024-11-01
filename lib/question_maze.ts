import { Question, Loc, Rect, RawPoint } from './question.ts'
import { all_multiple_numbers, repeat, same_loc, get_possible_choices } from './utils.ts'

// DEBUG GLOBAL VARIABLES
let t = 0
export let max_status: Rect[] = []

// QUESTION MAZE
export class QuestionMaze {
  question!: Question;

  debug: boolean = false
  size: number
  maze: number[][]
  maze_status: number[][] = []
  status: Rect[] = []

  constructor(question: Question, { debug = false } = {}) {
    this.question = question
    this.size = question.size
    this.debug = debug
    this.maze = repeat(() => repeat(() => 0, this.size) as number[], this.size) as number[][]
    question.maze.forEach((loc: [any, any, any]) => {
      const [x, y, n] = loc
      this.maze[x][y] = n
    })
  }

  clone() {
    const copy = new QuestionMaze(this.question)
    copy.maze_status = this.maze_status.map(i => [...i])
    copy.status = this.status.map(i => ({ ...i }))
    return copy
  }

  print() {
    this.maze.forEach(line => {
      console.log([`${line.map((i: number) => i === 0 ? '0' : i).join(' ')}`])
    })
  }

  print_status() {
    this.maze_status.forEach(line => {
      console.log([`${line.map((i: number) => i === 0 ? '0' : i).join(' ')}`])
    })
  }

  answered(i: number, j: number) {
    return this.status.some(rect => same_loc({ x: i, y: j }, rect.np))
  }

  is_valid(point: Loc) {
    const { x, y } = point;
    return (x >= 0 && x < this.size) && (y >= 0 && y < this.size)
  }

  is_area_valid(rect: Rect) {
    const { ls, re, np } = rect
    for (let i = ls.x; i <= re.x; ++i) {
      for (let j = ls.y; j <= re.y; ++j) {
        if (i === np.x && j === np.y) continue
        if (!this.is_valid({ x: i, y: j })) return false
        if (this.maze_status[i][j] && this.maze_status[i][j] !== this.maze[np.x][np.y]) return false
      }
    }
    return true
  }

  walk(np: Loc, choice: [number, number]) {
    const rects: Rect[] = []
    for (let i = np.x; i >= np.x - choice[0] + 1; --i) {
      for (let j = np.y; j >= np.y - choice[1] + 1; --j) {
        const ls = { x: i, y: j }
        const re = { x: i + choice[0] - 1, y: j + choice[1] - 1 }
        if (!this.is_valid(ls) || !this.is_valid(re)) continue
        const rect = { ls, re, np }
        if (!this.is_area_valid(rect)) continue
        rects.push(rect)
      }
    }
    return rects
  }

  flip(rect: Rect) {
    for (let x = rect.ls.x; x <= rect.re.x; ++x) {
      for (let y = rect.ls.y; y <= rect.re.y; ++y) {
        if (!this.maze_status[x][y]) this.maze_status[x][y] = -1;
      }
    }
  }

  flip_reverse(rect: Rect) {
    for (let x = rect.ls.x; x <= rect.re.x; ++x) {
      for (let y = rect.ls.y; y <= rect.re.y; ++y) {
        if (this.maze_status[x][y] === -1) this.maze_status[x][y] = 0;
      }
    }
  }

  has_block_dead() {
    for (let i = 0; i < this.size; ++i) {
      for (let j = 0; j < this.size; ++j) {
        if (this.maze_status[i][j] === 0) {
          if (this.is_block_dead({ x: i, y: j })) return true;
        }
      }
    }
    return false
  }

  is_area_empty(rect: Rect): boolean {
    const { np, ls, re } = rect
    const { x: px, y: py } = np
    for (let i = ls.x; i <= re.x; ++i) {
      for (let j = ls.y; j <= re.y; ++j) {
        if (i === px && j === py) continue
        if (this.maze_status[i][j] !== 0) return false
      }
    }
    return true
  }

  is_last_line(i: number): boolean {
    return i === this.question.maze[this.question.maze.length - 1][0]
  }

  // 查找还没有答案的数字
  active_points: RawPoint[] = []
  get_active_points() {
    if (this.active_points.length) return this.active_points
    this.active_points = this.question.maze.filter(([x, y]) => !this.status.some(({ np }) => np.x === x && np.y === y))
    return this.active_points
  }

  // 查找从某一数字到某一空格的所有可能矩形
  get_point_cover_block_choices(point: RawPoint, block: Loc) {
    const [px, py, n] = point
    const { x, y } = block
    const x_dis = Math.abs(x - px + 1)
    const y_dis = Math.abs(y - py + 1)
    // 绝对距离检查
    if (x_dis * y_dis > n) return null
    // 绝对区域检查
    if (!this.is_area_empty({
      np: { x: px, y: py},
      ls: {
        x: Math.min(x, px), y: Math.min(y, py)
      }, 
      re: {
        x: Math.max(x, px), y: Math.max(y, py)
      }
    })) {
      return null
    }

    const all_possible_choices = get_possible_choices(n, x_dis, y_dis)
    let all_possible_rects: Rect[] = []

    all_possible_choices.forEach(choice => {
      const possible_rects = this.walk({ x: px, y: py }, choice)
        .filter(rect => rect.ls.x <= x && rect.ls.y <= y && rect.re.x >= x && rect.re.y >= y)
        .filter(rect => this.is_area_empty(rect))
      all_possible_rects = all_possible_rects.concat(possible_rects)
    })

    return all_possible_rects
  }

  get_possible_points(block: Loc) {
    const active_points = this.get_active_points()

    const points_and_rects: Array<{ point: RawPoint, rects: Rect[] }> = []
    for (const point of active_points) {
      const rects = this.get_point_cover_block_choices(point, block)
      if (rects?.length) points_and_rects.push({
        point, rects
      })
    }

    return points_and_rects
  }

  // 检查某个点是否能覆盖到某个空白区域（不包括约数对检查）
  can_point_cover_block(point: RawPoint, block: Loc) {
    const [px, py, n] = point
    const { x, y } = block
    const x_dis = Math.abs(x - px + 1)
    const y_dis = Math.abs(y - py + 1)
    if (x_dis * y_dis > n) return false 
    if (this.is_area_empty({
      np: { x: px, y: py},
      ls: {
        x: Math.min(x, px), y: Math.min(y, py)
      }, 
      re: {
        x: Math.max(x, px), y: Math.max(y, py)
      }
    })) {
      return true;
    }
    return false
  }

  is_block_dead(loc: Loc): boolean {
    const active_points = this.get_active_points()
    for (const point of active_points) {
      if (this.can_point_cover_block(point, loc)) return false
    }
    return true
  }

  is_full() {
    let is_full = true
    for (let i = 0; i < this.size; ++i) {
      for (let j = 0; j < this.size; ++j) {
        is_full = is_full && this.maze_status[i][j] !== 0
      }
    }
    return is_full
  }
  
  solve_by_block(flag = -1): Rect[] | null {
    t += 1
    if (this.debug) console.log('step', t)
    if (flag === -1) {
      this.maze_status = JSON.parse(JSON.stringify(this.maze))
    }
    for (let i = 0; i < this.size; ++i) {
      for (let j = 0; j < this.size; ++j) {
        if (this.maze_status[i][j]) continue
        const possible_list = this.get_possible_points({ x: i, y: j })
        if (possible_list.length === 0) return null
        for (const { point, rects } of possible_list) {
          for (const rect of rects) {
            this.status.push(rect)
            this.flip(rect)

            const isRightAnswer = this.clone().solve_by_block(0)
            if (isRightAnswer) {
              return isRightAnswer
            } else {
              this.status.pop()
              this.flip_reverse(rect)
            }
          }
        }
        return null
      }
    }
    return this.status
  }

  solve(i = -1): null | Rect[] {
    t += 1
    if (this.debug) console.log('step', t)
    // -1 表示最外层调用
    if (i === -1) {
      this.maze_status = JSON.parse(JSON.stringify(this.maze))
      i = 0
    }

    // 按照先行后列的顺序找到下一个数字
    let j = -1
    while (i < this.size) {
      j = this.maze[i].findIndex((n, idx) => {
        return n && !this.answered(i, idx)
      })
      if (j === -1) {
        i += 1
      } else {
        break
      }
    }
    if (j === -1) return null

    const n = this.maze[i][j]
    const all_choices = all_multiple_numbers(n)

    for (const choice of all_choices) {
      const cursor = this.status.length
      const np = { x: i, y: j }
      const rects = this.walk(np, choice)

      for (const rect of rects) {
        this.status.push(rect)
        this.flip(rect)

        if (this.is_last_line(i) && this.is_full()) {
          return this.status
        }
        // const isRightAnswer = this.clone().solve(i)
        const isRightAnswer = this.has_block_dead() ? null : this.clone().solve(i)
        if (!isRightAnswer) {
          // this.status.splice(cursor, 1)
          this.status.pop()
          this.flip_reverse(rect)
        }
        else return isRightAnswer
      }
    }
    if (this.status.length > max_status.length) {
      max_status = this.status
    }
    // console.log(this.status)
    return null
  }
}
