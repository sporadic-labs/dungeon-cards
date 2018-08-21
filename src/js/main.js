import "babel-polyfill";
import "../css/main.scss";

import { AUTO, Game } from "phaser";
import { Loading, Play, SCENE_NAME } from "./scenes";
import logger, { LOG_LEVEL } from "./helpers/logger";
import PhaserLifecyclePlugin from "phaser-lifecycle-plugin/src/";

import React from "react";
import { render } from "react-dom";

import Menu from "./menu/menu-app";
import gameStore from "./menu/game-store";
import GameMusicPlayer from "./sound/game-music/game-music-player";

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
    scene: [{ plugin: PhaserLifecyclePlugin, key: "lifecycle", mapping: "lifecycle" }]
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  }
});

const musicStore = new GameMusicPlayer(game, "music");

game.globals = { musicStore };

// Disable right click menu
document.getElementById(containerId).addEventListener("contextmenu", e => {
  e.preventDefault();
  return false;
});

// Setup Menus
render(
  <Menu
    gameStore={gameStore}
    musicStore={musicStore}
    width={gameDimensions}
    height={gameDimensions}
  />,
  document.getElementById("menu-container")
);

game.scene.add(SCENE_NAME.LOADING, Loading);
game.scene.add(SCENE_NAME.PLAY, Play);
game.scene.start(SCENE_NAME.LOADING);
