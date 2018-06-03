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

  async update() {
    this.drawCard();
    await this.takeActions();
  }

  drawCard() {
    // Tell a card to animate from deck position to hand
  }

  endTurn() {
    // Tell the GameManager to start the next game loop
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async takeActions() {
    // Wait for player to select a card
    // Wait for second click to select target
    // Branching logic based on card
    // Click on end turn button ends the turn
    await this.endTurn();
  }
}
