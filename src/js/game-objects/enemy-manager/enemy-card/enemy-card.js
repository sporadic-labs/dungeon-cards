import ENEMY_CARD_TYPES from "./enemy-card-types";
import { emitter, EVENT_NAMES } from "../../events";
import LifecycleObject from "../../lifecycle-object";

export default class EnemyCard extends LifecycleObject {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y) {
    super(scene);

    this.scene = scene;
    this.type = type;

    this.x = x;
    this.y = y;
    this.alpha = 1;

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");

    const key = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? "big" : "small";
    this.cardContents = scene.add
      .sprite(0, 0, "assets", `cards/card-contents-enemy-${key}`)
      .setOrigin(0.5, 0.5)
      .setInteractive();
    this.setPosition(x, y);

    this.group = scene.add.group();
    this.group.add(this.card);
    this.group.add(this.cardShadow);
    this.group.add(this.cardContents);

    this.health = type === ENEMY_CARD_TYPES.STRONG_ENEMY ? 2 : 1;

    this.selected = false;
    this.focused = false;
    this.blocked = false;
    this.turnsBlocked = null;

    // TODO: this should only be enabled after the card as tweened into position. It shouldn't start
    // enabled.
    this.enableFocusing();
  }

  setBlocked(shouldBeBlocked = true) {
    // TODO: this could be an animation, or cards could be built more modularly, so that we can have
    // a blocked overlay.
    if (this.blocked !== shouldBeBlocked) {
      this.blocked = shouldBeBlocked;
      this.turnsBlocked = 0;
      this.updateTexture();
    }

    // Unblock after the end of the next enemy turn
    if (this.blocked) {
      emitter.once(EVENT_NAMES.ENEMY_TURN_END, () => this.setBlocked(false));
    }
  }

  updateTexture() {
    let key = this.health === 2 ? "big" : "small";
    if (this.blocked) key += "-blocked";
    // TODO: add block overlay
    this.cardContents.setTexture("assets", `cards/card-contents-enemy-${key}`);
  }

  isBlocked() {
    return this.blocked;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health > 0) this.updateTexture();
  }

  getPosition() {
    return { x: this.cardContents.x, y: this.cardContents.y };
  }

  // Set via top left
  setPosition(x, y) {
    this.x = x + this.cardContents.width / 2;
    this.y = y + this.cardContents.height / 2;
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
  }

  disableSelecting() {
    this.cardContents.off("pointerdown", this.onPointerDown);
  }

  onPointerOver = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_FOCUS, this);

  onPointerOut = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_DEFOCUS, this);

  onPointerDown = () => emitter.emit(EVENT_NAMES.ENEMY_CARD_SELECT, this);

  focus() {
    if (this.focused) return;
    this.focused = true;

    this.scene.tweens.killTweensOf(this.cardContents);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.cardContents,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  defocus() {
    if (!this.focused) return;
    this.focused = false;

    this.scene.tweens.killTweensOf(this.cardContents);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.cardContents,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  fadeIn(delay) {
    this.scene.tweens.killTweensOf(this);
    this.alpha = 0;
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  fadeOut(delay) {
    this.scene.tweens.killTweensOf(this);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  die(delay) {
    this.disableFocusing();
    this.disableSelecting();
    return this.fadeOut(delay);
  }

  // Move via top left
  moveTo(x, y, delay = 0) {
    this.scene.tweens.killTweensOf(this);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this,
        x: x + this.cardContents.width / 2,
        y: y + this.cardContents.height / 2,
        delay: delay,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  beforeTurnEnd() {
    if (this.blocked) {
      this.turnsBlocked++;
      if (this.turnsBlocked === 1) this.setBlocked(false);
    }
  }

  update() {
    Phaser.Actions.SetXY(this.group.getChildren(), this.x, this.y);
    Phaser.Actions.SetAlpha(this.group.getChildren(), this.alpha);
  }

  destroy() {
    this.cardContents.destroy();
    this.card.destroy();
    this.cardShadow.destroy();
  }
}
