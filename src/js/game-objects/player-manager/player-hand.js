import PlayerCard from "./player-card";
import { emitter, EVENT_NAMES } from "./events";

export default class PlayerHand {
  /**
   * @param {Phaser.Scene} scene
   * @param {Deck} deck
   * @memberof PlayerCard
   */
  constructor(scene, deck) {
    this.scene = scene;
    this.deck = deck;
    this.cards = [];
    this.selectingEnabled = false;

    emitter.on(EVENT_NAMES.PLAYER_CARD_SELECT, card => {
      this.cards.forEach(c => c.deselect());
      card.select();
    });

    emitter.on(EVENT_NAMES.PLAYER_CARD_DESELECT, card => {
      card.deselect();
    });

    emitter.on(EVENT_NAMES.PLAYER_CARD_FOCUS, card => {
      this.cards.forEach(c => c.defocus());
      card.focus();
    });

    emitter.on(EVENT_NAMES.PLAYER_CARD_DEFOCUS, card => {
      card.defocus();
    });
  }

  enableSelecting() {
    this.selectingEnabled = true;
    this.cards.forEach(c => c.enableSelecting());
  }

  disableSelecting() {
    this.selectingEnabled = false;
    this.cards.forEach(c => c.deselect());
    this.cards.forEach(c => c.disableSelecting());
  }

  getSelected() {
    return this.cards.find(card => card.selected)
  }

  getNumCards() {
    return this.cards.length;
  }

  drawCard() {
    if (!this.deck.anyCardsRemaining()) return;
    // Tell a card to animate from deck position to hand
    const cardId = this.deck.draw();
    const card = new PlayerCard(this.scene, cardId, 0, 0);
    this.cards.push(card);
    if (this.selectingEnabled) card.enableSelecting();
    this.arrangeCards();
  }

  drawCards(numCards) {
    const numCanDraw = Math.min(this.deck.getNumCardsRemaining(), numCards);
    for (let i = 0; i < numCanDraw; i++) this.drawCard();
  }

  arrangeCards() {
    const x = 200;
    const y = 580;
    const col = 6;
    this.cards.forEach((card, i) =>
      // 2D grid with 6 columns
      card.setPosition(x + 68 * (i % col), y + 100 * Math.floor(i / col))
    );
  }

  discardCard(card) {
    if (this.cards.includes(card)) {
      this.cards = this.cards.filter(c => c !== card);
      this.deck.discard(card.type);
      this.arrangeCards();
      card.destroy();
    }
  }
}
