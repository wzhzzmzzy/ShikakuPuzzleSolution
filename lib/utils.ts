import { Loc } from './question.ts'

export const gcd: (a: number, b: number) => number = (a, b) => {
  let r = Math.min(a, b)
  while (r > 0) {
    if (a % r === 0 && b % r === 0) {
      break
    }
    r -= 1
  }
  return r
}

const all_multiple_numbers_map = new Map()
export const all_multiple_numbers: (n: number) => [number, number][] = (n) => {
  if (all_multiple_numbers_map.has(n)) return all_multiple_numbers_map.get(n)

  const r: [number, number][] = []
  const max_div = Math.floor(Math.sqrt(n))
  for (let i = 1; i <= max_div; ++i) {
    if (gcd(i, n) === i) {
      r.push([i, n / i])
      if (i < n / i) r.push([n / i, i])
    }
  }
  all_multiple_numbers_map.set(n, r)
  return r
}

export const repeat: <T extends () => number | number[]>(n: T, times: number) => (number | number[])[] = (n, times) => {
  const arr: (number | number[])[] = []

  for (let i = 0; i < times; ++i) arr.push(n())
  return arr
}

export const same_loc = (a: Loc, b: Loc) => {
  return a.x === b.x && a.y === b.y
}

/**
 * 查找当前数字的所有约数对，选出能覆盖到指定距离的
 * @param n 
 * @param x_dis 
 * @param y_dis 
 * @returns 
 */
export const get_possible_choices = (n: number, x_dis: number, y_dis: number) => {
  const all_choices = all_multiple_numbers(n)
  return all_choices.filter(choice => choice[0] >= x_dis && choice[1] >= y_dis)
}
