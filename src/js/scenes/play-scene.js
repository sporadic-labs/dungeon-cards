import { Scene } from "phaser";
import Deck from "../game-objects/deck";
import { GameBoard } from "../game-objects/gameboard/gameboard";
import EnemyManager, { ENEMY_CARD_TYPES } from "../game-objects/enemy-manager";
import PlayerManager, { PLAYER_CARD_TYPES } from "../game-objects/player-manager";
import ActionRunner from "../game-objects/card-actions";
import { emitter, EVENT_NAMES } from "../game-objects/events";
import run from "../game-objects/game-runner";
import Logger from "../helpers/logger";

export default class PlayScene extends Scene {
  create() {
    const { width, height } = this.sys.game.config;
    this.add.tileSprite(0, 0, 10 * width, 10 * height, "assets", "background");

    const gameBoard = new GameBoard(this, 5, 4);

    const enemyDeckComposition = [
      { id: ENEMY_CARD_TYPES.WEAK_ENEMY, quantity: 17 },
      { id: ENEMY_CARD_TYPES.STRONG_ENEMY, quantity: 3 },
      { id: ENEMY_CARD_TYPES.BLANK, quantity: 30 }
    ];

    const enemyDeck = new Deck(enemyDeckComposition);
    const enemyManager = new EnemyManager(this, gameBoard, enemyDeck);

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
    const playerManager = new PlayerManager(this, gameBoard, playerDeck);
    const actionRunner = new ActionRunner(this, playerManager, enemyManager, gameBoard);

    emitter.emit(EVENT_NAMES.GAME_START);

    run(playerManager, enemyManager, actionRunner);
  }
}
