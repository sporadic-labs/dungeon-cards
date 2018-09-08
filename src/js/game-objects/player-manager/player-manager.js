import PlayerHand from "./player-hand";
import { EventProxy, emitter, EVENT_NAMES } from "../events";
import { DeckDisplay, DropTarget, EnergyDisplay, PopupText } from "../hud";

import { getFontString } from "../../font";
import Scroll from "../hud/scroll";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#E5E0D6"
};

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
    this.playerHand = new PlayerHand(scene, this.deck);
    this.playerHand.drawCards(6);

    this.showTooManyCardsMessage = true; // Any better ideas?

    const { width, height } = scene.sys.game.config;
    this.dropTarget = new DropTarget(scene, 60, height - 150);
    this.playerHandCount = scene.add
      .text(width / 2, height - 24, this.playerHand.getNumCards(), style)
      .setOrigin(0.5, 0.5);
    this.deckDisplay = new DeckDisplay(
      scene,
      width - 60,
      height - 70,
      this.deck.getNumCardsRemaining()
    );
    this.energyDisplay = new EnergyDisplay(scene, 45, height - 45);
    this.scroll = new Scroll(scene, width - 185, height / 2 - 90);

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
    if (selected) this.reclaimCard(selected);
  }

  discardCard(card) {
    this.playerHand.discardCard(card);
    this.playerHandCount.setText(this.playerHand.getNumCards());
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
      } else if (this.showTooManyCardsMessage) {
        this.showTooManyCardsMessage = false;
        // Some UI to indicate player can't end turn yet.
        const { width, height } = this.scene.sys.game.config;
        new PopupText(
          this.scene,
          "You must have 10 cards or less to continue!",
          width / 4,
          20,
          null,
          () => {
            this.showTooManyCardsMessage = true;
          }
        );
      }
    });
  }

  destroy() {
    this.proxy.removeAll();
  }
}
