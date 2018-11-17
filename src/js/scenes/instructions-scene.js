import { Scene } from "phaser";

export default class InstructionsScene extends Scene {
  create() {
    const { width, height } = this.game.config;
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.25);
    this.overlay.fillRect(0, 0, width, height);
    this.overlay.setAlpha(0);
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
}
