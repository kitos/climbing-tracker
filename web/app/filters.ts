import { grades } from '~/problem'

export type IProblemFilter = 'gym_grade' | 'hide_sent'

export let parseGrade = (
  grade: string,
  { min: dMin = 0, max: dMax = grades.length - 1 } = {}
): [number, number] => {
  let [min, max] = grade.split(',').map((v) => Number(v))
  return [min || dMin, max || dMax]
}

export let isDefaultGrade = ([min, max]: [number, number]) =>
  min === 0 && max === grades.length - 1

export const MIN_GYM_GRADE = 1
export const MAX_GYM_GRADE = 8

export let parseGymGrade = (gg: string) =>
  parseGrade(gg, { min: MIN_GYM_GRADE, max: MAX_GYM_GRADE })

export let isDefaultGymGrade = ([min, max]: [number, number]) =>
  min === MIN_GYM_GRADE && max === MAX_GYM_GRADE
