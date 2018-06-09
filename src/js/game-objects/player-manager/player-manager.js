import PlayerHand from "./player-hand";
import runCardAction from "./actions";
import { emitter, EVENT_NAMES } from "./events";
import EndTurnButton from "../hud/end-turn-button";
import { EnergyDisplay } from "./hud";
import DiscardPile from "../hud/discard";

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

    this.endTurnButton = new EndTurnButton(this.scene, 620, 360);

    const { width, height } = scene.sys.game.config;
    this.energyDisplay = new EnergyDisplay(scene, width - 50, height - 50);

    this.discardPile = new DiscardPile(this.scene, 620, 600);
  }

  async update() {
    this.drawCard();
    await this.takeActions();
    // if (this.playerHand.getNumCards() > 10) {
    //   // TODO: this should be controlled by player selection, hard-coding for now
    //   await this.discardCard(this.playerHand.cards[0]);
    // }
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

  endTurn() {
    return new Promise(resolve => {
      emitter.once(EVENT_NAMES.END_PLAYER_TURN, () => resolve());
    });
  }

  async takeActions() {
    this.endTurnButton.activate();
    this.playerHand.enableSelecting();

    const onSelect = card => runCardAction(this, card);
    const onComplete = card => this.discardCard(card);
    const onCancel = () => {};

    emitter.on(EVENT_NAMES.PLAYER_CARD_SELECT, onSelect);
    emitter.on(EVENT_NAMES.ACTION_COMPLETE, onComplete);
    emitter.on(EVENT_NAMES.ACTION_CANCEL, onCancel);

    await this.endTurn();

    this.playerHand.disableSelecting();
    this.endTurnButton.deactivate();

    emitter.off(EVENT_NAMES.PLAYER_CARD_SELECT, onSelect);
    emitter.off(EVENT_NAMES.ACTION_COMPLETE, onComplete);
    emitter.off(EVENT_NAMES.ACTION_CANCEL, onCancel);
  }
}
