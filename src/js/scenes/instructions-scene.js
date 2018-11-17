import { Scene } from "phaser";
import { gameStore, GAME_STATES } from "../store/index";
import MobXProxy from "../helpers/mobx-proxy";
import { EventProxy } from "../game-objects/events/index";

export default class InstructionsScene extends Scene {
  create() {
    const { width, height } = this.game.config;
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.25);
    this.overlay.fillRect(0, 0, width, height);
    this.overlay.setAlpha(0);

    this.mobProxy = new MobXProxy();
    this.mobProxy.observe(gameStore, "gameState", change => {
      const state = change.newValue;
      if (state === GAME_STATES.INSTRUCTIONS) this.openInstructions();
      else this.closeInstructions();
    });

    this.proxy = new EventProxy();
    this.proxy.on(this.events, "shutdown", this.shutdown, this);
  }

  openInstructions() {
    if (this.overlayTween) this.overlayTween.stop();
    this.overlayTween = this.tweens.add({
      targets: this.overlay,
      duration: 350,
      ease: "Quad.easeOut",
      alpha: 1
    });
  }

  closeInstructions() {
    if (this.overlayTween) this.overlayTween.stop();
    this.overlayTween = this.tweens.add({
      targets: this.overlay,
      duration: 350,
      ease: "Quad.easeOut",
      alpha: 0
    });
  }

  shutdown() {
    if (this.overlayTween) this.overlayTween.stop();
    this.proxy.removeAll();
    this.mobProxy.destroy();
  }
}
