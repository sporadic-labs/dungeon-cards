import "babel-polyfill";
import "../css/main.scss";

import { AUTO, Game } from "phaser";
import { Loading, Play, SCENE_NAME } from "./scenes";
import logger, { LOG_LEVEL } from "./helpers/logger";
import LifecyclePlugin from "./plugins/lifecycle-plugin/index";

import React from "react";
import { render } from "react-dom";

import Menu from "./menu/menu-app";
import gameStore from "./menu/game-store";

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

// Setup Menus
render(
  <Menu gameStore={gameStore} width={gameDimensions} height={gameDimensions} />,
  document.getElementById("menu-container")
);

game.scene.add(SCENE_NAME.LOADING, Loading);
game.scene.add(SCENE_NAME.PLAY, Play);
game.scene.start(SCENE_NAME.LOADING);
