import EnemyCard, { ENEMY_CARD_TYPES } from "./enemy-card";
import { EventProxy, emitter, EVENT_NAMES } from "../events";
import { DeckDisplay } from "../hud";
import { SHIFT_DIRECTIONS } from "../card-actions";
import BlankCard from "./enemy-card/blank-card";
import PlayerAttackAnimation from "../player-manager/player-attack-animation";
import { Events } from "phaser";

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
    this.sound = this.scene.sound; // TODO: use this.scene.game.globals.sfxPlayer

    this.proxy = new EventProxy();

    // Local emitter that is only for manager ⟷ card interaction
    this.cardEmitter = new Events.EventEmitter();

    const { width, _ } = this.scene.sys.game.config;
    this.deckDisplay = new DeckDisplay(scene, width - 60, 70, this.deck.getNumCardsRemaining());

    this.enemies = [];
    this.selectingEnabled = false;

    this.cardEmitter.on(EVENT_NAMES.ENEMY_CARD_SELECT, card => {
      // TODO(rex): Do something useful here.
    });

    this.cardEmitter.on(EVENT_NAMES.ENEMY_CARD_SOFT_FOCUS, card => {
      console.log("focusing enemy from enemy manager");
    });

    this.cardEmitter.on(EVENT_NAMES.ENEMY_CARD_SOFT_DEFOCUS, card => {
      this.enemies.forEach(c => c.defocus());
    });

    scene.events.on("shutdown", () => {
      this.removeAllEnemies();
      this.proxy.removeAll();
      this.cardEmitter.destroy();
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
    if (!enemies || !enemies.length) return;

    let delay = 0;

    const sortedEnemies = this.sortEnemies(enemies);

    const deathPromises = sortedEnemies.map(enemy => {
      // Play the Player Attach Animation.
      const attackAnim = new PlayerAttackAnimation(
        this.scene,
        enemy.cardFront.x,
        enemy.cardFront.y
      );
      attackAnim.fadeout(delay).then(() => attackAnim.destroy());
      delay += 200;

      enemy.takeDamage(damage);

      // Then play the Enemy Death animation.
      if (enemy.health <= 0) {
        delay += 100;
        return enemy.die(delay).then(() => this.removeEnemy(enemy));
      }
    });

    await Promise.all(deathPromises);

    if (!this.deck.anyCardsRemaining() && this.enemies.length === 0) {
      emitter.emit(EVENT_NAMES.GAME_OVER, true);
    }
  }

  /**
   * Move enemies in their natural movement pattern (probably down).
   */
  moveEnemies() {
    const sortedEnemies = this.sortEnemies(this.enemies);
    const cellSize = this.gameBoard.getCellSize();
    let delay = 0;
    const movePromises = sortedEnemies.map(enemy => {
      const boardPosition = this.gameBoard.findPositionOf(enemy);

      // Skip moving & attacking if blocked
      if (enemy.isBlocked()) return;

      // Enemy attack & kill player
      if (!boardPosition || !this.gameBoard.isInBounds(boardPosition.x, boardPosition.y + 1)) {
        emitter.emit(EVENT_NAMES.GAME_OVER, false);
        return;
      }

      // Move
      if (this.gameBoard.isEmpty(boardPosition.x, boardPosition.y + 1)) {
        const { x, y } = this.gameBoard.getWorldPosition(boardPosition.x, boardPosition.y + 1);
        const promise = enemy.moveTo(x + cellSize.width / 2, y + cellSize.height / 2, delay);
        this.gameBoard.removeAt(boardPosition.x, boardPosition.y);
        this.gameBoard.putAt(boardPosition.x, boardPosition.y + 1, enemy);
        delay += 50;

        // Give user feedback when an attack is imminent
        if (!this.gameBoard.isInBounds(boardPosition.x, boardPosition.y + 2)) {
          promise.then(() => enemy.shake());
        }

        return promise;
      }
    });

    return Promise.all(movePromises);
  }

  /**
   * Shift the row of enemies to the left/right.
   * If an enemy is going to move off the board, destroy them.
   *
   * @param {*} enemies
   * @param {*} direction
   */
  shiftEnemies(enemies, direction) {
    if (!enemies || !enemies.length) return Promise.resolve();

    const cellSize = this.gameBoard.getCellSize();

    // Sort the enemy group based on the direction you are shifting.
    const sortedEnemies = this.sortRow(enemies, direction === SHIFT_DIRECTIONS.RIGHT);

    // Move the enemy cards!
    let delay = 0;
    const movePromises = sortedEnemies.map(enemy => {
      const boardPos = this.gameBoard.findPositionOf(enemy);
      const nextBoardPos = { x: boardPos.x + direction, y: boardPos.y };
      const nextWorldPos = this.gameBoard.getWorldPosition(nextBoardPos.x, nextBoardPos.y);
      const isNextOpen = this.gameBoard.isEmpty(nextBoardPos.x, nextBoardPos.y);
      const promise = enemy.moveTo(
        nextWorldPos.x + cellSize.width / 2,
        nextWorldPos.y + cellSize.height / 2,
        delay
      );
      this.gameBoard.removeAt(boardPos.x, boardPos.y);
      if (isNextOpen) this.gameBoard.putAt(nextBoardPos.x, nextBoardPos.y, enemy);
      else promise.then(() => this.removeEnemy(enemy));
      delay += 50;
      return promise;
    });

    return Promise.all(movePromises);
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

    const cellSize = this.gameBoard.getCellSize();
    const spawnPosition = this.deckDisplay.getPosition();
    const spawnPromises = locations.map(async (location, i) => {
      const enemyType = this.deck.draw();
      this.deckDisplay.setValue(this.deck.getNumCardsRemaining());
      const { x, y } = this.gameBoard.getWorldPosition(location.x, location.y);
      const cx = x + cellSize.width / 2;
      const cy = y + cellSize.height / 2;
      const delay = i * 124;

      if (enemyType === ENEMY_CARD_TYPES.BLANK) {
        const blank = new BlankCard(this.scene, spawnPosition.x, spawnPosition.y);
        return blank
          .fadeIn(delay)
          .then(() => this.sound.play("card-slide-2"))
          .then(() => blank.moveTo(cx, spawnPosition.y))
          .then(() => blank.moveTo(cx, cy))
          .then(() => blank.flip())
          .then(() => blank.fadeOut())
          .then(() => blank.destroy());
      } else {
        const enemy = new EnemyCard(this.scene, enemyType, spawnPosition.x, spawnPosition.y);
        this.enemies.push(enemy);
        this.gameBoard.putAt(location.x, location.y, enemy);
        return enemy
          .fadeIn(delay)
          .then(() => this.sound.play("card-slide-2"))
          .then(() => enemy.moveTo(cx, spawnPosition.y))
          .then(() => enemy.moveTo(cx, cy))
          .then(() => enemy.flip());
      }
    });

    // Wait until cards finish moving to continue.
    await Promise.all(spawnPromises);
  }
}
