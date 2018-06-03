import LifecycleObject from "../lifecycle-object";

export default class DraggableCard extends LifecycleObject {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} x
   * @param {*} y
   * @memberof Player
   */
  constructor(scene, x, y, frame) {
    super(scene);

    this.sprite = scene.add
      .sprite(x, y, "assets", frame)
      .setDepth(3)
      .setInteractive(); // Enables pointer events but not drag

    scene.input.setDraggable(this.sprite);
    this.sprite.on("pointerover", () => this.sprite.setTint(0x8fdaff));
    this.sprite.on("pointerout", () => this.sprite.setTint(0xffffff));
    this.sprite.on("dragstart", this.onDragStart);
    this.sprite.on("drag", this.onDrag);
    this.sprite.on("dragend", this.onDragEnd);
  }

  onDragStart = (pointer, dragX, dragY) => {
    this.scene.children.bringToTop(this.sprite);
    this.sprite.setScale(1.1, 1.1);
  };

  onDrag = (pointer, dragX, dragY) => this.sprite.setPosition(dragX, dragY);

  onDragEnd = (pointer, dragX, dragY) => this.sprite.setScale(1, 1);

  update(time, delta) {}

  destroy() {
    this.sprite.destroy();
    super.destroy();
  }
}
