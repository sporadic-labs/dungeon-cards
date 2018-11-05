import { Scene } from "phaser";

export default class BackgroundScene extends Scene {
  create() {
    const { width, height } = this.sys.game.config;
    this.add.tileSprite(0, 0, 2 * width, 1 * height, "assets", "background-vector").setOrigin(0, 0);
  }
}
