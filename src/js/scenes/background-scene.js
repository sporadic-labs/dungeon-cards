import { Scene } from "phaser";

export default class BackgroundScene extends Scene {
  create() {
    const { width, height } = this.sys.game.config;
    this.add.tileSprite(0, 0, 10 * width, 10 * height, "assets", "background-vector");
  }
}
