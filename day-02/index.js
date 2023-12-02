const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n').map(game => {
    const [, id, sets] = game.match(/^Game (\d+): (.+)$/)
    return {
      id: parseInt(id),
      sets: sets.split('; ').map(
        set => set.split(', ').map(
          cube => {
            const [number, color] = cube.split(' ')
            return { number: parseInt(number), color }
          }
        )
      )
    }
  })
}

const test = parse(`Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`)

function puzzle1 (input, max) {
  return input.filter(
    game => game.sets.every(
      set => set.every(cube => cube.number <= max[cube.color])
    )
  ).map(game => game.id).reduce((a, b) => a + b)
}

function puzzle2 (input) {
  return input.map(game => {
    const max = { red: -Infinity, green: -Infinity, blue: -Infinity }
    for (const set of game.sets) {
      for (const cube of set) {
        if (cube.number > max[cube.color]) {
          max[cube.color] = cube.number
        }
      }
    }
    return max.red * max.green * max.blue
  }).reduce((a, b) => a + b)
}

const max = { red: 12, green: 13, blue: 14 }

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test, max))
  console.log('1     :', puzzle1(input, max))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
