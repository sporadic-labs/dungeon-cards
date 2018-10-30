import { autorun } from "mobx";
import PlayerCard from "./player-card";
import { EventProxy, emitter, EVENT_NAMES } from "../events";
import { gameStore } from "../../store";
import EmitterWithLogging from "../../helpers/emitter-with-logging";
import { Events } from "phaser";
import MobXProxy from "../../helpers/mobx-proxy";

export default class PlayerHand {
  /**
   * @param {Phaser.Scene} scene
   * @param {Deck} deck
   * @memberof PlayerCard
   */
  constructor(scene, deck, deckDisplay) {
    this.scene = scene;
    this.deck = deck;
    this.deckDisplay = deckDisplay;
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
      gameStore.setActivePlayerCard(null);
      gameStore.setFocusedPlayerCard(null);
    });

    this.disableSelecting();

    this.proxy.once(scene.events, "shutdown", this.destroy, this);
    this.proxy.once(scene.events, "destroy", this.destroy, this);

    this.mobProxy = new MobXProxy();

    this.mobProxy.observe(gameStore, "activePlayerCard", () => {
      if (gameStore.activePlayerCard) {
        this.cards.forEach(card => {
          if (card !== gameStore.activePlayerCard) {
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
      this.depthSort();
    });

    this.mobProxy.observe(gameStore, "focusedPlayerCard", () => {
      this.depthSort();
    });
  }

  onCardDragStart(card) {
    gameStore.setActivePlayerCard(card);
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DRAG_START, card);
  }

  onCardDrag(card) {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DRAG, card);
  }

  onCardDragEnd(card) {
    emitter.emit(EVENT_NAMES.PLAYER_CARD_DRAG_END, card);
    gameStore.setActivePlayerCard(null);
    gameStore.setFocusedPlayerCard(null);
  }

  onCardOver(card) {
    gameStore.setFocusedPlayerCard(card);
  }

  onCardOut(card) {
    if (gameStore.focusedPlayerCard === card) gameStore.setFocusedPlayerCard(null);
  }

  enableSelecting() {
    this.selectingEnabled = true;
    this.cards.forEach(c => {
      c.enableDrag();
      c.enableFocusing();
    });
  }

  disableSelecting() {
    this.selectingEnabled = false;
    this.cards.forEach(c => {
      c.disableDrag();
      c.disableFocusing();
    });
  }

  getSelected() {
    return gameStore.activeCard;
  }

  getNumCards() {
    return this.cards.length;
  }

  async drawCard() {
    if (!this.deck.anyCardsRemaining()) return;
    const position = this.deckDisplay.getPosition();
    // Tell a card to animate from deck position to hand
    const cardId = this.deck.draw();
    const card = new PlayerCard(this.scene, cardId, position.x, position.y, this.cardEmitter);
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
    this.cards.forEach((c, i) => c.setDepth(this.cards.length - 1 - i));

    // Place focused card on top of the selected card, so that the player can still see other cards
    // while one is selected
    if (gameStore.activePlayerCard) gameStore.activePlayerCard.setDepth(this.cards.length);
    if (gameStore.focusedPlayerCard) gameStore.focusedPlayerCard.setDepth(this.cards.length + 1);
  }

  arrangeCards() {
    if (this.cards.length === 0) return;

    const { width, height } = this.scene.sys.game.config;

    // Where to place the center of the hand, e.g. the middle card if the num cards is odd
    const cx = width / 2;
    const cy = height - 90;

    // Cards placed along a circle, where the bigger the radius, the closer the cards are to
    // straight line
    const radius = 600;
    const angularStep = 5 * (Math.PI / 180);
    const circleX = cx;
    const circleY = cy + radius;

    // Leftmost card has the biggest angle (0 degrees on a circle is directly right). This way the
    // cards array is drawn from left-to-right on the screen starting with index 0
    const leftCardAngularPosition = Math.PI / 2 + ((this.cards.length - 1) / 2) * angularStep;
    const leftCardRotation = -(this.cards.length / 2) * angularStep;
    this.cards.forEach((card, i) => {
      const angle = leftCardAngularPosition - i * angularStep;
      const x = circleX + radius * Math.cos(angle);
      const y = circleY - radius * Math.sin(angle);
      const a = leftCardRotation + i * angularStep;
      card.setTargetHandPlacement(x, y, a);
    });
  }

  discardCard(card) {
    if (this.cards.includes(card)) {
      if (card === gameStore.activePlayerCard) gameStore.setActivePlayerCard(null);
      if (card === gameStore.focusedPlayerCard) gameStore.setFocusedPlayerCard(null);
      this.cards = this.cards.filter(c => c !== card);
      this.deck.discard(card.type);
      this.arrangeCards();
      card.destroy();
    }
  }

  destroy() {
    this.mobProxy.destroy();
    this.proxy.removeAll();
    this.cardEmitter.destroy();
  }
}
