const fs = require('fs').promises
const path = require('path')

function parse (input) {
  const [time, distance] = input.trim().split('\n')
    .map(line => line.split(/ +/g).slice(1).map(parseFloat))
  return { time, distance }
}

const test = parse(`Time:      7  15   30
Distance:  9  40  200`)

function puzzle1 (input) {
  let result = 1

  for (let i = 0; i < input.time.length; i++) {
    let possibilities = 0
    for (let t = 0; t < input.time[i]; t++) {
      if (t * (input.time[i] - t) > input.distance[i]) {
        possibilities++
      }
    }
    result *= possibilities
  }

  return result
}

function puzzle2 (input) {
  const time = [parseInt(input.time.join(''))]
  const distance = [parseInt(input.distance.join(''))]
  return puzzle1({ time, distance })
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
