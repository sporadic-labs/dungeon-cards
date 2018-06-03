import Logger from "../../helpers/logger";

export default class EnemyManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {GameBoard} gameBoard
   * @param {Deck} enemyDeck
   */
  constructor(scene, gameBoard, enemyDeck) {
    this.scene = scene;
    this.gameBoard = gameBoard;
    this.deck = enemyDeck;
  }

  async update() {
    this.moveEnemies();
    this.spawnEnemies();
  }

  moveEnemies() {
    // Loop over all enemies from bottom left to top right
    //  If enemy is not blocked
    //    Ask enemy where it wants to move
    //    Confirm with game board that the location is free
    //    Tell enemy to move
    //    Wait for animation to finish before moving next enemy
  }

  spawnEnemies() {
    const cardsRemaining = this.deck.getNumCardsRemaining();
    if (cardsRemaining === 0) return;

    // Limit number of locations to number of cards remaining
    const locations = this.gameBoard.getOpenSpawnLocations().slice(0, cardsRemaining);
    if (locations.length === 0) return;

    locations.map(location => {
      const card = this.deck.draw();
      //  Contruct an EnemyCard from the card ID
      Logger.log(`Spawn enemy with card ${card}`);
      // Tell enemy to animate to location
    });

    // Wait for last animation to finish before game advances
  }
}
