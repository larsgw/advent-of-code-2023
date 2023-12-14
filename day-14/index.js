const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n').map(row => row.split(''))
}

const test = parse(`O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`)

const DIRECTIONS = {
  N: [0, -1],
  E: [1, 0],
  S: [0, 1],
  W: [-1, 0]
}

function tilt (platform, [dx, dy]) {
  platform = platform.map(row => row.slice())

  let change = true
  while (change) {
    change = false
    for (let y = 0; y < platform.length; y++) {
      for (let x = 0; x < platform[y].length; x++) {
        if (platform[y][x] === 'O' && platform[y + dy]?.[x + dx] === '.') {
          platform[y + dy][x + dx] = 'O'
          platform[y][x] = '.'
          change = true
        }
      }
    }
  }

  return platform
}

function getLoad (platform) {
  let load = 0
  for (let y = 0; y < platform.length; y++) {
    for (const tile of platform[y]) {
      if (tile === 'O') {
        load += platform.length - y
      }
    }
  }
  return load
}

function puzzle1 (input) {
  return getLoad(tilt(input, DIRECTIONS.N))
}

function puzzle2 (input) {
  const totalCycles = 1000000000
  const seen = { [input]: 0 }

  for (let cycles = 0; cycles < totalCycles; cycles++) {
    input = tilt(input, DIRECTIONS.N)
    input = tilt(input, DIRECTIONS.W)
    input = tilt(input, DIRECTIONS.S)
    input = tilt(input, DIRECTIONS.E)

    if (seen.hasOwnProperty(input)) {
      const remainingCycles = totalCycles - cycles
      const repeatLength = cycles - seen[input]
      cycles += remainingCycles - (remainingCycles % repeatLength)
    } else {
      seen[input] = cycles
    }
  }

  return getLoad(input)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
