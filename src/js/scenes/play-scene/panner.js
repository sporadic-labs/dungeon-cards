import { EventProxy } from "../../game-objects/events";

/**
 * Util class to control panning between menu area and the game area.
 * @class CameraPanner
 */
export default class CameraPanner {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.Cameras.Scene2D} camera
   * @memberof CameraPanner
   */
  constructor(scene, camera) {
    this.time = scene.time;
    this.camera = camera;
    this.panEvent = null;
    this.duration = 600;
    this.menuX = 1200;
    this.gameX = 400;
    this.proxy = new EventProxy();
    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destory", this.destroy, this);
  }
  setToMenuArea() {
    this.camera.scrollX = this.menuX;
  }
  setToGameArea() {
    this.camera.scrollX = this.gameX;
  }
  tweenToMenuArea() {
    this.stopPan();
    this.camera.pan(this.menuX, this.camera.midPoint.y, this.duration, "Expo", false);
  }
  tweenToGameArea() {
    // Delay gives DOM menu time to disappear
    this.panEvent = this.time.delayedCall(200, () =>
      this.camera.pan(this.gameX, this.camera.midPoint.y, this.duration, "Expo", false)
    );
  }
  stopPan() {
    this.camera.panEffect.reset();
    if (this.panEvent) this.panEvent.destroy();
  }
  destroy() {
    this.stopPan();
    this.proxy.removeAll();
  }
}
