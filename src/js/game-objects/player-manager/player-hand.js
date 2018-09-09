import { autorun } from "mobx";
import PlayerCard from "./player-card";
import { EventProxy, emitter, EVENT_NAMES } from "../events";
import store from "../../store";
import EmitterWithLogging from "../../helpers/emitter-with-logging";
import { Events } from "phaser";
import MobXProxy from "../../helpers/mobx-proxy";

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

    this.disableSelecting();

    this.proxy.once(scene.events, "shutdown", this.destroy, this);
    this.proxy.once(scene.events, "destroy", this.destroy, this);

    this.mobProxy = new MobXProxy();

    this.mobProxy.observe(store, "activePlayerCard", () => {
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
      this.depthSort();
    });

    this.mobProxy.observe(store, "focusedPlayerCard", () => {
      this.depthSort();
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
    store.setFocusedPlayerCard(null);
  }

  onCardOver(card) {
    store.setFocusedPlayerCard(card);
  }

  onCardOut(card) {
    if (store.focusedPlayerCard === card) store.setFocusedPlayerCard(null);
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
    return store.activeCard;
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
    this.cards.forEach((card, i) => {
      const angle = startingAngularPosition + i * angularStep;
      const x = circleX + radius * Math.cos(angle);
      const y = circleY - radius * Math.sin(angle);
      const a = startingRotation - i * angularStep;
      card.setTargetHandPlacement(x, y, a);
    });
  }

  discardCard(card) {
    if (this.cards.includes(card)) {
      if (card === store.activePlayerCard) store.setActivePlayerCard(null);
      if (card === store.focusedPlayerCard) store.setFocusedPlayerCard(null);
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
