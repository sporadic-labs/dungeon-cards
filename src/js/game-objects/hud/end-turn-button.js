import { emitter, EVENT_NAMES, EventProxy } from "../events";
import Button from "./button";

/**
 * @export
 * @class EndTurnButton
 */
export default class EndTurnButton {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y, origin) {
    this.scene = scene;

    this.button = new Button(scene, x, y, {
      framePrefix: "ui/end-turn-",
      origin,
      onDown: () => emitter.emit(EVENT_NAMES.PLAYER_TURN_ATTEMPT_COMPLETE)
    });

    this.proxy = new EventProxy();
    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  activate() {
    this.button.sprite.setAlpha(1);
    this.button.enableInteractivity();
  }

  deactivate() {
    this.button.sprite.setAlpha(0.8);
    this.button.disableInteractivity();
  }

  destroy() {
    this.button.destroy();
    this.proxy.removeAll();
  }
}
