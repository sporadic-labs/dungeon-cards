import Logger from "../../helpers/logger";
import PlayerCard, { PLAYER_CARD_TYPES } from "../player-card";

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

    const yPos = i => 600 + 110 * i;
    const xPos = i => 0 + 74 * i;
    new PlayerCard(scene, PLAYER_CARD_TYPES.ATTACK_ONE, xPos(0), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.ATTACK_THREE_HORIZONTAL, xPos(1), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.ATTACK_THREE_VERTICAL, xPos(2), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.ATTACK_GRID, xPos(3), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.ENERGY, xPos(4), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.BLOCK, xPos(5), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.DRAW, xPos(6), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.SHIFT_LEFT, xPos(7), yPos(0));
    new PlayerCard(scene, PLAYER_CARD_TYPES.SHIFT_RIGHT, xPos(8), yPos(0));

  }

  async update() {
    this.drawCard();
    await this.takeActions();
  }

  /**
   * First draw.
   */
  dealCards() {
    for (let x = 0; x < 6; x++) {
      this.deck.draw();
    };
  }

  /**
   * Add a card to your hand.
   */
  drawCard() {
    // Tell a card to animate from deck position to hand
    this.deck.draw()
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
