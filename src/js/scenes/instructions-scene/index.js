import { Scene } from "phaser";
import { gameStore, GAME_STATES } from "../../store/index";
import MobXProxy from "../../helpers/mobx-proxy";
import { EventProxy } from "../../game-objects/events/index";
import ModalDialog from "../../game-objects/hud/modal-dialog";
import instructions from "./instructions";
import Arrow from "../../game-objects/hud/arrow";

export default class InstructionsScene extends Scene {
  create() {
    const { width, height } = this.game.config;
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.1);
    this.overlay.fillRect(0, 0, width, height);
    this.overlay.setAlpha(0);

    this.mobProxy = new MobXProxy();
    this.mobProxy.observe(gameStore, "gameState", change => {
      const state = change.newValue;
      if (state === GAME_STATES.INSTRUCTIONS) this.openInstructions();
      else this.closeInstructions();
    });

    this.instructionIndex = 0;

    this.proxy = new EventProxy();
    this.proxy.on(this.events, "shutdown", this.shutdown, this);
  }

  onModalClick() {
    this.instructionIndex += 1;
    if (this.instructionIndex >= instructions.length) {
      this.closeInstructions();
      gameStore.setGameState(GAME_STATES.PLAY);
    } else {
      this.arrow.destroy();
      this.dialog.destroy();
      this.showInstructionStep(this.instructionIndex);
    }
  }

  showInstructionStep(i) {
    const { width, height } = this.game.config;
    const { title, text, modalPosition, arrowPosition, arrowAngle } = instructions[i];
    this.dialog = new ModalDialog(
      this,
      modalPosition.x,
      modalPosition.y,
      title,
      text,
      () => {
        this.onModalClick();
      },
      () => {
        this.closeInstructions();
        gameStore.setGameState(GAME_STATES.PLAY);
      }
    );
    this.arrow = new Arrow(this, arrowPosition.x, arrowPosition.y, arrowAngle);
  }

  openInstructions() {
    if (this.overlayTween) this.overlayTween.stop();
    this.overlayTween = this.tweens.add({
      targets: this.overlay,
      duration: 350,
      ease: "Quad.easeOut",
      alpha: 1
    });
    this.instructionIndex = 0;
    this.showInstructionStep(this.instructionIndex);
  }

  closeInstructions() {
    if (this.overlayTween) this.overlayTween.stop();
    this.overlayTween = this.tweens.add({
      targets: this.overlay,
      duration: 350,
      ease: "Quad.easeOut",
      alpha: 0
    });
    if (this.arrow) this.arrow.destroy();
    if (this.dialog) this.dialog.destroy();
  }

  shutdown() {
    if (this.overlayTween) this.overlayTween.stop();
    this.proxy.removeAll();
    this.mobProxy.destroy();
    if (this.arrow) this.arrow.destroy();
    if (this.dialog) this.dialog.destroy();
  }
}
