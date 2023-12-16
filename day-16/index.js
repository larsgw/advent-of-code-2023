const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n')
}

const test = parse(`.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`)

function countEnergizedTiles (input, start) {
  const tiles = {}
  const seenLights = {}
  let lights = [start]

  while (lights.length) {
    const newLights = []

    for (const { x, y, dx, dy } of lights) {
      switch (input[y + dy]?.[x + dx]) {
        case '/':
          newLights.push({ x: x + dx, y: y + dy, dx: -dy, dy: -dx })
          break
        case '\\':
          newLights.push({ x: x + dx, y: y + dy, dx: dy, dy: dx })
          break
        case '-':
          if (dx) {
            newLights.push({ x: x + dx, y: y + dy, dx: dx, dy: 0 })
          } else {
            newLights.push({ x: x + dx, y: y + dy, dx: -1, dy: 0 })
            newLights.push({ x: x + dx, y: y + dy, dx: 1, dy: 0 })
          }
          break
        case '|':
          if (dy) {
            newLights.push({ x: x + dx, y: y + dy, dx: 0, dy: dy })
          } else {
            newLights.push({ x: x + dx, y: y + dy, dx: 0, dy: -1 })
            newLights.push({ x: x + dx, y: y + dy, dx: 0, dy: 1 })
          }
          break
        case '.':
          newLights.push({ x: x + dx, y: y + dy, dx: dx, dy: dy })
          break
      }
    }

    lights = []
    for (const { x, y, dx, dy } of newLights) {
      if (!seenLights[[x, y, dx, dy]]) {
        lights.push({ x, y, dx, dy })
        seenLights[[x, y, dx, dy]] = true
        tiles[[x, y]] = true
      }
    }
  }

  return Object.keys(tiles).length
}

function puzzle1 (input) {
  return countEnergizedTiles(input, { x: -1, y: 0, dx: 1, dy: 0 })
}

function puzzle2 (input) {
  let highestEnergization = -Infinity

  for (let y = 0; y < input.length; y++) {
    const left = countEnergizedTiles(input, { x: -1, y, dx: 1, dy: 0 })
    const right = countEnergizedTiles(input, { x: input[y].length, y, dx: -1, dy: 0 })
    highestEnergization = Math.max(highestEnergization, left, right)
  }

  for (let x = 0; x < input[0].length; x++) {
    const top = countEnergizedTiles(input, { x, y: -1, dx: 0, dy: 1 })
    const bottom = countEnergizedTiles(input, { x, y: input.length, dx: 0, dy: -1 })
    highestEnergization = Math.max(highestEnergization, top, bottom)
  }

  return highestEnergization
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
