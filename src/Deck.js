import _ from 'lodash';

const NOT_ENOUGH_CARDS_EXCEPTION = 'NOT_ENOUGH_CARDS_EXCEPTION';

const suits = ['DIAMOND', 'CLUB', 'HEART', 'SPADE'];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];

function createDeck() {
  const deck = [];
  values.forEach((value) => {
    suits.forEach((suit) => {
      deck.push({ suit, value });
    });
  });
  return _.shuffle(deck);
}

export default class Deck {
  constructor() {
    this.cards = createDeck();
  }

  draw(nbCards) {
    if (this.cards.length < nbCards) {
      throw NOT_ENOUGH_CARDS_EXCEPTION;
    }
    const hand = [];
    _.times(nbCards, () => {
      hand.push(this.cards.pop());
    });
    return hand;
  }
}
