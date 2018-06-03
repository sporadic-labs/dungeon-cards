import { Scene } from "phaser";
import DraggableCard from "../game-objects/draggable-card";
import Deck from "../game-objects/deck/deck";
import { GameBoard } from "../game-objects/gameboard/gameboard";
import EnemyManager from "../game-objects/enemy-manager";
import PlayerManager from "../game-objects/player-manager";
import Logger from "../helpers/logger";
import { ENEMY_CARD_TYPES } from "../card-types";
import EnemyCard from "../game-objects/enemy-card";

export default class PlayScene extends Scene {
  create() {
    const { width, height } = this.sys.game.config;
    this.add
      .tileSprite(0, 0, width, height, "assets", "subtle-pattern-ep-natural-black")
      .setOrigin(0, 0);

    new DraggableCard(this, 600, 100, "cards/blank");
    new DraggableCard(this, 700, 100, "cards/weak-enemy");
    new DraggableCard(this, 800, 100, "cards/strong-enemy");

    this.board = new GameBoard(this, 4, 5);

    const composition = [
      { id: ENEMY_CARD_TYPES.WEAK_ENEMY, quantity: 17 },
      { id: ENEMY_CARD_TYPES.STRONG_ENEMY, quantity: 3 },
      { id: ENEMY_CARD_TYPES.BLANK, quantity: 30 }
    ];

    const deck = new Deck(composition);

    new EnemyCard(this, ENEMY_CARD_TYPES.WEAK_ENEMY, 100, 600);
    new EnemyCard(this, ENEMY_CARD_TYPES.STRONG_ENEMY, 200, 600);

    this.enemyManager = new EnemyManager(this, this.board, deck);
    this.playerManager = new PlayerManager(this, this.board, deck);

    this.runGameStep();
  }

  async runGameStep() {
    Logger.log("Enemy starting turn");
    await this.enemyManager.update();
    Logger.log("Enemy ending turn");

    Logger.log("Player starting turn");
    await this.playerManager.update();
    Logger.log("Player ending turn");

    this.runGameStep();
  }

  update(time, delta) {}
}
