import Logger from "../../helpers/logger";
import EnemyCard, { ENEMY_CARD_TYPES } from "./enemy-card";
import { emitter, EVENT_NAMES } from "../events";
import { DeckDisplay } from "../hud";
import { SHIFT_DIRECTIONS } from "../card-actions";

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

    const { width, height } = this.scene.sys.game.config;
    this.deckDisplay = new DeckDisplay(scene, width - 64, 166, this.deck.getNumCardsRemaining());

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

  async update() {
    this.disableSelecting();

    await this.moveEnemies();
    await this.spawnEnemies();

    this.enemies.forEach(e => e.update());
    this.enableSelecting();
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

  removeEnemy(enemy) {
    this.enemies = this.enemies.filter(e => e !== enemy);
    const boardPosition = this.gameBoard.findPositionOf(enemy);
    if (boardPosition) this.gameBoard.removeAt(boardPosition.x, boardPosition.y);
    enemy.destroy();
  }

  /**
   * Sort enemies in the following order: bottom of the screen to top of the screen, then left side
   * of the screen to the right side of the screen.
   *
   * @memberof EnemyManager
   */
  sortEnemies(enemies) {
    enemies.sort((enemy1, enemy2) => {
      const p1 = enemy1.getPosition();
      const p2 = enemy2.getPosition();
      // y2 - y1 = bigger Y sorts earlier in array
      // x1 - x2 = smaller X sorts earlier in array
      return p2.y - p1.y || p1.x - p2.x;
    });
  }

  /**
   * Sort a list of enemies based solely on x position.
   * Default left to right, but can be reversed using flag.
   *
   * @param {*} enemies
   * @param {*} reverse
   */
  sortRow(enemies, reverse = false) {
    enemies.sort((enemy1, enemy2) => {
      const p1 = enemy1.getPosition();
      const p2 = enemy2.getPosition();
      // x1 - x2 = smaller X sorts earlier in array
      if (reverse) return p2.x - p1.x;
      else return p1.x - p2.x;
    });
  }

  /**
   * Apply damage to any enemy within range of the players attack.
   *
   * @param {*} enemies
   * @param {*} damage
   */
  async damageEnemies(enemies, damage) {
    let delay = 0;

    this.sortEnemies(enemies);

    const deathPromises = enemies.map(enemy => {
      enemy.takeDamage(damage);
      if (enemy.health <= 0) {
        delay += 50;
        return enemy.die(delay).then(() => this.removeEnemy(enemy));
      }
    });

    await Promise.all(deathPromises);

    if (this.enemies.length === 0) {
      console.log("Game Over!  You Win!");
      emitter.emit(EVENT_NAMES.GAME_OVER);
    }
  }

  /**
   * Move enemies in their natural movement pattern (probably down).
   */
  async moveEnemies() {
    this.sortEnemies(this.enemies);
    let delay = 0;
    const movePromises = this.enemies.map(enemy => {
      const boardPosition = this.gameBoard.findPositionOf(enemy);

      // Is the enemy about to go off the board?
      if (!this.gameBoard.isInBounds(boardPosition.x, boardPosition.y + 1)) {
        console.log(`You have been attacked by an enemy!  You lose!`);
        emitter.emit(EVENT_NAMES.GAME_OVER);
      }

      // Is the next spot open for the enemy?
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

  /**
   * Shift the row of enemies to the left/right.
   * If an enemy is going to move off the board, destroy them.
   *
   * @param {*} enemies
   * @param {*} direction
   */
  async shiftEnemies(enemies, direction) {
    this.sortRow(enemies, direction === SHIFT_DIRECTIONS.RIGHT);
    let delay = 0;
    const movePromises = enemies.map(enemy => {
      const boardPosition = this.gameBoard.findPositionOf(enemy);
      // Is the enemy about to go off the board?
      if (!this.gameBoard.isInBounds(boardPosition.x + direction, boardPosition.y)) {
        // TODO(rex): Animate enemy before removing it.
        this.removeEnemy(enemy);
      }

      // Is the next spot open for the enemy?
      if (
        !enemy.isBlocked() &&
        this.gameBoard.isEmpty(boardPosition.x + direction, boardPosition.y)
      ) {
        console.log(direction);
        const { x, y } = this.gameBoard.getWorldPosition(
          boardPosition.x + direction,
          boardPosition.y
        );
        console.log(`x: ${x}, y: ${y}`);
        console.log(`board position x: ${boardPosition.x}, y: ${boardPosition.y}`);
        console.log(`board position x: ${boardPosition.x + direction}, y: ${boardPosition.y}`);
        const promise = enemy.moveTo(x, y, delay);
        this.gameBoard.removeAt(boardPosition.x, boardPosition.y);
        this.gameBoard.putAt(boardPosition.x + direction, boardPosition.y, enemy);
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
      this.deckDisplay.setValue(this.deck.getNumCardsRemaining());
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
}
