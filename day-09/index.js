const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n').map(sequence => sequence.split(' ').map(parseFloat))
}

const test = parse(`0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`)

function extrapolate (sequence) {
  const ends = []

  while (!sequence.every(part => part === 0)) {
    ends.push(sequence[sequence.length - 1])
    sequence = sequence.slice(1).map((a, i) => a - sequence[i])
  }

  return ends.reduce((a, b) => a + b)
}

function puzzle1 (input) {
  return input.reduce((sum, sequence) => sum + extrapolate(sequence), 0)
}

function extrapolateBackwards (sequence) {
  const starts = []

  while (!sequence.every(part => part === 0)) {
    starts.push(sequence[0])
    sequence = sequence.slice(1).map((a, i) => a - sequence[i])
  }

  return starts.reverse().reduce((a, b) => b - a)
}

function puzzle2 (input) {
  return input.reduce((sum, sequence) => sum + extrapolateBackwards(sequence), 0)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
