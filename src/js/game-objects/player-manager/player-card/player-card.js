import { PLAYER_CARD_INFO } from "./player-card-info";
import Phaser from "phaser";
import { EventProxy } from "../../events/index";
import { observe } from "mobx";
import store from "../../../store/index";

export default class PlayerCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {PLAYER_CARD_TYPES} type
   */
  constructor(scene, type, x, y, cardEmitter) {
    scene.lifecycle.add(this);

    this.type = type;
    this.cardInfo = PLAYER_CARD_INFO[type];
    this.scene = scene;
    this.cardEmitter = cardEmitter;

    this.x = x;
    this.y = y;
    this.xShake = 0;
    this.yOffset = 0;
    this.selected = false;
    this.focused = false;
    this.eventProxy = new EventProxy();

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");

    this.key = PLAYER_CARD_INFO[type].key;
    this.cardContents = scene.add.sprite(0, 0, "assets", this.key);

    // TODO(rex): Outline needs to be offset slightly for placement.  Fix this in the sprite.
    this.outline = scene.add.sprite(1, 1, "assets", `cards/card-outline`);
    this.outline.setAlpha(0);

    const cost = this.getCost();
    this.costDisplay = scene.add.sprite(0, 0, "assets", `cards/card-contents-cost-${cost}`);

    this.container = scene.add
      .container(x + this.card.width / 2, y + this.card.height / 2, [
        this.cardShadow,
        this.outline,
        this.card,
        this.cardContents,
        this.costDisplay
      ])
      .setSize(this.cardContents.width, this.cardContents.height)
      .setInteractive();

    this.isFocusEnabled = true;
    this.disableFocusing();

    this.isDragEnabled = true;
    this.disableDrag();
  }

  isInBounds(x, y) {
    const bounds = this.container.getBounds();
    const x1 = bounds.x;
    const x2 = bounds.x + bounds.width;
    const y1 = bounds.y;
    const y2 = bounds.y + bounds.height;
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
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
    if (!this.isFocusEnabled) {
      this.isFocusEnabled = true;
      this.eventProxy.on(this.container, "pointerover", this.onPointerOver, this);
      this.eventProxy.on(this.container, "pointerout", this.onPointerOut, this);
    }
  }

  disableFocusing() {
    if (this.isFocusEnabled) {
      this.isFocusEnabled = false;
      this.eventProxy.off(this.container, "pointerover", this.onPointerOver, this);
      this.eventProxy.off(this.container, "pointerout", this.onPointerOut, this);
    }
  }

  enableDrag() {
    if (!this.isDragEnabled) {
      this.isDragEnabled = true;
      this.scene.input.setDraggable(this.container, true);
      this.eventProxy.on(this.container, "dragstart", this.onDragStart, this);
      this.eventProxy.on(this.container, "drag", this.onDrag, this);
      this.eventProxy.on(this.container, "dragend", this.onDragEnd, this);
    }
  }

  disableDrag() {
    if (this.isDragEnabled) {
      this.isDragEnabled = false;
      this.scene.input.setDraggable(this.container, false);
      this.eventProxy.off(this.container, "dragstart", this.onDragStart, this);
      this.eventProxy.off(this.container, "drag", this.onDrag, this);
      this.eventProxy.off(this.container, "dragend", this.onDragEnd, this);
    }
  }

  onDragStart(pointer) {
    // TODO: tween these without them being interrupted by focus/select tweens
    this.container.setScale(0.9);
    this.container.setAlpha(0.9);
    this.setRotation(0);

    this.yOffset = 0;

    this.dragOffsetX = (this.x - pointer.x) * this.container.scaleX;
    this.dragOffsetY = (this.y - pointer.y) * this.container.scaleY;

    this.x = pointer.x + this.dragOffsetX;
    this.y = pointer.y + this.dragOffsetY;

    // Allow pointer events to pass through to other objects
    this.container.disableInteractive();

    this.cardEmitter.emit("dragstart", this);
  }

  onDrag(pointer) {
    this.x = pointer.x + this.dragOffsetX;
    this.y = pointer.y + this.dragOffsetY;

    this.cardEmitter.emit("drag", this);
  }

  onDragEnd(pointer) {
    // TODO: tween these without them being interrupted by focus/select tweens
    this.container.setScale(1);
    this.container.setAlpha(1);

    this.x = pointer.x + this.dragOffsetX;
    this.y = pointer.y + this.dragOffsetY;

    this.container.setInteractive();

    this.cardEmitter.emit("dragend", this);
  }

  onPointerOver() {
    this.cardEmitter.emit("pointerover", this);
  }

  onPointerOut() {
    this.cardEmitter.emit("pointerout", this);
  }

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

  destroy() {
    this.eventProxy.removeAll();
    this.scene.lifecycle.remove(this);
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
