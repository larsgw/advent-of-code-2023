const fs = require('fs').promises
const path = require('path')

class Graph {
  constructor (nodes) {
    this.nodes = nodes
  }

  getDistances (g_b) {
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

    return d
  }
}

class PipeMaze extends Graph {
  constructor (string) {
    let start
    const nodes = {}
    const rows = string.trim().split('\n')
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y]
      for (let x = 0; x < row.length; x++) {
        const tile = row[x]
        if (tile === '.') {
          continue
        } else if (tile === 'S') {
          start = [x, y].toString()
          nodes[[x, y]] = new PipeNode(x, y)
        } else {
          nodes[[x, y]] = new PipeNode(x, y, tile)
        }
      }
    }

    super(nodes)
    this.start = start
    this.sizeY = rows.length
    this.sizeX = rows[0].length

    // Prune unconnected edges, add edges to start node
    for (const node in this.nodes) {
      for (const edge in this.nodes[node].edges) {
        if (!this.nodes[edge]) {
          delete this.nodes[node].edges[edge]
        } else if (edge === this.start) {
          this.nodes[edge].edges[node] = 1
        }
      }
    }

    // Set start node tile
    const startNode = this.nodes[this.start]
    const startNodeDirections = [0, 0, 0, 0]

    for (const edge in startNode.edges) {
      const [x1, y1] = startNode.id.split(',')
      const [x2, y2] = edge.split(',')
      const directions = [y2 - y1 === -1, x2 - x1 === 1, y2 - y1 === 1, x2 - x1 === -1]
      startNodeDirections[directions.indexOf(true)] = 1
    }

    switch (startNodeDirections.join('')) {
      case '1010': startNode.tile = '|'; break
      case '0101': startNode.tile = '-'; break
      case '1100': startNode.tile = 'L'; break
      case '1001': startNode.tile = 'J'; break
      case '0011': startNode.tile = '7'; break
      case '0110': startNode.tile = 'F'; break
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

class PipeNode extends Node {
  constructor (x, y, pipe) {
    let connections = []
    switch (pipe) {
      case '|': connections = [[0, -1], [0, 1]]; break
      case '-': connections = [[-1, 0], [1, 0]]; break
      case 'L': connections = [[0, -1], [1, 0]]; break
      case 'J': connections = [[-1, 0], [0, -1]]; break
      case '7': connections = [[-1, 0], [0, 1]]; break
      case 'F': connections = [[0, 1], [1, 0]]; break
    }

    const edges = {}

    for (const [dx, dy] of connections) {
      edges[[x + dx, y + dy]] = 1
    }

    super([x, y].toString(), edges)
    this.tile = pipe
  }
}

function parse (input) {
  return new PipeMaze(input)
}

const test1 = parse(`7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ`)

function puzzle1 (input) {
  const d = input.getDistances(input.start)
  return Math.max(...Object.values(d))
}

const test2 = parse(`FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`)

function puzzle2 (input) {
  // Identify main loop
  const d = input.getDistances(input.start)
  for (const node in d) {
    d[node] = true
  }

  // Count pipes in each row and column
  const tiles = {}
  const cols = Array(input.sizeX).fill(0)
  const rows = Array(input.sizeY).fill(0)

  const colDirections = Array(input.sizeX).fill(0)
  for (let y = 0; y < input.sizeY; y++) {
    for (let x = 0; x < input.sizeX; x++) {
      let rowDirection = 0

      if (d[[x, y]]) {
        const node = input.nodes[[x, y]]
        switch (node.tile) {
          case '|': rows[y]++; break
          case '-': cols[x]++; break
          case 'L':
            if (colDirections[x] === -1) {
              cols[x]++
            }
            rowDirection = -1
            colDirections[x] = 0
            break
          case 'J':
            if (colDirections[x] === 1) {
              cols[x]++
            }
            if (rowDirection === 1) {
              rows[y]++
            }
            rowDirection = 0
            colDirections[x] = 0
            break
          case '7':
            if (rowDirection === -1) {
              rows[y]++
            }
            rowDirection = 0
            colDirections[x] = -1
            break
          case 'F':
            rowDirection = 1
            colDirections[x] = 1
            break
        }
      }

      tiles[[x, y]] = [cols[x], cols[y]]
    }
  }

  // Count enclosed tiles
  let enclosedTiles = 0
  for (let y = 0; y < input.sizeY; y++) {
    let pipeCount = 0
    let pipeDirection = 0

    for (let x = 0; x < input.sizeX; x++) {
      if (d[[x, y]]) {
        switch (input.nodes[[x, y]].tile) {
          case '|': pipeCount++; break
          case 'L': pipeDirection = -1; break
          case 'F': pipeDirection = 1; break
          case 'J':
            if (pipeDirection === 1) {
              pipeCount++
            }
            pipeDirection = 0
            break
          case '7':
            if (pipeDirection === -1) {
              pipeCount++
            }
            pipeDirection = 0
            break
        }
      }

      if (!d[[x, y]] && pipeCount % 2 === 1) {
        enclosedTiles++
      }
    }
  }

  return enclosedTiles
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test1))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test2))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
