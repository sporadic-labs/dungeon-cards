import Phaser from "phaser";
import GameObjectExtendingLifecycle from "../game-objects/go-extending-lifecycle";
import Player from "../game-objects/player/";

export default class Scene extends Phaser.Scene {
  create() {
    this.add
      .tileSprite(0, 0, 750, 750, "assets", "subtle-pattern-ep-natural-black")
      .setOrigin(0, 0);

  }

  update(time, delta) {
  }
}
