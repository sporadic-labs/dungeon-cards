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
import { SCENE_NAME } from "./index";
import { GAME_STATES, preferencesStore } from "../store/index";

/**
 * Util class to control panning between menu area and the game area.
 * @class CameraPanner
 */
class CameraPanner {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.Cameras.Scene2D} camera
   * @memberof CameraPanner
   */
  constructor(scene, camera) {
    this.time = scene.time;
    this.camera = camera;
    this.panEvent = null;
    this.duration = 600;
    this.menuX = 1200;
    this.gameX = 400;
    this.proxy = new EventProxy();
    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destory", this.destroy, this);
  }
  setToMenuArea() {
    this.camera.scrollX = this.menuX;
  }
  setToGameArea() {
    this.camera.scrollX = this.gameX;
  }
  tweenToMenuArea() {
    this.stopPan();
    this.camera.pan(this.menuX, this.camera.midPoint.y, this.duration, "Expo", false);
  }
  tweenToGameArea() {
    // Delay gives DOM menu time to disappear
    this.panEvent = this.time.delayedCall(200, () =>
      this.camera.pan(this.gameX, this.camera.midPoint.y, this.duration, "Expo", false)
    );
  }
  stopPan() {
    this.camera.panEffect.reset();
    if (this.panEvent) this.panEvent.destroy();
  }
  destroy() {
    this.stopPan();
    this.proxy.removeAll();
  }
}

export default class PlayScene extends Scene {
  create() {
    // MH: cameras can't be shared across scenes, so we need to rethink this BG scene idea. For now,
    // load another tile bg in this scene
    const { width, height } = this.sys.game.config;
    this.add.tileSprite(0, 0, 2 * width, 1 * height, "assets", "background-vector").setOrigin(0, 0);

    // Hacky: start off screen (menu area) and pan in to the game zone
    this.panner = new CameraPanner(this, this.cameras.main);
    this.panner.setToMenuArea();
    this.panner.tweenToGameArea();

    this.gameBoard = new GameBoard(this, 5, 4);

    this.instructionsButton = new Button(this, 100, 50, {
      framePrefix: "ui/help-",
      onDown: () => emitter.emit(EVENT_NAMES.INSTRUCTIONS_FOCUS)
    });

    this.toast = new HudToast(this);

    this.proxy = new EventProxy();
    this.proxy.on(this.events, "shutdown", this.shutdown, this);

    this.initGame();

    this.proxy.on(emitter, EVENT_NAMES.GAME_OVER, win => {
      gameStore.setGameStarted(false);
      gameStore.setPaused(true);
      gameStore.setMenuState(win ? MENU_STATES.GAME_OVER_WON : MENU_STATES.GAME_OVER_LOST);
      this.panner.tweenToMenuArea();
    });

    this.proxy.on(emitter, EVENT_NAMES.GAME_START, () => {
      gameStore.setPaused(false);
      this.scene.restart();
    });

    const camera = this.cameras.main;
    this.storeUnsubscribe = autorun(() => {
      if (gameStore.isGamePaused) {
        camera.once("camerapancomplete", () => this.scene.pause());
        this.panner.tweenToMenuArea();
      } else {
        this.scene.resume();
        this.panner.tweenToGameArea();
      }
    });

    this.input.keyboard.on("keydown_E", event => {
      gameStore.setPaused(true);
      gameStore.setMenuState(MENU_STATES.DEBUG);
    });

    gameStore.setGameStarted(true);

    run(this.playerManager, this.enemyManager, this.actionRunner);

    if (preferencesStore.showInstructionsOnPlay) {
      gameStore.setGameState(GAME_STATES.INSTRUCTIONS);
    }
  }

  initGame() {
    const enemyDeckComposition = [
      { id: ENEMY_CARD_TYPES.WEAK_ENEMY, quantity: 17 },
      { id: ENEMY_CARD_TYPES.STRONG_ENEMY, quantity: 3 },
      { id: ENEMY_CARD_TYPES.BLANK, quantity: 30 }
    ];

    // Enemy deck, ensuring that at least one enemy is always spawed
    const enemyDeck = new Deck(enemyDeckComposition, cards => {
      let firstDrawIndex = cards.length - 4; // 4 columns of enemies
      do {
        Phaser.Utils.Array.Shuffle(cards);
      } while (cards.slice(firstDrawIndex).every(c => c === ENEMY_CARD_TYPES.BLANK));
    });
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
    this.storeUnsubscribe();
    this.proxy.removeAll();
  }
}
