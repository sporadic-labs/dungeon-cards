import "../css/main.scss";
import Phaser from "phaser";
import { Loading, Test, SCENE_NAME } from "./scenes";

const gameDimensions = 750;
const containerId = "game-container";

const game = new Phaser.Game({
  type: Phaser.AUTO,
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
game.scene.add(SCENE_NAME.TEST, Test);
game.scene.start(SCENE_NAME.LOADING);
