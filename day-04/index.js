const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n').map(card => {
    const [winning, numbers] = card.split(': ')[1].split(' | ')
      .map(numbers => numbers.trim().split(/ +/g).map(parseFloat))
    return { winning, numbers }
  })
}

const test = parse(`Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`)

function puzzle1 (input) {
  return input.reduce((sum, card) => {
    const winningNumbers = card.numbers.filter(number => card.winning.includes(number))
    return winningNumbers.length > 0 ? sum + 2 ** (winningNumbers.length - 1) : sum
  }, 0)
}

function puzzle2 (input) {
  const cardCounts = Array(input.length).fill(1)
  for (let i = 0; i < input.length; i++) {
    const card = input[i]
    const winningNumbers = card.numbers.filter(number => card.winning.includes(number)).length
    for (let j = i + 1; j < Math.min(i + winningNumbers + 1, input.length); j++) {
      cardCounts[j] += cardCounts[i]
    }
  }
  return cardCounts.reduce((a, b) => a + b)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
