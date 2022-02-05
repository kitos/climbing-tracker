export let grades = [
  { v: 'VB', font: '3' },
  { v: 'V0', font: '4' },
  { v: 'V1', font: '5' },
  { v: 'V2', font: '5+' },
  { v: 'V3', font: '6a' },
  { v: 'V3', font: '6a+' },
  { v: 'V4', font: '6b' },
  { v: 'V4', font: '6b+' },
  { v: 'V5', font: '6c' },
  { v: 'V5', font: '6c+' },
  { v: 'V6', font: '7a' },
  { v: 'V7', font: '7a+' },
  { v: 'V8', font: '7b' },
  { v: 'V9', font: '7b+' },
  { v: 'V9', font: '7c' },
  { v: 'V10', font: '7c+' },
  { v: 'V11', font: '8a' },
  { v: 'V12', font: '8a+' },
  { v: 'V13', font: '8b' },
  { v: 'V14', font: '8b+' },
  { v: 'V15', font: '8c' },
  { v: 'V16', font: '8c+' },
  { v: 'V17', font: '9a' },
]

export const colors = [
  { name: 'gray', hex: '#9c9c9c', textColor: '#000' },
  { name: 'yellow', hex: '#ffef62', textColor: '#000' },
  { name: 'red', hex: '#f6685e', textColor: '#000' },
  { name: 'orange', hex: '#ffac33', textColor: '#000' },
  { name: 'green', hex: '#6fbf73', textColor: '#000' },
  { name: 'cyan', hex: '#33c9dc', textColor: '#000' },
  { name: 'blue', hex: '#2196f3', textColor: '#000' },
  { name: 'purple', hex: '#af52bf', textColor: '#fff' },
  { name: 'white', hex: '#fff', textColor: '#000' },
  { name: 'black', hex: '#212121', textColor: '#fff' },
]

export const holdTypes = ['jug', 'crimp', 'pinch', 'sloper', 'pocket', 'volume']

export let avg = (values: number[]) =>
  values.reduce((sum, v) => sum + v, 0) / values.length

export let avgGrade = (sends: { grade: number }[]) =>
  Math.round(avg(sends.map((s) => s.grade)))
