const fs = require('fs').promises
const path = require('path')

class Almanac {
  constructor (seeds, maps) {
    this.seeds = seeds
    this.maps = maps
  }

  static fromString (text) {
    const [seeds, ...maps] = text.trim().split('\n\n')
    return new this(
      seeds.split(' ').slice(1).map(parseFloat),
      maps.map(map => AlmanacMap.fromString(map))
    )
  }
}

class AlmanacMap {
  constructor (name, ranges) {
    this.name = name
    this.ranges = ranges
  }

  map (source) {
    for (const range of this.ranges) {
      const destination = range.map(source)
      if (destination !== null) {
        return destination
      }
    }
    return source
  }

  mapRange (source) {
    const ranges = []
    const mappedRanges = []

    for (const range of this.ranges) {
      const destination = range.mapRange(source)
      if (destination !== null) {
        ranges.push(destination)
        mappedRanges.push(range.getSourceRange().intersect(source))
      }
    }

    // Non-mapped ranges are identity-mapped
    ranges.push(...mappedRanges.reduce((a, b) => {
      const output = []
      for (const range of a) {
        output.push(...range.subtract(b))
      }
      return output
    }, [source]))

    return ranges
  }

  static fromString (text) {
    const [name, ranges] = text.split(' map:\n')
    return new this(name, ranges.split('\n').map(range => AlmanacMapRange.fromString(range)))
  }
}

class AlmanacMapRange {
  constructor (destinationRangeStart, sourceRangeStart, rangeLength) {
    this.destinationRangeStart = destinationRangeStart
    this.sourceRangeStart = sourceRangeStart
    this.rangeLength = rangeLength
  }

  map (source) {
    if (source >= this.sourceRangeStart && source < this.sourceRangeStart + this.rangeLength) {
      return this.destinationRangeStart + source - this.sourceRangeStart
    }
    return null
  }

  mapRange (source) {
    const intersection = this.getSourceRange().intersect(source)

    if (intersection === null) {
      return null
    }

    return new Range(
      this.destinationRangeStart + intersection.start - this.sourceRangeStart,
      intersection.length
    )
  }

  getSourceRange () {
    return new Range(this.sourceRangeStart, this.rangeLength)
  }

  static fromString (text) {
    const [destinationRangeStart, sourceRangeStart, rangeLength] = text.split(' ').map(parseFloat)
    return new this(destinationRangeStart, sourceRangeStart, rangeLength)
  }
}

class Range {
  constructor (start, length) {
    if (isNaN(start)) {
      throw new RangeError('Range start is NaN')
    }
    this.start = start
    this.length = length
  }

  intersect (range) {
    const start = Math.max(range.start, this.start)
    const end = Math.min(range.start + range.length - 1, this.start + this.length - 1)
    return start <= end ? new Range(start, end - start + 1) : null
  }

  subtract (range) {
    const intersection = this.intersect(range)
    if (intersection) {
      const ranges = []
      if (intersection.start > this.start) {
        ranges.push(new Range(this.start, intersection.start - this.start))
      }
      if (intersection.start + intersection.length < this.start + this.length) {
        ranges.push(new Range(
          intersection.start + intersection.length,
          (this.start + this.length) - (intersection.start + intersection.length)
        ))
      }
      return ranges
    } else {
      return [this]
    }
  }
}

function parse (input) {
  return Almanac.fromString(input)
}

const test = parse(`seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`)

function puzzle1 (input) {
  const locations = []

  for (const seed of input.seeds) {
    let location = seed
    for (const map of input.maps) {
      location = map.map(location)
    }
    locations.push(location)
  }

  return Math.min(...locations)
}

function puzzle2 (input) {
  let locations = []

  for (let i = 0; i < input.seeds.length; i += 2) {
    locations.push(new Range(input.seeds[i], input.seeds[i + 1]))
  }

  for (const map of input.maps) {
    let ranges = []
    for (const range of locations) {
      ranges.push(...map.mapRange(range))
    }
    locations = ranges
  }

  return Math.min(...locations.map(range => range.start))
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
