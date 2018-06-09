import Logger from "../../helpers/logger";
import PlayerCard from "../player-card";
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
    this.playerHand = [];

    this.dealCards();

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
    this.arrangeCards();
    await this.takeActions();
    if (this.playerHand.length > 10) await this.discardCard();
  }

  /**
   * First draw.
   */
  dealCards(numToDeal = 6) {
    for (let x = 0; x < numToDeal; x++) {
      const cardId = this.deck.draw();
      this.playerHand.push(new PlayerCard(this.scene, cardId, 0, 0));
    }
    this.arrangeCards();
  }

  arrangeCards() {
    const x = 0;
    const y = 550;
    this.playerHand.forEach((card, i) =>
      // 2D grid with 6 columns
      card.setPosition(x + 74 * (i % 6), y + 100 * Math.floor(i / 6))
    );
  }

  /**
   * Add a card to your hand.
   */
  drawCard() {
    // Tell a card to animate from deck position to hand
    const cardId = this.deck.draw();
    this.playerHand.push(new PlayerCard(this.scene, cardId, 0, 0));
  }

  discardCard() {
    // TODO: this should wait for the player to choose a card to discard
    const card = this.playerHand.shift();
    card.destroy();
    this.deck.discard(card.type);
    this.arrangeCards();
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
