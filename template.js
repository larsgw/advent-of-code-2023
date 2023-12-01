const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n')
}

const test = parse(``)

function puzzle1 (input) {
  return 0
}

function puzzle2 (input) {
  return 0
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
