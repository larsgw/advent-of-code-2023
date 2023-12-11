const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n').map(row => row.split('').map(location => location === '#'))
}

const test = parse(`...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`)

function getExpandedCoordinates (coordinate, expansion, expandedCoordinates) {
  return coordinate + expandedCoordinates
    .slice(0, coordinate)
    .reduce((sum, expand) => sum + (expand ? expansion - 1 : 0), 0)
}

function distance ([x1, y1], [x2, y2], expansion, expandedColumns, expandedRows) {
  x1 = getExpandedCoordinates(x1, expansion, expandedColumns)
  x2 = getExpandedCoordinates(x2, expansion, expandedColumns)
  y1 = getExpandedCoordinates(y1, expansion, expandedRows)
  y2 = getExpandedCoordinates(y2, expansion, expandedRows)

  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function sumDistances (input, expansion) {
  // Expand space
  const expandedColumns = Array(input[0].length).fill(false)
  const expandedRows = Array(input.length).fill(false)

  for (let x = 0; x < input[0].length; x++) {
    if (input.every(row => row[x] === false)) {
      expandedColumns[x] = true
    }
  }

  for (let y = 0; y < input.length; y++) {
    if (input[y].every(location => location === false)) {
      expandedRows[y] = true
    }
  }

  const galaxies = {}
  const pairs = {}

  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      if (input[y][x]) {
        const galaxy = Object.keys(galaxies).length + 1
        galaxies[galaxy] = [x, y]
        pairs[galaxy] = []
        for (const other in pairs) {
          pairs[other].push(galaxy)
        }
      }
    }
  }

  let distanceSum = 0

  for (const a in pairs) {
    for (const b of pairs[a]) {
      distanceSum += distance(galaxies[a], galaxies[b], expansion, expandedColumns, expandedRows)
    }
  }

  return distanceSum
}

function puzzle1 (input) {
  return sumDistances(input, 2)
}

function puzzle2 (input) {
  return sumDistances(input, 1000000)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
