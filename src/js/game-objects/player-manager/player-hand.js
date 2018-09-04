import { autorun } from "mobx";
import PlayerCard from "./player-card";
import { EventProxy, emitter, EVENT_NAMES } from "../events";
import store from "../../store/index";
import EmitterWithLogging from "../../helpers/emitter-with-logging";
import { Events } from "phaser";

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

    this.proxy = new EventProxy();

    // Local emitter that is only for hand ⟷ card interaction
    this.cardEmitter = new Events.EventEmitter();

    this.cardEmitter.on("dragstart", this.onCardDragStart, this);
    this.cardEmitter.on("drag", this.onCardDrag, this);
    this.cardEmitter.on("dragend", this.onCardDragEnd, this);
    this.cardEmitter.on("pointerover", this.onCardOver, this);
    this.cardEmitter.on("pointerout", this.onCardOut, this);

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_TURN_COMPLETE, () => {
      store.setActivePlayerCard(null);
      store.setFocusedPlayerCard(null);
    });

    this.proxy.on(emitter, EVENT_NAMES.ACTION_UNSUCCESSFUL, () => {
      store.activePlayerCard.shake();
      this.arrangeCards();
    });

    this.proxy.once(scene.events, "shutdown", this.destroy, this);
    this.proxy.once(scene.events, "destroy", this.destroy, this);

    this.dispose = autorun(() => {
      // TODO: clean this up. These are ref'd so that mobx knows which props we are observing
      const activeCard = store.activePlayerCard;
      const playerCard = store.focusedPlayerCard;

      this.updateCards();

      if (store.activePlayerCard) {
        this.cards.forEach(card => {
          if (card !== store.activePlayerCard) {
            card.disableFocusing();
            card.disableDrag();
          }
        });
      } else {
        this.cards.forEach(card => {
          card.enableFocusing();
          card.enableDrag();
        });
      }
    });
  }

  onCardDragStart(card) {
    store.setActivePlayerCard(card);
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DRAG_START, card);
  }

  onCardDrag(card) {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DRAG, card);
  }

  onCardDragEnd(card) {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DRAG_END, card);
    store.setActivePlayerCard(null);
  }

  onCardOver(card) {
    store.setFocusedPlayerCard(card);
  }

  onCardOut(card) {
    if (store.focusedPlayerCard === card) store.setFocusedPlayerCard(null);
  }

  updateCards() {
    this.cards.forEach(card => {
      // Force card to the correct state - selected cards should stay focused
      if (card === store.activePlayerCard) {
        card.focus();
        card.select();
      } else if (card === store.focusedPlayerCard) {
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
    this.cards.forEach(c => c.enableDrag());
  }

  disableSelecting() {
    this.selectingEnabled = false;
    this.cards.forEach(c => c.deselect());
    this.cards.forEach(c => c.disableDrag());
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
    const card = new PlayerCard(this.scene, cardId, 0, 0, this.cardEmitter);
    this.cards.push(card);
    if (this.selectingEnabled) {
      card.enableDrag();
      card.enableFocusing();
    }
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
    if (store.activePlayerCard) store.activePlayerCard.setDepth(this.cards.length);
    if (store.focusedPlayerCard) store.focusedPlayerCard.setDepth(this.cards.length + 1);
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
      if (card === store.activePlayerCard) store.setActivePlayerCard(null);
      this.cards = this.cards.filter(c => c !== card);
      this.deck.discard(card.type);
      this.arrangeCards();
      card.destroy();
    }
  }

  destroy() {
    this.dispose();
    this.proxy.removeAll();
    this.cardEmitter.destroy();
  }
}
