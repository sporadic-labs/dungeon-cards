import Phaser from "phaser";
import DraggableCard from "../game-objects/draggable-card";

export default class PlayScene extends Phaser.Scene {
  create() {
    this.add
      .tileSprite(0, 0, 750, 750, "assets", "subtle-pattern-ep-natural-black")
      .setOrigin(0, 0);

    new DraggableCard(this, 100, 100);
    new DraggableCard(this, 300, 100);
    new DraggableCard(this, 500, 100);
  }

  update(time, delta) {}
}
