const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n')
}

const test = parse(`467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`)

function isPartNumber (number, i, input) {
  for (let x = number.index - 1; x < number[0].length + number.index + 1; x++) {
    for (let y = i - 1; y <= i + 1; y++) {
      if (x < 0 || x >= input[i].length || y < 0 || y >= input.length) {
        continue
      }
      if (input[y][x].match(/[^.0-9]/)) {
        return true
      }
    }
  }
  return false
}

function puzzle1 (input) {
  const partNumbers = []
  for (let i = 0; i < input.length; i++) {
    for (const number of input[i].matchAll(/\d+/g)) {
      if (isPartNumber(number, i, input)) {
        partNumbers.push(parseInt(number[0]))
      }
    }
  }
  return partNumbers.reduce((a, b) => a + b)
}

function findGearSymbols (number, i, input) {
  const gears = []

  for (let x = number.index - 1; x < number[0].length + number.index + 1; x++) {
    for (let y = i - 1; y <= i + 1; y++) {
      if (x < 0 || x >= input[i].length || y < 0 || y >= input.length) {
        continue
      }
      if (input[y][x].match(/[^.0-9]/)) {
        gears.push([x, y])
      }
    }
  }

  return gears
}

function puzzle2 (input) {
  const gears = {}
  for (let i = 0; i < input.length; i++) {
    for (const number of input[i].matchAll(/\d+/g)) {
      for (const gear of findGearSymbols(number, i, input)) {
        if (!gears[gear]) {
          gears[gear] = []
        }
        gears[gear].push(parseInt(number[0]))
      }
    }
  }
  return Object.values(gears)
    .filter(gear => gear.length === 2)
    .map(([a, b]) => a * b)
    .reduce((a, b) => a + b)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
