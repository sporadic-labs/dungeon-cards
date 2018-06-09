import PlayerHand from "./player-hand";
import EVENTS from "../events";

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

    this.scene.events.addListener(EVENTS.END_PLAYER_TURN, () => {
      console.log(`Player manager: End Player Turn`);
    });
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

  discardCard() {
    this.playerHand.discardCard();
    return Promise.resolve();
  }

  endTurn() {
    // Tell the GameManager to start the next game loop
    return new Promise(resolve => setTimeout(resolve, 5000));
  }

  async takeActions() {
    this.playerHand.enableSelecting();
    // Wait for player to select a card
    // Wait for second click to select target
    // Branching logic based on card
    // Click on end turn button ends the turn
    await this.endTurn();
    this.playerHand.disableSelecting();
  }
}
