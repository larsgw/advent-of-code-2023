const fs = require('fs').promises
const path = require('path')

function parse (input) {
  const [instructions, graph] = input.trim().split('\n\n')
  return {
    instructions,
    graph: graph.split('\n').reduce((graph, node) => {
      const [name, next] = node.split(' = ')
      const [L, R] = next.slice(1, -1).split(', ')
      graph[name] = { L, R }
      return graph
    }, {})
  }
}

const test1 = parse(`RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`)

const test2 = parse(`LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`)

function findPath (input, position, isPathEnd) {
  let i = 0
  while (!isPathEnd(position)) {
    const instruction = input.instructions[i % input.instructions.length]
    position = input.graph[position][instruction]
    i++
  }
  return i
}

function puzzle1 (input) {
  return findPath(input, 'AAA', position => position === 'ZZZ')
}

function greatestCommonDivisor (a, b) {
  if (b === 0) {
    return a
  } else if (a > b) {
    return greatestCommonDivisor(b, a % b)
  } else if (a < b) {
    return greatestCommonDivisor(a, b % a)
  } else {
    return a
  }
}

function leastCommonMultiple (a, b) {
  return a * b / greatestCommonDivisor(a, b)
}

function puzzle2 (input) {
  const startPositions = Object.keys(input.graph).filter(node => node.endsWith('A'))
  const steps = startPositions.map(position => findPath(input, position, position => position.endsWith('Z')))
  return steps.reduce(leastCommonMultiple)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test1))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test2))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
