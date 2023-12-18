const fs = require('fs').promises
const path = require('path')

const DIRECTIONS = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0]
}

function parse (input) {
  return input.trim().split('\n').map(instruction => {
    const [direction, steps, color] = instruction.split(' ')
    return {
      direction: DIRECTIONS[direction],
      length: parseInt(steps),
      color: color.slice(1, -1)
    }
  })
}

const test = parse(`R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`)

function insertSorted (array, insert) {
  const index = array.findLastIndex(value => value <= insert)
  if (array[index] !== insert) {
    array.splice(index + 1, 0, insert)
  }
}

function getVolume (input) {
  const verticals = []
  const xCoordinates = []
  const yCoordinates = []

  let x = 0
  let y = 0
  for (const step of input) {
    const [dx, dy] = step.direction

    if (dy) {
      verticals.push([
        dy > 0 ? y : y + dy * step.length,
        dy < 0 ? y : y + dy * step.length,
        x,
        dy
      ])
    }

    insertSorted(xCoordinates, x)
    insertSorted(yCoordinates, y)
    x += dx * step.length
    y += dy * step.length
  }

  let area = 0
  let aboveWasInside = Array(xCoordinates.length).fill(false)
  for (let i = 1; i < yCoordinates.length; i++) {
    const wasInside = aboveWasInside.slice().fill(false)
    for (let j = 1; j < xCoordinates.length; j++) {
      const x = [xCoordinates[j - 1], xCoordinates[j]]
      const y = [yCoordinates[i - 1], yCoordinates[i]]

      const crossedVerticals = verticals.filter(([y1, y2, x1]) => x1 <= x[0] && y1 <= y[0] && y2 >= y[1])
      const inside = crossedVerticals.length % 2 > 0

      if (inside) {
        let width = x[1] - x[0] + 1
        let height = y[1] - y[0] + 1

        // Overlap left
        if (wasInside[j - 1]) {
          width--
        }

        // Overlap top
        if (aboveWasInside[j]) {
          height--
        }

        area += width * height

        // Overlap top left
        if (!aboveWasInside[j] && !wasInside[j - 1] && aboveWasInside[j - 1]) {
          area--
        }

        // Overlap top right
        if (!aboveWasInside[j] && !wasInside[j + 1] && aboveWasInside[j + 1]) {
          area--
        }
      }

      wasInside[j] = inside
    }
    aboveWasInside = wasInside
  }

  return area
}

function puzzle1 (input) {
  return getVolume(input)
}

function puzzle2 (input) {
  const fixedInput = input.map(({ color }) => {
    const directionIndex = color.slice(-1)
    const direction = 'RDLU'[directionIndex]
    const length = parseInt(color.slice(1, -1), 16)
    return {
      direction: DIRECTIONS[direction],
      length
    }
  })

  return getVolume(fixedInput)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
