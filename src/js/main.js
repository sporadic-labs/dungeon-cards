import "babel-polyfill";
import "../css/main.scss";

import { AUTO, Game } from "phaser";
import { Loading, Play, SCENE_NAME } from "./scenes";
import logger, { LOG_LEVEL } from "./helpers/logger";
import LifecyclePlugin from "./plugins/lifecycle-plugin/index";

logger.setLevel(PRODUCTION ? LOG_LEVEL.OFF : LOG_LEVEL.ALL);

const gameDimensions = 800;
const containerId = "game-container";
const game = new Game({
  type: AUTO,
  parent: containerId,
  width: gameDimensions,
  height: gameDimensions,
  backgroundColor: "#000",
  pixelArt: false,
  plugins: {
    scene: [{ key: "LifecyclePlugin", plugin: LifecyclePlugin, mapping: "lifecycle", start: true }]
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  }
});

// Disable right click menu
document.getElementById(containerId).addEventListener("contextmenu", e => {
  e.preventDefault();
  return false;
});

game.scene.add(SCENE_NAME.LOADING, Loading);
game.scene.add(SCENE_NAME.PLAY, Play);
game.scene.start(SCENE_NAME.LOADING);
