const fs = require('fs').promises
const path = require('path')

function parse (input) {
  const [workflows, parts] = input.trim().split('\n\n').map(block => block.split('\n'))
  return {
    workflows: workflows.reduce((workflows, workflow) => {
      const [label, rules] = workflow.slice(0, -1).split('{')
      workflows[label] = rules.split(',').map(rule => {
        const ruleParts = rule.split(':')
        if (ruleParts.length === 2) {
          const [category, operator, ...value] = ruleParts[0]
          return {
            condition: {
              category,
              operator,
              value: parseInt(value.join(''))
            },
            target: ruleParts[1]
          }
        } else {
          return { target: ruleParts[0] }
        }
      })
      return workflows
    }, {}),
    parts: parts.map(part => {
      const categories = {}
      for (const partValue of part.slice(1, -1).split(',')) {
        const [category, value] = partValue.split('=')
        categories[category] = parseInt(value)
      }
      return categories
    })
  }
}

const test = parse(`px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`)

function isAccepted (part, workflows) {
  let workflow = 'in'

  while (true) {
    for (const rule of workflows[workflow]) {
      if (rule.condition) {
        const { category, operator, value } = rule.condition
        const actualValue = part[category]
        const matches = (operator === '<' && actualValue < value) || (operator === '>' && actualValue > value)
        if (!matches) {
          continue
        }
      }

      if (rule.target === 'A') {
        return true
      } else if (rule.target === 'R') {
        return false
      } else {
        workflow = rule.target
        break
      }
    }
  }
}

function puzzle1 (input) {
  let sum = 0
  for (const part of input.parts) {
    if (isAccepted(part, input.workflows)) {
      sum += part.x + part.m + part.a + part.s
    }
  }
  return sum
}

function countAccepted (part, workflows, workflow = 'in') {
  if (workflow === 'A') {
    let combinations = 1
    for (const category in part) {
      combinations *= part[category][1] - part[category][0] + 1
    }
    return combinations
  } else if (workflow === 'R') {
    return 0
  }

  let count = 0
  for (const rule of workflows[workflow]) {
    if (rule.condition) {
      const { category, operator, value } = rule.condition
      if (operator === '<') {
        if (part[category][0] < value) {
          count += countAccepted({
            ...part,
            [category]: [part[category][0], Math.min(part[category][1], value - 1)]
          }, workflows, rule.target)
        }
        if (part[category][1] >= value) {
          part = {
            ...part,
            [category]: [Math.max(part[category][0], value), part[category][1]]
          }
          continue
        }
      } else if (operator === '>') {
        if (part[category][1] > value) {
          count += countAccepted({
            ...part,
            [category]: [Math.max(part[category][0], value + 1), part[category][1]]
          }, workflows, rule.target)
        }
        if (part[category][0] <= value) {
          part = {
            ...part,
            [category]: [part[category][0], Math.min(part[category][1], value)]
          }
          continue
        }
      }
    } else {
      count += countAccepted(part, workflows, rule.target)
    }
  }
  return count
}

function puzzle2 (input) {
  return countAccepted({
    x: [1, 4000],
    m: [1, 4000],
    a: [1, 4000],
    s: [1, 4000]
  }, input.workflows)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
