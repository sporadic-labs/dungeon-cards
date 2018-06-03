import Logger from "../../helpers/logger";

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
  }

  update() {
    this.drawCard();
    this.takeActions();
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  drawCard() {
    // Tell a card to animate from deck position to hand
  }

  takeActions() {
    // Wait for player to select a card
    // Wait for second click to select target
    // Branching logic based on card
    // Click on end turn button ends the turn
  }
}
