import Logger from "../../helpers/logger";

/**
 * Class to represent a deck of cards (represented as IDs). Each card can in one of three places: in
 * the deck, in discard or in play.
 *
 * @export
 * @class Deck
 */
export default class Deck {
  /**
   * @param {Object[]} composition An array of objects that describes the composition of the types
   * of cards in the deck, in the form { id: 0, quantity: 10 }
   * @param {function} [shuffle=Phaser.Utils.Array.Shuffle] The function used to shuffle the array
   * of cards in place. Useful for implementing shuffles that must meet certain conditions. The
   * "top" of the cards deck array is the last element in the array.
   */
  constructor(composition, shuffle = Phaser.Utils.Array.Shuffle) {
    this.composition = composition;

    this.cardsInDeck = [];
    this.cardsInDiscard = [];
    this.cardsInPlay = [];

    // Generate the initial shuffled deck
    composition.map(({ id, quantity }) => {
      this.cardsInDeck = this.cardsInDeck.concat(new Array(quantity).fill(id));
    });
    shuffle(this.cardsInDeck);

    this.totalCardsInDeck = this.cardsInDeck.length;
  }

  /**
   * Draw a card from the deck and registers it as in play.
   *
   * @returns {*|null} The ID of the card from the deck that was just drawn, or null if no cards
   * remain.
   * @memberof Deck
   */
  draw() {
    if (this.cardsInDeck.length === 0) return null;
    else {
      const card = this.cardsInDeck.pop();
      this.cardsInPlay.push(card);
      return card;
    }
  }

  /**
   * Discard the given card, if it is found in the cards that are currently in play.
   *
   * @param {*} card The ID of the card to discard.
   * @memberof Deck
   */
  discard(card) {
    const index = this.cardsInPlay.indexOf(card);
    if (index !== -1) {
      this.cardsInPlay = [
        ...this.cardsInPlay.slice(0, index),
        ...this.cardsInPlay.slice(index + 1)
      ];
      this.cardsInDiscard.push(card);
    } else {
      Logger.warn("Attempting to discard a card that is not in the deck!");
    }
  }

  anyCardsRemaining() {
    return this.getNumCardsRemaining() !== 0;
  }

  getNumCardsRemaining() {
    return this.cardsInDeck.length;
  }

  getNumCardsDiscarded() {
    return this.cardsInDiscard.length;
  }

  getNumCardsInDeck() {
    return this.totalCardsInDeck;
  }
}
