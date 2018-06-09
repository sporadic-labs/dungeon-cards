import PlayerHand from "./player-hand";
import EVENTS from "../events";
import EndTurnButton from "../hud/end-turn-button";

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
  }

  async update() {
    this.drawCard();
    await this.takeActions();
    if (this.playerHand.getNumCards() > 10) await this.discardCard();
  }

  /**
   * Add a card to your hand.
   */
  drawCard() {
    this.playerHand.drawCard();
  }

  discardCard(card) {
    this.playerHand.discardCard(card);
    return Promise.resolve();
  }

  endTurn() {
    return new Promise(resolve => {
      this.scene.events.once(EVENTS.END_PLAYER_TURN, () => resolve());
    });
  }

  async takeActions() {
    this.endTurnButton.activate();
    this.playerHand.enableSelecting();
    // Wait for player to select a card
    // Wait for second click to select target
    // Branching logic based on card
    // Click on end turn button ends the turn
    await this.endTurn();

    this.playerHand.disableSelecting();
    this.endTurnButton.deactivate();
  }
}
