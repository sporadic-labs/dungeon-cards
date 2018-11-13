import PlayerHand from "./player-hand";
import { EventProxy, emitter, EVENT_NAMES } from "../events";
import { DeckDisplay, DropTarget, EnergyDisplay } from "../hud";

import { getFontString } from "../../font";
import ScrollManager from "../hud/scroll-manager";

const MAX_HAND = 10;

export default class PlayerManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {GameBoard} gameBoard
   * @param {Deck} playerDeck
   */
  constructor(scene, gameBoard, playerDeck) {
    this.scene = scene;
    this.gameBoard = gameBoard;
    this.deck = playerDeck;
    this.proxy = new EventProxy();

    this.energy = 0;

    const { width, height } = scene.sys.game.config;
    this.deckDisplay = new DeckDisplay(
      scene,
      width - 60,
      height - 70,
      this.deck.getNumCardsRemaining()
    );

    this.playerHand = new PlayerHand(scene, this.deck, this.deckDisplay);
    this.playerHand.drawCards(6, true);

    this.toast = this.scene.toast;

    this.dropTarget = new DropTarget(scene, width / 2, height - 196);
    this.energyDisplay = new EnergyDisplay(scene, 45, height - 45);
    this.scroll = new ScrollManager(scene, width - 185, height / 2 - 148);

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DISCARD, this.discardSelectedCard, this);
    this.proxy.on(
      emitter,
      EVENT_NAMES.PLAYER_TURN_ATTEMPT_COMPLETE,
      this.attemptCompleteTurn,
      this
    );
    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  /**
   * Add a card to your hand.
   */
  async drawCard() {
    // TODO: animate the card and wait for the animation to stop before resolving the async promise
    this.playerHand.drawCard();
    this.deckDisplay.setValue(this.deck.getNumCardsRemaining());
  }

  addEnergy(amount) {
    this.energy += amount;
    this.energyDisplay.setEnergy(this.energy);
  }

  useEnergy(amount) {
    this.energy -= amount;
    if (this.energy < 0) this.energy = 0;
    this.energyDisplay.setEnergy(this.energy);
  }

  getEnergy() {
    return this.energy;
  }

  canUseCard(card) {
    return this.getEnergy() - card.getEnergy() >= 0;
  }

  resetEnergy() {
    this.energy = 0;
    this.energyDisplay.setEnergy(this.energy);
  }

  enableSelecting() {
    this.playerHand.enableSelecting();
  }

  disableSelecting() {
    this.playerHand.disableSelecting();
  }

  discardSelectedCard() {
    const selected = this.playerHand.getSelected();
    if (selected) this.reclaimCard(selected);
  }

  discardCard(card) {
    this.playerHand.discardCard(card);
    return Promise.resolve();
  }

  canDraw(numCardsToDraw) {
    return this.playerHand.getNumCards() + numCardsToDraw <= MAX_HAND;
  }

  async attemptCompleteTurn() {
    await this.discardStep();
    emitter.emit(EVENT_NAMES.PLAYER_TURN_COMPLETE);
  }

  async reclaimCard(card) {
    this.addEnergy(card.getEnergy());
    return await this.discardCard(card);
  }

  async discardStep() {
    return new Promise(resolve => {
      if (this.playerHand.getNumCards() <= MAX_HAND) {
        this.resetEnergy();
        resolve();
      } else {
        this.showToast("You must have 10 cards or less to continue!");
      }
    });
  }

  showToast(text) {
    this.toast.setMessage(text);
  }

  destroy() {
    this.proxy.removeAll();
  }
}
