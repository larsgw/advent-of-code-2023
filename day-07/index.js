const fs = require('fs').promises
const path = require('path')

class Hand {
  CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
  TYPES = [
    'High card',
    'One pair',
    'Two pair',
    'Three of a kind',
    'Full house',
    'Four of a kind',
    'Five of a kind'
  ]

  constructor (cards, bid) {
    this.cards = cards
    this.bid = bid
  }

  getGroups () {
    const groups = {}
    for (const card of this.cards) {
      if (card in groups) {
        groups[card]++
      } else {
        groups[card] = 1
      }
    }
    return groups
  }

  getGroupSizes () {
    return Object.values(this.getGroups())
  }

  getType () {
    // Memoize
    if (this.type) {
      return this.type
    }

    const groupSizes = this.getGroupSizes()
    if (groupSizes.includes(5)) {
      this.type = 'Five of a kind'
    } else if (groupSizes.includes(4)) {
      this.type = 'Four of a kind'
    } else if (groupSizes.includes(3) && groupSizes.includes(2)) {
      this.type = 'Full house'
    } else if (groupSizes.includes(3)) {
      this.type = 'Three of a kind'
    } else if (groupSizes.includes(2) && groupSizes.length === 3) {
      this.type = 'Two pair'
    } else if (groupSizes.includes(2)) {
      this.type = 'One pair'
    } else {
      this.type = 'High card'
    }

    return this.type
  }

  compare (other) {
    const byType = this.TYPES.indexOf(this.getType()) - this.TYPES.indexOf(other.getType())

    if (byType) {
      return byType
    }

    for (let i = 0; i < 5; i++) {
      const byCard = this.CARDS.indexOf(this.cards[i]) - this.CARDS.indexOf(other.cards[i])
      if (byCard) {
        return byCard
      }
    }

    return 0
  }
}

class JokerHand extends Hand {
  CARDS = ['J', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'Q', 'K', 'A']

  getGroups () {
    const groups = super.getGroups()

    if (groups.J) {
      const [largestGroup] = Object.entries(groups)
        .filter(([card, size]) => card !== 'J')
        .sort((a, b) => b[1] - a[1])

      if (largestGroup) {
        groups[largestGroup[0]] += groups.J
        delete groups.J
      }
    }

    return groups
  }
}

function parse (input) {
  return input.trim().split('\n').map(hand => {
    const [cards, bid] = hand.split(' ')
    return [cards, parseInt(bid)]
  })
}

const test = parse(`32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`)

function puzzle (input, useJokers) {
  const handClass = useJokers ? JokerHand : Hand
  const hands = input
    .map(([cards, bid]) => new handClass(cards, bid))
    .sort((hand, other) => hand.compare(other))

  let score = 0
  for (let i = 0; i < hands.length; i++) {
    const hand = hands[i]
    const rank = i + 1
    score += hand.bid * rank
  }

  return score
}

function puzzle1 (input) {
  return puzzle(input, false)
}

function puzzle2 (input) {
  return puzzle(input, true)
}

async function main () {
  const input = parse(await fs.readFile(path.join(__dirname, 'input.txt'), 'utf8'))

  console.log('1 test:', puzzle1(test))
  console.log('1     :', puzzle1(input))

  console.log('2 test:', puzzle2(test))
  console.log('2     :', puzzle2(input))
}

main().catch(console.error)
