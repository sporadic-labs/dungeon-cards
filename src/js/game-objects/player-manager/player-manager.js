import PlayerHand from "./player-hand";
import { EventProxy, emitter, EVENT_NAMES } from "../events";
import { DeckDisplay, DiscardPile, EndTurnButton, EnergyDisplay, PopupText } from "../hud";

import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#FFC936"
};

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
    this.playerHand = new PlayerHand(scene, this.deck);
    this.playerHand.drawCards(6);

    this.showTooManyCardsMessage = true; // Any better ideas?

    const { width, height } = scene.sys.game.config;
    this.discardPile = new DiscardPile(scene, width - 136, height - 160);
    this.playerHandCount = scene.add
      .text(width / 2, height - 24, this.playerHand.getNumCards(), style)
      .setOrigin(0.5, 0.5);
    this.deckDisplay = new DeckDisplay(
      scene,
      width - 64,
      height - 160,
      this.deck.getNumCardsRemaining()
    );
    this.energyDisplay = new EnergyDisplay(scene, width - 60, height - 56);

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DISCARD, this.discardSelectedCard, this);
  }

  /**
   * Add a card to your hand.
   */
  async drawCard() {
    // TODO: animate the card and wait for the animation to stop before resolving the async promise
    this.playerHand.drawCard();
    this.playerHandCount.setText(this.playerHand.getNumCards());
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
    if (selected) this.discardCard(selected);
  }

  discardCard(card) {
    this.playerHand.discardCard(card);
    this.playerHandCount.setText(this.playerHand.getNumCards());
    return Promise.resolve();
  }

  async reclaimCard(card) {
    this.addEnergy(card.getEnergy());
    return await this.discardCard(card);
  }

  async discardStep() {
    return new Promise(resolve => {
      if (this.playerHand.getNumCards() <= 10) {
        this.resetEnergy();
        resolve();
      } else {
        // Some UI to indicate player can't end turn yet.
        const { width, height } = this.scene.sys.game.config;
        new PopupText(this.scene, "You must have 10 cards or less to continue!", width / 4, 20);
        this.enableSelecting();
      }
    });
  }
}
