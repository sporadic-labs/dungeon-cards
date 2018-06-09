import PlayerHand from "./player-hand";
import runCardAction from "./actions";
import { emitter, EVENT_NAMES } from "./events";
import { DiscardPile, EndTurnButton, EnergyDisplay, PopupText } from "../hud";

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
    this.endTurnButton = new EndTurnButton(scene, width - 80, height / 2);
    this.discardPile = new DiscardPile(scene, width - 50, height - 170);
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

  discardCard(card) {
    this.playerHand.discardCard(card);
    return Promise.resolve();
  }

  async reclaimCard(card) {
    this.addEnergy(card.getEnergy())
    return await this.discardCard(card)
  }

  endTurn() {
    return new Promise(resolve => {
      emitter.on(EVENT_NAMES.END_PLAYER_TURN, () => {
        // If the player has more than 10 cards, they can't end their turn yet.
        if (this.playerHand.getNumCards() <= 10) {
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
    const onCancel = () => {};
    const onDiscard = () => {
      const selectedCard = this.playerHand.getSelected()
      if (selectedCard) this.reclaimCard(selectedCard);
    };

    emitter.on(EVENT_NAMES.PLAYER_CARD_SELECT, onSelect);
    emitter.on(EVENT_NAMES.ACTION_COMPLETE, onComplete);
    emitter.on(EVENT_NAMES.ACTION_CANCEL, onCancel);
    emitter.on(EVENT_NAMES.PLAYER_CARD_DISCARD, onDiscard);

    await this.endTurn();

    this.playerHand.disableSelecting();
    this.endTurnButton.deactivate();

    emitter.off(EVENT_NAMES.PLAYER_CARD_SELECT, onSelect);
    emitter.off(EVENT_NAMES.ACTION_COMPLETE, onComplete);
    emitter.off(EVENT_NAMES.ACTION_CANCEL, onCancel);
    emitter.off(EVENT_NAMES.PLAYER_CARD_DISCARD, onDiscard);
    emitter.off(EVENT_NAMES.END_PLAYER_TURN);  // TODO(rex): Is function needed here...?
  }
}
