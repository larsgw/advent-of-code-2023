const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n\n').map(pattern => pattern.split('\n'))
}

const test = parse(`#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`)

function getVerticalReflectivity (pattern) {
  return Array(pattern[0].length - 1).fill(0).map((_, x) => {
    let smudges = 0
    for (let y = 0; y < pattern.length; y++) {
      for (let i = 0; x - i >= 0 && x + i + 1 < pattern[y].length; i++) {
        if (pattern[y][x - i] !== pattern[y][x + i + 1]) {
          smudges++
        }
      }
    }
    return smudges
  })
}

function getHorizontalReflectivity (pattern) {
  return Array(pattern.length - 1).fill(0).map((_, y) => {
    let smudges = 0
    for (let x = 0; x < pattern[y].length; x++) {
      for (let i = 0; y - i >= 0 && y + i + 1 < pattern.length; i++) {
        if (pattern[y - i][x] !== pattern[y + i + 1][x]) {
          smudges++
        }
      }
    }
    return smudges
  })
}

function summarizePatterns (input, smudges) {
  let sum = 0
  for (const pattern of input) {
    const verticalReflections = getVerticalReflectivity(pattern)
    if (verticalReflections.includes(smudges)) {
      sum += verticalReflections.indexOf(smudges) + 1
    }

    const horizontalReflections = getHorizontalReflectivity(pattern)
    if (horizontalReflections.includes(smudges)) {
      sum += 100 * (horizontalReflections.indexOf(smudges) + 1)
    }
  }
  return sum
}

function puzzle1 (input) {
  return summarizePatterns(input, 0)
}

function puzzle2 (input) {
  return summarizePatterns(input, 1)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
