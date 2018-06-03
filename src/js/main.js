import "babel-polyfill";
import "../css/main.scss";
import { AUTO, Game } from "phaser";
import { Loading, Play, SCENE_NAME } from "./scenes";
import logger, { LOG_LEVEL } from "./helpers/logger";

logger.setLevel(PRODUCTION ? LOG_LEVEL.OFF : LOG_LEVEL.ALL);

const gameDimensions = 750;
const containerId = "game-container";

const game = new Game({
  type: AUTO,
  parent: containerId,
  width: gameDimensions,
  height: gameDimensions,
  backgroundColor: "#000",
  pixelArt: false,
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
