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
import { gameStore } from "../store";
import HudToast from "../game-objects/hud/hud-toast";
import { autorun } from "mobx";
import Button from "../game-objects/hud/button";

export default class PlayScene extends Scene {
  panToMenuArea() {
    this.cameras.main.pan(1200, 400, 600, "Expo", false);
  }
  panToGameArea() {
    this.time.delayedCall(200, () => this.cameras.main.pan(400, 400, 600, "Expo", false));
  }

  create() {
    // MH: cameras can't be shared across scenes, so we need to rethink this BG scene idea. For now,
    // load another tile bg in this scene
    const { width, height } = this.sys.game.config;
    this.add.tileSprite(0, 0, 2 * width, 1 * height, "assets", "background-vector").setOrigin(0, 0);

    // Hacky: start off screen (menu area) and pan in to the game zone
    this.cameras.main.scrollX = 1200;
    this.panToGameArea();

    this.gameBoard = new GameBoard(this, 5, 4);

    this.toast = new HudToast(this);

    this.proxy = new EventProxy();

    this.initGame();

    this.proxy.on(emitter, EVENT_NAMES.GAME_OVER, win => {
      gameStore.setGameStarted(false);
      gameStore.setPaused(true);
      gameStore.setMenuState(win ? MENU_STATES.GAME_OVER_WON : MENU_STATES.GAME_OVER_LOST);

      this.shutdown();
    });

    this.proxy.on(emitter, EVENT_NAMES.GAME_START, () => {
      this.shutdown();

      this.scene.restart();
      gameStore.setPaused(false);
    });

    const camera = this.cameras.main;
    this.storeUnsubscribe = autorun(() => {
      if (gameStore.isGamePaused) {
        camera.once("camerapancomplete", () => this.scene.pause());
        this.panToMenuArea();
      } else {
        this.scene.resume();
        this.panToGameArea();
      }
    });

    this.input.keyboard.on("keydown_E", event => {
      gameStore.setPaused(true);
      gameStore.setMenuState(MENU_STATES.DEBUG);
    });

    gameStore.setGameStarted(true);

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

    const pauseButton = new Button(this, 15, 15, {
      origin: { x: 0, y: 0 },
      framePrefix: "ui/pause-",
      onDown: () => {
        pauseButton.setIsPressed(false); // Pausing the game === no pointer up event, so reset press
        gameStore.setPaused(true);
        gameStore.setMenuState(MENU_STATES.PAUSE);
      }
    });
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.toast.destroy();
    this.storeUnsubscribe();
    this.proxy.removeAll();
  }
}
