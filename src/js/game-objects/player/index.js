import LifecycleObject from "../lifecycle-object";
import MovementController from "./movement-controller";

export default class Player extends LifecycleObject {
  constructor(scene, x, y) {
    super(scene);

    this.sprite = scene.add.sprite(x, y, "assets", "kenney-ship.png");
    scene.physics.world.enable(this.sprite);
    this.movementController = new MovementController(this, this.sprite.body, scene);
  }

  update(time, delta) {
    this.movementController.update(time, delta);
  }

  destroy() {
    this.movementController.destroy();
    this.sprite.destroy();
    super.destroy();
  }
}
