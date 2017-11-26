import shuffle from 'lodash/shuffle';
import times from 'lodash/times';
import questions from './questions';
import answers from './answers';

class Deck {
  constructor(cards) {
    this.cards = shuffle([...cards]);
    this.index = 0;
  }

  draw(nbCards = 1) {
    const draw = [];
    times(nbCards, () => {
      draw.push(this.cards[this.index]);
      this.index = (this.index + 1) % this.cards.length;
    });
    return draw;
  }
}

function createQuestionDeck() {
  return new Deck(questions);
}

function createAnswerDeck() {
  return new Deck(answers);
}

export { createQuestionDeck, createAnswerDeck };
