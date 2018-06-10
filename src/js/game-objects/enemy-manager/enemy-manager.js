import Logger from "../../helpers/logger";
import EnemyCard, { ENEMY_CARD_TYPES } from "./enemy-card";
import { emitter, EVENT_NAMES } from "./events";

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
    this.selectingEnabled = false;

    emitter.on(EVENT_NAMES.ENEMY_CARD_SELECT, card => {
      // TODO(rex): Do something useful here.
    });

    emitter.on(EVENT_NAMES.ENEMY_CARD_FOCUS, card => {
      this.enemies.forEach(c => c.defocus());
      card.focus();
    });

    emitter.on(EVENT_NAMES.ENEMY_CARD_DEFOCUS, card => {
      this.enemies.forEach(c => c.defocus());
    });
  }

  update() {
    this.disableSelecting();
    this.moveEnemies();
    this.spawnEnemies();
    return new Promise(resolve => {
      this.enableSelecting();
      setTimeout(resolve, 1000);
    });
  }

  getNumCards() {
    return this.enemies.length;
  }

  enableSelecting() {
    this.selectingEnabled = true;
    this.enemies.forEach(c => c.enableSelecting());
  }

  disableSelecting() {
    this.selectingEnabled = false;
    this.enemies.forEach(c => c.disableSelecting());
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

  async moveEnemies() {
    this.sortEnemies();
    let delay = 0;
    const movePromises = this.enemies.map(enemy => {
      const boardPosition = this.gameBoard.findPositionOf(enemy);
      if (!enemy.isBlocked() && this.gameBoard.isEmpty(boardPosition.x, boardPosition.y + 1)) {
        const { x, y } = this.gameBoard.getWorldPosition(boardPosition.x, boardPosition.y + 1);
        const promise = enemy.moveTo(x, y, delay);
        this.gameBoard.removeAt(boardPosition.x, boardPosition.y);
        this.gameBoard.putAt(boardPosition.x, boardPosition.y + 1, enemy);
        delay += 50;
        return promise;
      }
    });

    await Promise.all(movePromises);
  }

  async spawnEnemies() {
    const cardsRemaining = this.deck.getNumCardsRemaining();
    if (cardsRemaining === 0) return;

    // Limit number of locations to number of cards remaining
    const locations = this.gameBoard.getOpenSpawnLocations().slice(0, cardsRemaining);
    if (locations.length === 0) return;

    let delay = 0;

    const spawnPromises = locations.map(location => {
      const enemyType = this.deck.draw();
      if (enemyType !== ENEMY_CARD_TYPES.BLANK) {
        const { x, y } = this.gameBoard.getWorldPosition(location.x, location.y);
        const enemy = new EnemyCard(this.scene, enemyType, x, y);
        const fadePromise = enemy.fadeIn(delay);
        this.enemies.push(enemy);
        this.gameBoard.putAt(location.x, location.y, enemy);
        delay += 100;
        return fadePromise;
      }
    });

    // TODO: Make room for these to spawn above the game board and animate into position
    return Promise.all(spawnPromises);
  }

  discardEnemy(card) {
    if (this.enemies.includes(card)) {
      this.enemies = this.enemies.filter(c => c !== card);
      this.deck.discard(card.type);
      this.arrangeCards();
      card.destroy();
    }
  }


}
