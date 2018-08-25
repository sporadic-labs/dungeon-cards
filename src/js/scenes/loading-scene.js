/**
 * LoadingScene - this is the loading screen
 */

import { Scene } from "phaser";
import { SCENE_NAME } from "./index.js";
import { loadFonts } from "../font";
import logger from "../helpers/logger";
import store from "../store/index.js";
import { MENU_STATES } from "../menu/menu-states.js";
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

    this.load.audio(
      "music",
      "sounds/music/Chris_Zabriskie_-_05_-_Air_Hockey_Saloon_Compressed.mp3"
    );

    this.load.audio("click1", "sounds/ui/click1.wav");
  }

  create() {
    const { musicPlayer } = this.sys.game.globals;
    musicPlayer.init();

    const dispose = autorun(() => {
      if (store.hasGameStarted) {
        this.scene.start(SCENE_NAME.PLAY);
        dispose();
      }
    });

    // Fail gracefully by allowing the game to load even if the fonts errored
    if (this.fontsLoaded || this.fontsErrored) {
      store.setMenuState(MENU_STATES.START_MENU);
    }
  }
}
