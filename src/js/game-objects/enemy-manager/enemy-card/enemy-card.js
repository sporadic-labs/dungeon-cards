import { ENEMY_CARD_INFO } from "./enemy-card-types";
import { emitter, EVENT_NAMES } from "../../events";
import FlipEffect from "../../shared-components/flip-effect";
import { EventProxy } from "../../events/index";

export default class EnemyCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {*} type
   */
  constructor(scene, type, x, y, emitter) {
    scene.lifecycle.add(this);

    this.scene = scene;
    this.type = type;
    this.health = ENEMY_CARD_INFO[type].health;

    this.x = x;
    this.y = y;

    this.cardEmitter = emitter;

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");
    const key = ENEMY_CARD_INFO[type].key;
    this.cardContents = scene.add.sprite(0, 0, "assets", key).setInteractive();
    const healthFrame = `cards/card-contents-enemy-health-${this.health}`;
    this.healthDisplay = scene.add.sprite(0, 0, "assets", healthFrame);

    this.cardBack = scene.add.container(x, y, [
      scene.add.sprite(0, 0, "assets", "cards/card-shadow"),
      scene.add.sprite(0, 0, "assets", "cards/card-back")
    ]);

    this.cardFront = scene.add
      .container(x, y, [this.cardShadow, this.card, this.cardContents, this.healthDisplay])
      .setSize(this.card.width, this.card.height)
      .setInteractive();

    this.eventProxy = new EventProxy();

    this.flipEffect = new FlipEffect(scene, this.cardFront, this.cardBack).setToBack();

    this.selected = false;
    this.focused = false;
    this.blocked = false;
    this.turnsBlocked = null;

    this.enableSoftFocus();
  }

  setBlocked(shouldBeBlocked = true) {
    if (this.blocked === shouldBeBlocked) return;

    this.blocked = shouldBeBlocked;
    this.turnsBlocked = 0;

    // Unblock after the end of the next enemy turn
    if (this.blocked) {
      if (!this.blockedOverlay) {
        this.blockedOverlay = this.scene.add.sprite(0, 0, "assets", "attacks/block");
        this.cardFront.add(this.blockedOverlay);
      }
      this.blockedOverlay.visible = true;
      emitter.once(EVENT_NAMES.ENEMY_TURN_END, () => this.setBlocked(false));
    } else {
      if (this.blockedOverlay) this.blockedOverlay.visible = false;
    }
  }

  isBlocked() {
    return this.blocked;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health > 0) {
      const key = this.health >= 2 ? "big" : "small";
      this.cardContents.setTexture("assets", `cards/card-contents-enemy-${key}`);
      const healthFrame = `cards/card-contents-enemy-health-${this.health}`;
      this.healthDisplay.setTexture("assets", healthFrame);
    }
  }

  getPosition() {
    return { x: this.card.x, y: this.card.y };
  }

  enableSelecting() {
    this.cardFront.on("pointerdown", this.onPointerDown, this);
  }

  disableSelecting() {
    this.cardFront.off("pointerdown", this.onPointerDown, this);
  }

  enableSoftFocus() {
    this.cardFront.on("pointerover", this.onPointerOver, this);
    this.cardFront.on("pointerout", this.onPointerOut, this);
  }

  disableSoftFocus() {
    this.cardFront.off("pointerover", this.onPointerOver, this);
    this.cardFront.off("pointerout", this.onPointerOut, this);
  }

  onPointerOver() {
    this.cardEmitter.emit(EVENT_NAMES.ENEMY_CARD_SOFT_FOCUS, this);
  }

  onPointerOut() {
    this.cardEmitter.emit(EVENT_NAMES.ENEMY_CARD_SOFT_DEFOCUS, this);
  }

  onPointerDown() {
    this.cardEmitter.emit(EVENT_NAMES.ENEMY_CARD_SELECT, this);
  }

  shake() {
    this.scene.tweens.killTweensOf(this.cardFront);
    const { x, y, angle } = this.cardFront;
    this.timeline = this.scene.tweens.timeline({
      targets: this.cardFront,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      loop: -1,
      duration: 40,
      tweens: [
        { x: x - 1, y: y - 1, angle: angle + 1 },
        { x: x + 1, y: y + 1.5, angle: angle - 1.5 },
        { x: x + 0.5, y: y + 1, angle: angle + 0.5 },
        { x: x - 1.5, y: y - 0.5, angle: angle - 0.5 }
      ]
    });
  }

  focus() {
    if (this.focused) return;
    this.focused = true;

    this.scene.tweens.killTweensOf(this.cardFront);
    // this.cardEmitter.emit("pointerover", this);

    // this.scene.tweens.killTweensOf(this.container);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.cardFront,
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

    this.scene.tweens.killTweensOf(this.cardFront);
    // this.cardEmitter.emit("pointerout", this);

    // this.scene.tweens.killTweensOf(this.container);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.cardFront,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  fadeIn(delay) {
    this.scene.tweens.killTweensOf([this.cardFront, this.cardBack]);
    this.cardFront.alpha = 0;
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: [this.cardFront, this.cardBack],
        alpha: 1,
        delay: delay,
        duration: 350,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  fadeOut(delay) {
    this.scene.tweens.killTweensOf([this.cardFront, this.cardBack]);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: [this.cardFront, this.cardBack],
        alpha: 0,
        delay: delay,
        duration: 350,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  die(delay) {
    this.disableSelecting();
    return this.fadeOut(delay);
  }

  // Move via center
  moveTo(x, y, delay = 0) {
    this.scene.tweens.killTweensOf([this.cardFront, this.cardBack]);
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: [this.cardFront, this.cardBack],
        x: x,
        y: y,
        delay: delay,
        duration: 350,
        ease: "Quad.easeOut",
        onComplete: resolve
      });
    });
  }

  flip() {
    return new Promise(resolve => {
      this.eventProxy.once(this.flipEffect.events, "complete", resolve);
      this.flipEffect.flipToFront();
    });
  }

  beforeTurnEnd() {
    if (this.blocked) {
      this.turnsBlocked++;
      if (this.turnsBlocked === 1) this.setBlocked(false);
    }
  }

  destroy() {
    this.eventProxy.removeAll();
    this.scene.lifecycle.remove(this);
    this.scene.tweens.killTweensOf([this.cardFront, this.cardBack]);
    this.cardFront.destroy();
    this.cardBack.destroy();
    this.flipEffect.destroy();
  }
}
