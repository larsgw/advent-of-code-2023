const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n').map(row => {
    const [springs, groups] = row.split(' ')
    return {
      springs: springs.split(''),
      groups: groups.split(',').map(parseFloat)
    }
  })
}

const test = `???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`

function factorial (n) {
  let product = 1n
  while (n > 0n) {
    product *= n--
  }
  return product
}

function binomial (n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k))
}

function solve (springs, groups, recordsLeft, cache) {
  if (cache[[springs, groups, recordsLeft]] !== undefined) {
    return cache[[springs, groups, recordsLeft]]
  }

  if (groups.length === 0 || springs.length === 0 || recordsLeft === 0) {
    return springs.length === recordsLeft && springs.every(spring => spring !== '#') ? 1n : 0n
  }

  if (recordsLeft < groups.length) {
    return 0n
  }

  if (springs.every(spring => spring === '?')) {
    return binomial(BigInt(recordsLeft), BigInt(groups.length))
  }

  let arrangementCount = 0n
  for (let i = 1; i <= recordsLeft; i++) {
    if (springs[i - 1] === '#') {
      break
    }
    if (springs.slice(i, i + groups[0]).every(spring => spring !== '.')) {
      arrangementCount += solve(springs.slice(i + groups[0]), groups.slice(1), recordsLeft - i, cache)
    }
  }

  cache[[springs, groups, recordsLeft]] = arrangementCount

  return arrangementCount
}

function countArrangements (springs, groups) {
  springs = ['.', ...springs]

  const cache = {}
  const records = springs.length
  const recordsUsed = groups.reduce((a, b) => a + b)
  return solve(springs, groups, records - recordsUsed, cache)
}

function countAllArrangements (input) {
  let arrangementCount = 0n
  for (const { springs, groups } of parse(input)) {
    arrangementCount += countArrangements(springs, groups)
  }
  return arrangementCount
}

function puzzle1 (input) {
  return countAllArrangements(input)
}

function puzzle2 (input) {
  input = input.replace(/([.#?]+)/g, '$1?$1?$1?$1?$1').replace(/([0-9,]+)/g, '$1,$1,$1,$1,$1')
  return countAllArrangements(input)
}

async function main () {
  const input = await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8')

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
