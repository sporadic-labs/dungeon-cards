import "babel-polyfill";
import "../css/main.scss";

import { AUTO, Game } from "phaser";
import { SCENE_NAME, installScenes } from "./scenes";
import logger, { LOG_LEVEL } from "./helpers/logger";
import PhaserLifecyclePlugin from "phaser-lifecycle-plugin/src/";

import React from "react";
import { render } from "react-dom";

import Menu from "./menu/menu-app";
import { gameStore, preferencesStore } from "./store";
import { GameMusicPlayer, gameMusicStore } from "./sound/game-music/index";
import GameSfxPlayer from "./sound/game-sfx-player/index";
import disableRightClickMenu from "./helpers/disable-right-click-menu";
import makeGameResponsive from "./helpers/make-game-responsive";

logger.setLevel(IS_PRODUCTION ? LOG_LEVEL.OFF : LOG_LEVEL.ALL);
if (IS_PRODUCTION) disableRightClickMenu("root");

const gameResolution = 800;
const canvas = document.querySelector("canvas");
const game = new Game({
  type: AUTO,
  canvas,
  width: gameResolution,
  height: gameResolution,
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

// Setup Menus
render(
  <Menu
    gameStore={gameStore}
    preferencesStore={preferencesStore}
    musicStore={gameMusicStore}
    sfxPlayer={sfxPlayer}
  />,
  document.getElementById("menu-container")
);

installScenes(game);
game.scene.start(SCENE_NAME.LOADING);

makeGameResponsive("root", 600, gameResolution);
