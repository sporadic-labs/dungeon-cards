import Logger from "../../helpers/logger";
import EnemyCard, { ENEMY_CARD_TYPES } from "./enemy-card";

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

    this.enemies = [];
  }

  update() {
    this.moveEnemies();
    this.spawnEnemies();
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Sort enemies in the following order: top to bottom then left to right.
   *
   * @memberof EnemyManager
   */
  sortEnemies() {
    this.enemies.sort((enemy1, enemy2) => {
      const p1 = enemy1.getPosition();
      const p2 = enemy2.getPosition();
      if (p1.y > p2.y) return -1;
      else if (p1.y < p2.y) return 1;
      else {
        if (p1.x < p2.x) return -1;
        if (p1.x > p2.x) return 1;
        else return 0;
      }
    });
  }

  moveEnemies() {
    this.sortEnemies();
    this.enemies.map(enemy => {
      const boardPosition = this.gameBoard.findPositionOf(enemy);
      if (!enemy.isBlocked() && this.gameBoard.isEmpty(boardPosition.x, boardPosition.y + 1)) {
        const { x, y } = this.gameBoard.getWorldPosition(boardPosition.x, boardPosition.y + 1);
        enemy.setPosition(x, y);
        this.gameBoard.removeAt(boardPosition.x, boardPosition.y);
        this.gameBoard.putAt(boardPosition.x, boardPosition.y + 1, enemy);
      }
    });

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
      const enemyType = this.deck.draw();
      if (enemyType !== ENEMY_CARD_TYPES.BLANK) {
        const { x, y } = this.gameBoard.getWorldPosition(location.x, location.y);
        const enemy = new EnemyCard(this.scene, enemyType, x, y);
        this.enemies.push(enemy);
        this.gameBoard.putAt(location.x, location.y, enemy);
        Logger.log(`Spawn enemy with card ${enemyType}`);
        // Tell enemy to animate to location
      }
    });

    // Wait for last animation to finish before game advances
  }
}
