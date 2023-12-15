const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().replace(/\n/g, '').split(',')
}

const test = parse(`rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`)

function HASH (step) {
  return [...step].reduce((value, character) => ((value + character.charCodeAt(0)) * 17) % 256, 0)
}

function puzzle1 (input) {
  return input.reduce((sum, step) => sum + HASH(step), 0)
}

function puzzle2 (input) {
  const boxes = Array(256).fill(null).map(() => [])
  const labels = {}

  for (const step of input) {
    const [, label, operation, lens] = step.match(/^([a-z]+)(-|=)([1-9]?)$/)
    const box = HASH(label)

    switch (operation) {
      case '-':
        if (boxes[box].includes(label)) {
          boxes[box].splice(boxes[box].indexOf(label), 1)
        }
        break
      case '=':
        if (!boxes[box].includes(label)) {
          boxes[box].push(label)
        }
        labels[label] = parseInt(lens)
        break
    }
  }

  let power = 0
  for (let i = 0; i < boxes.length; i++) {
    for (let j = 0; j < boxes[i].length; j++) {
      power += (i + 1) * (j + 1) * labels[boxes[i][j]]
    }
  }

  return power
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
