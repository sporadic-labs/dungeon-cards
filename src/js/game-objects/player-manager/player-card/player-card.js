import { PLAYER_CARD_INFO } from "./player-card-info";
import { emitter, EVENT_NAMES } from "../../events";
import Phaser from "phaser";

export default class PlayerCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {PLAYER_CARD_TYPES} type
   */
  constructor(scene, type, x, y) {
    scene.lifecycle.add(this);

    this.type = type;
    this.cardInfo = PLAYER_CARD_INFO[type];
    this.scene = scene;

    this.x = x;
    this.y = y;
    this.xShake = 0;
    this.yOffset = 0;
    this.scale = 1;

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");

    const key = PLAYER_CARD_INFO[type].key;
    this.cardContents = scene.add.sprite(0, 0, "assets", key).setInteractive();

    // TODO(rex): Outline needs to be offset slightly for placement.  Fix this in the sprite.
    this.outline = scene.add.sprite(1, 1, "assets", `cards/card-outline`);
    this.outline.setAlpha(0);

    const cost = this.getCost();
    this.costDisplay = scene.add.sprite(0, 0, "assets", `cards/card-contents-cost-${cost}`);

    this.container = scene.add.container(x + this.card.width / 2, y + this.card.height / 2, [
      this.cardShadow,
      this.outline,
      this.card,
      this.cardContents,
      this.costDisplay
    ]);

    this.selected = false;
    this.focused = false;

    // TODO: Only be enabled after the card is tweened into position. It shouldn't start enabled.
    this.enableFocusing();
  }

  shake() {
    this.scene.tweens.killTweensOf(this);
    this.timeline = this.scene.tweens.timeline({
      targets: this,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      duration: 60,
      tweens: [
        { xShake: -1 },
        { xShake: +2 },
        { xShake: -4 },
        { xShake: +4 },
        { xShake: -4 },
        { xShake: 2 },
        { xShake: -1 }
      ]
    });
  }

  getEnergy() {
    return PLAYER_CARD_INFO[this.type].energy;
  }

  getCost() {
    return PLAYER_CARD_INFO[this.type].cost;
  }

  setPosition(x, y) {
    this.x = x + this.card.width / 2;
    this.y = y + this.card.height / 2;
  }

  /**
   * Get position of the card. By default, returns the center, but it can return any point on the
   * card via the optional origin parameter
   */
  getPosition(originX = 0.5, originY = 0.5) {
    const x = originX * this.card.displayWidth - this.card.displayWidth / 2;
    const y = originY * this.card.displayHeight - this.card.displayHeight / 2;
    const p = this.container.localTransform.transformPoint(x, y);
    return p;
  }

  enableFocusing() {
    this.cardContents.on("pointerover", this.onPointerOver);
    this.cardContents.on("pointerout", this.onPointerOut);
  }

  disableFocusing() {
    this.cardContents.off("pointerover", this.onPointerOver);
    this.cardContents.off("pointerout", this.onPointerOut);
  }

  enableSelecting() {
    this.cardContents.on("pointerdown", this.onPointerDown);
    this.scene.input.off("pointerup", this.onPointerRelease);
  }

  disableSelecting() {
    this.cardContents.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointerup", this.onPointerRelease);
  }

  onPointerOver = () => emitter.emit(EVENT_NAMES.PLAYER_CARD_FOCUS, this);

  onPointerOut = () => emitter.emit(EVENT_NAMES.PLAYER_CARD_DEFOCUS, this);

  onPointerDown = () => {
    const { PLAYER_CARD_SELECT } = EVENT_NAMES;
    emitter.emit(PLAYER_CARD_SELECT, this);
    this.scene.input.once("pointerup", this.onPointerRelease);
  };

  onPointerRelease = () => {
    const { PLAYER_CARD_DESELECT } = EVENT_NAMES;
    emitter.emit(PLAYER_CARD_DESELECT, this);
  };

  setDepth(depth) {
    this.container.setDepth(depth);
  }

  setRotation(radians) {
    this.container.rotation = radians;
  }

  focus() {
    if (this.focused) return;
    this.focused = true;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
    this.scene.tweens.add({
      targets: this,
      yOffset: -20,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  defocus() {
    if (!this.focused) return;
    this.focused = false;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
    this.scene.tweens.add({
      targets: this,
      yOffset: 0,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  select() {
    if (this.selected) return;
    this.selected = true;
    this.scene.tweens.killTweensOf(this.outline);
    this.scene.tweens.add({
      targets: this.outline,
      alpha: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  deselect() {
    if (!this.selected) return;
    this.selected = false;
    this.scene.tweens.killTweensOf(this.outline);
    this.scene.tweens.add({
      targets: this.outline,
      alpha: 0,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  postUpdate() {
    this.container.x = this.x + this.xShake;
    this.container.y = this.y + this.yOffset;
  }

  moveTo() {
    // Animate and move to world pixel positions
  }

  destroy() {
    this.scene.input.off("pointerup", this.onPointerRelease);
    this.container.destroy();
    this.scene.lifecycle.remove(this);
  }
}
