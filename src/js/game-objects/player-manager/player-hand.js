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

    this.focusedCard = null;
    this.selectedCard = null;

    emitter.on(EVENT_NAMES.PLAYER_CARD_SELECT, card => {
      this.selectedCard = card;
      this.updateCards();
    });

    emitter.on(EVENT_NAMES.PLAYER_CARD_DESELECT, card => {
      this.selectedCard = null;
      this.updateCards();
    });

    emitter.on(EVENT_NAMES.PLAYER_CARD_FOCUS, card => {
      this.focusedCard = card;
      this.updateCards();
    });

    emitter.on(EVENT_NAMES.PLAYER_CARD_DEFOCUS, card => {
      this.focusedCard = null;
      this.updateCards();
    });

    emitter.on(EVENT_NAMES.PLAYER_TURN_COMPLETE, () => {
      this.selectedCard = null;
      this.focusedCard = null;
      this.updateCards();
    });
  }

  updateCards() {
    this.cards.forEach(card => {
      // Force card to the correct state - selected cards should stay focused
      if (card === this.selectedCard) {
        card.focus();
        card.select();
      } else if (card === this.focusedCard) {
        card.focus();
        card.deselect();
      } else {
        card.defocus();
        card.deselect();
      }
    });
    this.depthSort();
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
    this.cards.forEach((c, i) => c.setDepth(i));

    // Place focused card on top of the selected card, so that the player can still see other cards
    // while one is selected
    if (this.selectedCard) this.selectedCard.setDepth(this.cards.length);
    if (this.focusedCard) this.focusedCard.setDepth(this.cards.length + 1);
  }

  arrangeCards() {
    if (this.cards.length === 0) return;

    const { width, height } = this.scene.sys.game.config;

    // Where to place the center of the hand, e.g. the middle card if the num cards is odd
    const cx = width / 2;
    const cy = height - 104;

    // Cards are placed along a circle. The bigger radius, the closer the cards are to a straight
    // line.
    const radius = 600;
    const angularStep = 5 * (Math.PI / 180);
    const circleX = cx;
    const circleY = cy + radius;

    const startingAngularPosition = Math.PI / 2 - ((this.cards.length - 1) / 2) * angularStep;
    const startingRotation = (this.cards.length / 2) * angularStep;
    const cardHalfWidth = this.cards[0].card.width / 2;
    const cardHalfHeight = this.cards[0].card.height / 2;
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

      if (this.selectedCard === card) this.selectedCard = null;
      if (this.focusedCard === card) this.focusedCard = null;
    }
  }
}
