/**
 * LoadingScene - this is the loading screen
 */

import { Scene } from "phaser";
import { SCENE_NAME } from "./index";
import { loadFonts } from "../font";
import logger from "../helpers/logger";
import { gameStore, preferencesStore } from "../store";
import { MENU_STATES } from "../menu/menu-states";
import { autorun } from "mobx";

export default class LoadingScene extends Scene {
  preload() {
    const loadingBar = this.add.graphics();
    this.load.on("progress", value => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(0, 750 / 2 - 25, 750 * value, 50);
    });
    this.load.on("complete", () => loadingBar.destroy());

    this.fontsLoaded = false;
    this.fontsErrored = false;
    loadFonts(3000)
      .then(() => (this.fontsLoaded = true))
      .catch(error => {
        this.fontsErrored = true;
        logger.error(`Fonts unable to load! Error ${error}`);
      });

    this.load.setPath("resources/");
    this.load.atlas("assets", "atlases/assets.png", "atlases/assets.json");

    if (!preferencesStore.noAudio) {
      this.load.audio("music", "sounds/music/Galway.mp3");

      this.load.audio("click1", "sounds/ui/click1.wav");
      this.load.audio("sword-clash", "sounds/fx/sword-clash.wav");
    }
  }

  create() {
    if (!preferencesStore.noAudio) {
      const { musicPlayer } = this.sys.game.globals;
      musicPlayer.init();
    }

    if (preferencesStore.skipMenu) {
      this.scene.start(SCENE_NAME.PLAY);
      return;
    }

    const dispose = autorun(() => {
      if (gameStore.hasGameStarted) {
        this.scene.start(SCENE_NAME.PLAY);
        dispose();
      }
    });

    // Fail gracefully by allowing the game to load even if the fonts errored
    if (this.fontsLoaded || this.fontsErrored) {
      gameStore.setMenuState(MENU_STATES.START_MENU);
    }
  }
}
