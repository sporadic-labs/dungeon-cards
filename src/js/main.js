import "babel-polyfill";
import "../css/main.scss";

import { AUTO, Game } from "phaser";
import { Loading, Play, SCENE_NAME } from "./scenes";
import logger, { LOG_LEVEL } from "./helpers/logger";
import PhaserLifecyclePlugin from "phaser-lifecycle-plugin/src/";

import React from "react";
import { render } from "react-dom";

import Menu from "./menu/menu-app";
import { gameStore, preferencesStore } from "./store";
import { GameMusicPlayer, gameMusicStore } from "./sound/game-music/index";
import GameSfxPlayer from "./sound/game-sfx-player/index";

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

const musicPlayer = new GameMusicPlayer(game, gameMusicStore, "music");
const sfxPlayer = new GameSfxPlayer(game);

game.globals = { musicStore: gameMusicStore, musicPlayer, sfxPlayer };

// Disable right click menu
document.getElementById(containerId).addEventListener("contextmenu", e => {
  e.preventDefault();
  return false;
});

// Setup Menus
render(
  <Menu
    gameStore={gameStore}
    preferencesStore={preferencesStore}
    musicStore={gameMusicStore}
    sfxPlayer={sfxPlayer}
    width={gameDimensions}
    height={gameDimensions}
  />,
  document.getElementById("menu-container")
);

game.scene.add(SCENE_NAME.LOADING, Loading);
game.scene.add(SCENE_NAME.PLAY, Play);
game.scene.start(SCENE_NAME.LOADING);
