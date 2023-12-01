const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n')
}

const test = parse(`1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`)

function puzzle1 (input) {
  return input.reduce(
    (sum, line) => sum + parseInt(
      line.match(/(?<=^\D*)\d/)[0] +
      line.match(/\d(?=\D*$)/)[0]
    ),
    0
  )
}

const digits = [null, 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

function puzzle2 (input) {
  return input.reduce((sum, line) => {
      const regex = /(\d|one|two|three|four|five|six|seven|eight|nine)/g
      const matches = []
      let match
      while (match = regex.exec(line)) {
        matches.push(match[0].length === 1 ? match[0] : digits.indexOf(match[0]).toString())
        regex.lastIndex = match.index + 1
      }

      return sum + parseInt(matches[0] + matches.pop())
  }, 0)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  // console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
