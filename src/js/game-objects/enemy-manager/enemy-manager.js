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
    this.deckDisplay = new DeckDisplay(
      scene,
      width - 60,
      height * 0.25,
      this.deck.getNumCardsRemaining()
    );

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

    this.enemies.forEach(e => e.beforeTurnEnd());
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

  // Reset all enemies by defocusing
  async defocusAllEnemies() {
    const promises = this.enemies.filter(e => e.focused).map(e => e.defocus());
    await Promise.all(promises);
  }

  // Change the focus state of the enemies on the board - only the given enemies will be focused
  async focusEnemies(enemies) {
    const promises = this.enemies.map(e => {
      if (enemies.includes(e)) return e.focus();
      else e.defocus();
    });
    await Promise.all(promises);
  }

  removeAllEnemies() {
    this.enemies.forEach(e => this.removeEnemy(e));
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
   * @returns Copy of the array, sorted
   */
  sortEnemies(enemies) {
    const copy = enemies.slice();
    copy.sort((enemy1, enemy2) => {
      const p1 = enemy1.getPosition();
      const p2 = enemy2.getPosition();
      // y2 - y1 = bigger Y sorts earlier in array
      // x1 - x2 = smaller X sorts earlier in array
      return p2.y - p1.y || p1.x - p2.x;
    });
    return copy;
  }

  /**
   * Sort a list of enemies based solely on x position.
   * Default left to right, but can be reversed using flag.
   *
   * @param {*} enemies
   * @param {*} reverse
   * @returns Copy of the array, sorted
   */
  sortRow(enemies, reverse = false) {
    const copy = enemies.slice();
    copy.sort((enemy1, enemy2) => {
      const p1 = enemy1.getPosition();
      const p2 = enemy2.getPosition();
      return p1.x - p2.x; // x1 - x2 = smaller X sorts earlier in array
    });
    if (reverse) copy.reverse();
    return copy;
  }

  /**
   * Apply damage to any enemy within range of the players attack.
   *
   * @param {*} enemies
   * @param {*} damage
   */
  async damageEnemies(enemies, damage) {
    let delay = 0;

    const sortedEnemies = this.sortEnemies(enemies);

    const deathPromises = sortedEnemies.map(enemy => {
      enemy.takeDamage(damage);
      if (enemy.health <= 0) {
        delay += 50;
        return enemy.die(delay).then(() => this.removeEnemy(enemy));
      }
    });

    await Promise.all(deathPromises);

    if (!this.deck.anyCardsRemaining() && this.enemies.length === 0) {
      emitter.emit(EVENT_NAMES.GAME_OVER);
    }
  }

  /**
   * Move enemies in their natural movement pattern (probably down).
   */
  async moveEnemies() {
    await this.defocusAllEnemies();

    const sortedEnemies = this.sortEnemies(this.enemies);
    let delay = 0;
    const movePromises = sortedEnemies.map(enemy => {
      const boardPosition = this.gameBoard.findPositionOf(enemy);

      // Is the enemy about to go off the board?
      if (!boardPosition || !this.gameBoard.isInBounds(boardPosition.x, boardPosition.y + 1)) {
        emitter.emit(EVENT_NAMES.GAME_OVER);
        return;
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
    await this.defocusAllEnemies();

    // Sort the enemy group based on the direction you are shifting.
    const sortedEnemies = this.sortRow(enemies, direction === SHIFT_DIRECTIONS.RIGHT);

    // Move the enemy cards!
    let delay = 0;
    const movePromises = sortedEnemies.map(enemy => {
      const boardPosition = this.gameBoard.findPositionOf(enemy);
      // Check if there's room left on the board to shift the enemy over
      if (!this.gameBoard.isInBounds(boardPosition.x + direction, boardPosition.y)) {
        // TODO(rex): Animate enemy before removing it.
        this.removeEnemy(enemy);
      } else if (
        !enemy.isBlocked() &&
        this.gameBoard.isEmpty(boardPosition.x + direction, boardPosition.y)
      ) {
        const { x, y } = this.gameBoard.getWorldPosition(
          boardPosition.x + direction,
          boardPosition.y
        );
        const promise = enemy.moveTo(x, y, delay);
        this.gameBoard.removeAt(boardPosition.x, boardPosition.y);
        this.gameBoard.putAt(boardPosition.x + direction, boardPosition.y, enemy);
        delay += 50;
        return promise;
      }
    });

    await Promise.all(movePromises);
  }

  /**
   * Draw and place new cards from the enemy deck.
   */
  async spawnEnemies() {
    const cardsRemaining = this.deck.getNumCardsRemaining();
    if (cardsRemaining === 0) return;

    // Limit number of locations to number of cards remaining
    const locations = this.gameBoard.getOpenSpawnLocations().slice(0, cardsRemaining);
    if (locations.length === 0) return;

    let spawnDelay = 0;
    const spawnPromises = locations.map(async location => {
      const enemyType = this.deck.draw();

      this.deckDisplay.setValue(this.deck.getNumCardsRemaining());

      spawnDelay += 124;

      const { x, y } = this.gameBoard.getWorldPosition(location.x, location.y);
      const startingYOffset = -72;

      const enemy = new EnemyCard(this.scene, enemyType, x, y + startingYOffset);
      await enemy.fadeIn(spawnDelay);

      if (enemy.type !== ENEMY_CARD_TYPES.BLANK) {
        this.enemies.push(enemy);
        this.gameBoard.putAt(location.x, location.y, enemy);
        return enemy.moveTo(x, y, spawnDelay);
      } else {
        return enemy.die(spawnDelay);
      }
    });

    // Wait until cards finish moving to continue.
    await Promise.all(spawnPromises);
  }
}
