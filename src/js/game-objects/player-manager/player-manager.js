import PlayerHand from "./player-hand";
import { cleanupAction, runCardAction } from "./actions";
import { emitter, EVENT_NAMES } from "../game-runner";
import { DeckDisplay, DiscardPile, EndTurnButton, EnergyDisplay, PopupText } from "../hud";

import { getFontString } from "../../font";

const style = {
  font: getFontString("Chivo", { size: "24px", weight: 600 }),
  fill: "#FFF"
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

    this.energy = 0;
    this.playerHand = new PlayerHand(scene, this.deck);
    this.playerHand.drawCards(6);

    const { width, height } = scene.sys.game.config;
    this.endTurnButton = new EndTurnButton(scene, width - 80, height / 2 - 65);
    this.discardPile = new DiscardPile(scene, width - 120, height - 200);
    this.playerHandCount = scene.add
      .text(width - 120, height - 145, this.playerHand.getNumCards(), style)
      .setOrigin(0.5, 0.5);
    this.deckDisplay = new DeckDisplay(
      scene,
      width - 50,
      height - 200,
      this.deck.getNumCardsRemaining()
    );
    this.energyDisplay = new EnergyDisplay(scene, width - 50, height - 50);
  }

  async update() {
    this.drawCard();
    await this.takeActions();
  }

  /**
   * Add a card to your hand.
   */
  drawCard() {
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

  resetEnergy() {
    this.energy = 0;
    this.energyDisplay.setEnergy(this.energy);
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

  endTurn() {
    return new Promise(resolve => {
      emitter.on(EVENT_NAMES.PLAYER_TURN_END, () => {
        // If the player has more than 10 cards, they can't end their turn yet.
        if (this.playerHand.getNumCards() <= 10) {
          this.resetEnergy();
          resolve();
        } else {
          // Some UI to indicate player can't end turn yet.
          const { width, height } = this.scene.sys.game.config;
          new PopupText(this.scene, "You must have 10 cards or less to continue!", width / 4, 20);
        }
      });
    });
  }

  async takeActions() {
    this.endTurnButton.activate();
    this.playerHand.enableSelecting();

    const onSelect = card => runCardAction(this, card);
    const onComplete = card => this.discardCard(card);
    const onCancel = card => cleanupAction(card);
    const onDiscard = () => {
      const selectedCard = this.playerHand.getSelected();
      if (selectedCard) this.reclaimCard(selectedCard);
    };

    emitter.on(EVENT_NAMES.PLAYER_CARD_SELECT, onSelect, this);
    emitter.on(EVENT_NAMES.PLAYER_CARD_DESELECT, onCancel, this);
    emitter.on(EVENT_NAMES.ACTION_COMPLETE, onComplete, this);
    emitter.on(EVENT_NAMES.ACTION_CANCEL, onCancel, this);
    emitter.on(EVENT_NAMES.PLAYER_CARD_DISCARD, onDiscard, this);

    await this.endTurn();

    this.playerHand.disableSelecting();
    this.endTurnButton.deactivate();

    emitter.off(EVENT_NAMES.PLAYER_CARD_SELECT, onSelect, this);
    emitter.off(EVENT_NAMES.PLAYER_CARD_DESELECT, onCancel, this);
    emitter.off(EVENT_NAMES.ACTION_COMPLETE, onComplete, this);
    emitter.off(EVENT_NAMES.ACTION_CANCEL, onCancel, this);
    emitter.off(EVENT_NAMES.PLAYER_CARD_DISCARD, onDiscard, this);
    emitter.off(EVENT_NAMES.PLAYER_TURN_END, this);
  }
}
