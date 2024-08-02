export enum DIFFICULTY {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  EXPERT = 4,
  MASTER = 5,
  UNKNOWN = 6
}

export interface Question {
  level: DIFFICULTY
  size: number
  maze: Array<RawPoint>
}

export interface Loc {
  x: number
  y: number
}

export interface Rect {
  np: Loc // number point
  ls: Loc // left start
  re: Loc // right end
}

export type RawPoint = [number, number, number]