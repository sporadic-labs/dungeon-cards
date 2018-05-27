import Phaser from "phaser";
import GameObjectExtendingLifecycle from "../game-objects/go-extending-lifecycle";
import Player from "../game-objects/player/";

export default class Scene extends Phaser.Scene {
  create() {
    this.add
      .tileSprite(0, 0, 750, 750, "assets", "subtle-pattern-ep-natural-black")
      .setOrigin(0, 0);

    this.rotatingGameObject = new GameObjectExtendingLifecycle(this, 100, 300, "assets", "ship");

    new Player(this, 50, 50);
  }

  update(time, delta) {
    if (time > 5000 && this.rotatingGameObject) {
      this.rotatingGameObject.destroy();
      this.rotatingGameObject = null;
    }
  }
}
