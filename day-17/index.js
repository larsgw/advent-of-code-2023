const fs = require('fs').promises
const path = require('path')

function parse (input) {
  return input.trim().split('\n').map(row => row.split('').map(parseFloat))
}

const test = parse(`2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`)

class Graph {
  constructor (nodes) {
    this.nodes = nodes
  }

  getShortestDistance (g_b, g_e) {
    const G = Object.keys(this.nodes)
    const A = new Set([g_b])
    const X = new Set(this.nodes[g_b].getNeighbors())
    const d = { [g_b]: 0, ...this.nodes[g_b].edges }

    while (X.size) {
      const [d_x, x] = [...X].reduce(([min, minNode], node) => {
        return d[node] < min ? [d[node], node] : [min, minNode]
      }, [Infinity, undefined])

      X.delete(x)
      A.add(x)

      if (x === g_e) {
        return d_x
      }

      for (const z of this.nodes[x].getNeighbors()) {
        const gew_x_z = this.nodes[x].getNeighbor(z)
        if (A.has(z)) {
          continue
        } else if (!X.has(z)) {
          X.add(z)
          d[z] = d_x + gew_x_z
        } else {
          d[z] = Math.min(d[z], d_x + gew_x_z)
        }
      }
    }
  }
}

class Node {
  constructor (id, edges) {
    this.id = id
    this.edges = edges
  }

  getNeighbors () {
    return Object.keys(this.edges)
  }

  getNeighbor (z) {
    return this.edges[z]
  }
}

function buildGraph (input, stepMin, stepMax) {
  const nodes = []
  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[0].length; x++) {
      const horizontalEdges = {}
      const verticalEdges = {}

      let leftSum = 0
      for (let e_x = x - 1; e_x >= Math.max(0, x - stepMax); e_x--) {
        leftSum += input[y][e_x]
        if (x - e_x >= stepMin) {
          horizontalEdges[[e_x, y, 'v']] = leftSum
        }
      }

      let rightSum = 0
      for (let e_x = x + 1; e_x <= Math.min(input[0].length - 1, x + stepMax); e_x++) {
        rightSum += input[y][e_x]
        if (e_x - x >= stepMin) {
          horizontalEdges[[e_x, y, 'v']] = rightSum
        }
      }

      let topSum = 0
      for (let e_y = y - 1; e_y >= Math.max(0, y - stepMax); e_y--) {
        topSum += input[e_y][x]
        if (y - e_y >= stepMin) {
          verticalEdges[[x, e_y, 'h']] = topSum
        }
      }

      let bottomSum = 0
      for (let e_y = y + 1; e_y <= Math.min(input.length - 1, y + stepMax); e_y++) {
        bottomSum += input[e_y][x]
        if (e_y - y >= stepMin) {
          verticalEdges[[x, e_y, 'h']] = bottomSum
        }
      }

      if (y === input.length - 1 && x === input[0].length - 1) {
        horizontalEdges['end'] = 0
        verticalEdges['end'] = 0
      }

      {
        const id = [x, y, 'h'].toString()
        nodes[id] = new Node(id, horizontalEdges)
      }
      {
        const id = [x, y, 'v'].toString()
        nodes[id] = new Node(id, verticalEdges)
      }
    }
  }
  nodes.start = new Node('start', { '0,0,h': 0, '0,0,v': 0 })
  nodes.end = new Node('end', {})

  return new Graph(nodes)
}

function puzzle1 (input) {
  return buildGraph(input, 1, 3).getShortestDistance('start', 'end')
}

function puzzle2 (input) {
  return buildGraph(input, 4, 10).getShortestDistance('start', 'end')
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
