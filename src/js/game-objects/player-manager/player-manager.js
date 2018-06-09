import Logger from "../../helpers/logger";
import PlayerCard from "../player-card";
import PlayerHand from "./player-hand";
import { EVENTS } from "../events";

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

    // Setup event listeners
    this.scene.events.addListener(EVENTS.SELECT_PLAYER_CARD, card => {
      console.log(`Player Manager: Card selected: `);
      console.log(card);
    });
    this.scene.events.addListener(EVENTS.SELECT_ENEMY_CARD, card => {
      console.log(`Play Scene: Enemy Card selected: `);
      console.log(card);
    });
    this.scene.events.addListener(EVENTS.END_PLAYER_TURN, () => {
      console.log(`Play Scene: End Player Turn`);
    });
  }

  async update() {
    this.drawCard();
    await this.takeActions();
    if (this.playerHand.length > 10) await this.discardCard();
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
