import PlayerCard from "./player-card";
import { emitter, EVENT_NAMES } from "../events";

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

    this.highlightedCard = null;

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
      this.highlightedCard = card;
      this.depthSort();
    });

    emitter.on(EVENT_NAMES.PLAYER_CARD_DEFOCUS, card => {
      card.defocus();
      this.highlightedCard = null;
      this.depthSort();
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
    return this.cards.find(card => card.selected);
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
    this.depthSort();
  }

  drawCards(numCards) {
    const numCanDraw = Math.min(this.deck.getNumCardsRemaining(), numCards);
    for (let i = 0; i < numCanDraw; i++) this.drawCard();
  }

  depthSort() {
    this.cards.forEach((c, i) => c.setDepth(this.cards.length - 1 - i));
    if (this.highlightedCard) this.highlightedCard.setDepth(this.cards.length);
  }

  arrangeCards() {
    if (this.cards.length === 0) return;

    const { width, height } = this.scene.sys.game.config;

    // Where to place the center of the hand, e.g. the middle card if the num cards is odd
    const cx = width / 2;
    const cy = height - 104;

    // Cards are placed along a circle. The bigger radius, the closer the cards are to a straight
    // line.
    const radius = 500;
    const angularStep = 5 * (Math.PI / 180);
    const circleX = cx;
    const circleY = cy + radius;

    const startingAngularPosition = Math.PI / 2 - ((this.cards.length - 1) / 2) * angularStep;
    const startingRotation = (this.cards.length / 2) * angularStep;
    const cardHalfWidth = this.cards[0].sprite.width / 2;
    const cardHalfHeight = this.cards[0].sprite.height / 2;
    this.cards.forEach((card, i) => {
      const angle = startingAngularPosition + i * angularStep;
      const x = circleX + radius * Math.cos(angle);
      const y = circleY - radius * Math.sin(angle);
      // Set position is set to expect the position to be top left, not center...
      card.setPosition(x - cardHalfWidth, y - cardHalfHeight);
      card.setRotation(startingRotation - i * angularStep);
    });
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
