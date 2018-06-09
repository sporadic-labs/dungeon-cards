/**
 * LoadingScene - this is the loading screen
 */

import { Scene } from "phaser";
import { SCENE_NAME } from "./index.js";
import { loadFonts } from "../font";
import logger from "../helpers/logger";

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
  }

  create() {
    // Fail gracefully by allowing the game to load even if the fonts errored
    if (this.fontsLoaded || this.fontsErrored) {
      this.scene.start(SCENE_NAME.PLAY);
    }
  }
}
