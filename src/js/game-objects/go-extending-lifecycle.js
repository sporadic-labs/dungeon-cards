import LifecycleObject from "./lifecycle-object";

export default class RotatingGameObject extends LifecycleObject {
  constructor(scene, x, y, texture, frame) {
    super(scene);

    this.sprite = scene.add.sprite(x, y, texture, frame);
    this.sprite.setScale(3);
  }

  preUpdate(time, delta) {
    this.sprite.rotation += 0.15;
  }

  postUpdate(time, delta) {
    // noop
  }

  update(time, delta) {
    this.sprite.alpha = (Math.sin(time / 500) + 1) / 2;
  }

  destroy() {
    this.sprite.destroy();
    super.destroy();
  }
}
