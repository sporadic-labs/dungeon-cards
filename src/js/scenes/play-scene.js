import { Scene } from "phaser";
import DraggableCard from "../game-objects/draggable-card";
import Deck from "../game-objects/deck/deck";
import { GameBoard } from "../game-objects/gameboard/gameboard";
import EnemyManager from "../game-objects/enemy-manager";
import PlayerManager from "../game-objects/player-manager";
import Logger from "../helpers/logger";
import { ENEMY_CARD_TYPES } from "../game-objects/enemy-card";
import { PLAYER_CARD_TYPES } from "../game-objects/player-card";
import PlayerCard from "../game-objects/player-card";

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

    const enemyDeckComposition = [
      { id: ENEMY_CARD_TYPES.WEAK_ENEMY, quantity: 17 },
      { id: ENEMY_CARD_TYPES.STRONG_ENEMY, quantity: 3 },
      { id: ENEMY_CARD_TYPES.BLANK, quantity: 30 }
    ];

    const yPos = i => 600 + 110 * i;
    const xPos = i => 0 + 74 * i;
    new PlayerCard(this, PLAYER_CARD_TYPES.ATTACK_ONE, xPos(0), yPos(0));
    new PlayerCard(this, PLAYER_CARD_TYPES.ATTACK_THREE_HORIZONTAL, xPos(1), yPos(0));
    new PlayerCard(this, PLAYER_CARD_TYPES.ATTACK_THREE_VERTICAL, xPos(2), yPos(0));
    new PlayerCard(this, PLAYER_CARD_TYPES.ATTACK_GRID, xPos(3), yPos(0));
    new PlayerCard(this, PLAYER_CARD_TYPES.ENERGY, xPos(4), yPos(0));
    new PlayerCard(this, PLAYER_CARD_TYPES.BLOCK, xPos(0), yPos(1));
    new PlayerCard(this, PLAYER_CARD_TYPES.DRAW, xPos(1), yPos(1));
    new PlayerCard(this, PLAYER_CARD_TYPES.SHIFT_LEFT, xPos(2), yPos(1));
    new PlayerCard(this, PLAYER_CARD_TYPES.SHIFT_RIGHT, xPos(3), yPos(1));

    const enemyDeck = new Deck(enemyDeckComposition);
    this.enemyManager = new EnemyManager(this, this.board, enemyDeck);
        
    const playerDeckComposition = [
      { id: PLAYER_CARD_TYPES.ATTACK_ONE, quantity: 12 },
      { id: PLAYER_CARD_TYPES.ATTACK_THREE_VERTICAL, quantity: 7 },
      { id: PLAYER_CARD_TYPES.ATTACK_THREE_HORIZONTAL, quantity: 7 },
      { id: PLAYER_CARD_TYPES.ATTACK_GRID, quantity: 5 },
      { id: PLAYER_CARD_TYPES.ENERGY, quantity: 10 },
      { id: PLAYER_CARD_TYPES.DRAW_THREE, quantity: 4 },
      { id: PLAYER_CARD_TYPES.SHIFT_RIGHT, quantity: 5 },
      { id: PLAYER_CARD_TYPES.SHIFT_LEFT, quantity: 5 },
      { id: PLAYER_CARD_TYPES.BLOCK, quantity: 5 }
    ];
    
    const playerDeck = new Deck(playerDeckComposition);
    this.playerManager = new PlayerManager(this, this.board, playerDeck);

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
