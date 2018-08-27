import { Scene } from "phaser";
import Deck from "../game-objects/deck";
import { GameBoard } from "../game-objects/gameboard/gameboard";
import EnemyManager, { ENEMY_CARD_TYPES } from "../game-objects/enemy-manager";
import PlayerManager, { PLAYER_CARD_TYPES } from "../game-objects/player-manager";
import ActionRunner from "../game-objects/card-actions";
import { EventProxy, emitter, EVENT_NAMES } from "../game-objects/events";
import run from "../game-objects/game-runner";
import Logger from "../helpers/logger";
import { MENU_STATES } from "../menu/menu-states";
import store from "../store/index";
import { autorun } from "mobx";

export default class PlayScene extends Scene {
  gameBoard;
  enemyManager;
  playerManager;
  actionRunner;
  proxy;

  create() {
    const { width, height } = this.sys.game.config;
    this.add.tileSprite(0, 0, 10 * width, 10 * height, "assets", "background");

    this.gameBoard = new GameBoard(this, 5, 4);

    this.proxy = new EventProxy();

    this.initGame();

    this.proxy.on(emitter, EVENT_NAMES.GAME_OVER, () => {
      store.setPaused(true);
      store.setMenuState(MENU_STATES.GAME_OVER);
    });

    this.proxy.on(emitter, EVENT_NAMES.GAME_START, () => {
      this.proxy.removeAll();
      this.scene.restart();
      store.setPaused(false);
    });

    this.storeUnsubscribe = autorun(() => {
      store.isGamePaused ? this.scene.pause() : this.scene.resume();
    });

    this.input.keyboard.on("keydown_E", event => {
      store.setPaused(true);
      store.setMenuState(MENU_STATES.DEBUG);
    });

    run(this.playerManager, this.enemyManager, this.actionRunner);
  }

  initGame() {
    const enemyDeckComposition = [
      { id: ENEMY_CARD_TYPES.WEAK_ENEMY, quantity: 17 },
      { id: ENEMY_CARD_TYPES.STRONG_ENEMY, quantity: 3 },
      { id: ENEMY_CARD_TYPES.BLANK, quantity: 30 }
    ];

    const enemyDeck = new Deck(enemyDeckComposition);
    this.enemyManager = new EnemyManager(this, this.gameBoard, enemyDeck);

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
    this.playerManager = new PlayerManager(this, this.gameBoard, playerDeck);
    this.actionRunner = new ActionRunner(
      this,
      this.playerManager,
      this.enemyManager,
      this.gameBoard
    );
  }

  shutdown() {
    this.storeUnsubscribe();
  }
}
