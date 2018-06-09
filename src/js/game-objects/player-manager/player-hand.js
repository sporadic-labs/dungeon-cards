import PlayerCard from "../player-card";
import EVENTS from "../events";

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

    this.scene.events.on(EVENTS.SELECT_PLAYER_CARD, card => {
      this.cards.forEach(c => c.deselect());
      card.select();
    });
    this.scene.events.on(EVENTS.DESELECT_PLAYER_CARD, card => {
      card.deselect();
    });
  }

  enableSelecting() {
    this.cards.forEach(c => c.enableSelecting());
  }

  disableSelecting() {
    this.cards.forEach(c => c.deselect());
    this.cards.forEach(c => c.disableSelecting());
  }

  getNumCards() {
    return this.cards.length;
  }

  drawCard() {
    if (!this.deck.anyCardsRemaining()) return;
    // Tell a card to animate from deck position to hand
    const cardId = this.deck.draw();
    this.cards.push(new PlayerCard(this.scene, cardId, 0, 0));
    this.arrangeCards();
  }

  drawCards(numCards) {
    const numCanDraw = Math.min(this.deck.getNumCardsRemaining(), numCards);
    for (let i = 0; i < numCanDraw; i++) this.drawCard();
  }

  arrangeCards() {
    const x = 0;
    const y = 550;
    this.cards.forEach((card, i) =>
      // 2D grid with 6 columns
      card.setPosition(x + 74 * (i % 6), y + 100 * Math.floor(i / 6))
    );
  }

  discardCard(card) {
    // TODO: this shouldn't be hardcoded. It should be passed in by the UX flow.
    card = this.cards[0];
    if (this.cards.includes(card)) {
      this.cards = this.cards.filter(c => c !== card);
      this.deck.discard(card.type);
      this.arrangeCards();
      card.destroy();
    }
  }
}
