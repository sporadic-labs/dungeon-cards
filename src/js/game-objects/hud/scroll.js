import { emitter, EVENT_NAMES } from "../events";

/**
 * @export
 * @class Scroll
 */
export default class Scroll {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.scrollBackground = scene.add.sprite(x, y, "assets", "scroll/scroll");
  }

  destroy() {
    this.scrollBackground.destroy();
  }
}
