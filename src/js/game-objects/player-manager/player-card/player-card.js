import { PLAYER_CARD_INFO } from "./player-card-info";
import Phaser from "phaser";
import { EventProxy } from "../../events/index";
import { observe } from "mobx";
import store from "../../../store/index";

const CARD_STATE = {
  IDLE: "IDLE",
  FOCUSED: "FOCUSED",
  DRAGGING: "DRAGGING",
  RETURNING: "RETURNING"
};

export default class PlayerCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {PLAYER_CARD_TYPES} type
   */
  constructor(scene, type, x, y, cardEmitter) {
    scene.lifecycle.add(this);

    this.type = type;
    this.cardInfo = PLAYER_CARD_INFO[type];
    this.key = PLAYER_CARD_INFO[type].key;
    this.scene = scene;
    this.cardEmitter = cardEmitter;

    this.focusOffset = 0;
    this.eventProxy = new EventProxy();
    this.state = CARD_STATE.IDLE;
    this.x = x;
    this.y = y;
    this.rotation = 0;

    // Target position for the card within the hand
    this.targetHandX = x;
    this.targetHandY = y;
    this.targetHandRotation = 0;

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");
    this.cardContents = scene.add.sprite(0, 0, "assets", this.key);

    // TODO(rex): Outline needs to be offset slightly for placement.  Fix this in the sprite.
    this.outline = scene.add.sprite(1, 1, "assets", `cards/card-outline`).setAlpha(0);

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

    // Giant hack just to get a feel for what flipping could be like
    if (this.cardInfo.energy > 0 && type.startsWith("ATTACK")) {
      observe(store, "isTargetingReclaim", change => {
        if (store.activeCard !== this) return;
        const isTargetingReclaim = change.newValue;
        let newFrame = this.key;
        let hideCost = false;
        if (isTargetingReclaim) {
          if (this.cardInfo.energy === 3) newFrame = "cards/card-contents-energy-3";
          else newFrame = "cards/card-contents-energy";
          hideCost = true;
        }
        const flip = (newFrame, side, hideCost = false) => {
          this.scene.tweens.killTweensOf(this);
          this.scene.tweens.add({
            targets: this.container,
            scaleX: side,
            duration: 200,
            ease: "Quad.easeOut",
            onUpdate: ({ progress }) => {
              if (progress > 0.5) {
                this.cardContents.setTexture("assets", newFrame);
                this.costDisplay.setVisible(!hideCost);
                if (side < 0) this.cardContents.scaleX = -1; // Flip back to normal shadow
              }
            }
          });
        };
        const direction = newFrame.includes("energy") ? -1 : 1;
        flip(newFrame, direction, hideCost);
      });
    }
  }

  getEnergy() {
    return PLAYER_CARD_INFO[this.type].energy;
  }

  getCost() {
    return PLAYER_CARD_INFO[this.type].cost;
  }

  // Center of card, rotation in radians
  setTargetHandPlacement(x, y, rotation) {
    this.targetHandX = x;
    this.targetHandY = y;
    this.targetHandRotation = rotation;

    if (![CARD_STATE.RETURNING, CARD_STATE.DRAGGING].includes(this.state)) {
      this.x = x;
      this.y = y;
      this.rotation = rotation;
    }
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
    this.state = CARD_STATE.DRAGGING;

    // TODO: tween these without them being interrupted by focus/select tweens
    this.container.setScale(0.9);
    this.container.setAlpha(0.9);
    this.rotation = 0;

    // Kill any focus. TODO: we need a better way to compose and selectively stop tweens
    this.scene.tweens.killTweensOf(this);
    this.focusOffset = 0;

    this.dragOffsetX = (this.x - pointer.x) * this.container.scaleX;
    this.dragOffsetY = (this.y - pointer.y) * this.container.scaleY;

    this.x = pointer.x + this.dragOffsetX;
    this.y = pointer.y + this.dragOffsetY;

    // Allow pointer events to pass through to other objects
    this.container.disableInteractive();

    this.cardEmitter.emit("dragstart", this);

    this.showOutline();
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

    this.state = CARD_STATE.RETURNING;

    const speed = 1500 / 1000; // px/s => px/ms
    const { x, y, targetHandX, targetHandY, targetHandRotation } = this;
    const distance = Phaser.Math.Distance.Between(x, y, targetHandX, targetHandY);
    const durationMs = distance / speed;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      x: targetHandX,
      y: targetHandY,
      rotation: targetHandRotation,
      duration: durationMs,
      ease: "Quad.easeOut",
      onComplete: () => (this.state = CARD_STATE.IDLE)
    });

    this.hideOutline();
  }

  onPointerOver() {
    if (this.state === CARD_STATE.IDLE) {
      this.cardEmitter.emit("pointerover", this);
      this.state = CARD_STATE.FOCUSED;
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.add({
        targets: this,
        focusOffset: -20,
        duration: 200,
        ease: "Quad.easeOut"
      });
    }
  }

  onPointerOut() {
    if (this.state === CARD_STATE.FOCUSED) {
      this.cardEmitter.emit("pointerout", this);
      this.state = CARD_STATE.IDLE;
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.add({
        targets: this,
        focusOffset: 0,
        duration: 200,
        ease: "Quad.easeOut"
      });
    }
  }

  setDepth(depth) {
    this.container.setDepth(depth);
  }

  showOutline() {
    this.scene.tweens.killTweensOf(this.outline);
    this.scene.tweens.add({
      targets: this.outline,
      alpha: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  hideOutline() {
    this.scene.tweens.killTweensOf(this.outline);
    this.scene.tweens.add({
      targets: this.outline,
      alpha: 0,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  postUpdate() {
    let focusOffsetX = 0;
    let focusOffsetY = 0;
    if (this.focusOffset !== 0) {
      focusOffsetX = Math.cos(this.rotation - Math.PI / 2) * -this.focusOffset;
      focusOffsetY = Math.sin(this.rotation - Math.PI / 2) * -this.focusOffset;
    }
    this.container.x = this.x + focusOffsetX;
    this.container.y = this.y + focusOffsetY;
    this.container.rotation = this.rotation;
  }

  destroy() {
    this.eventProxy.removeAll();
    this.scene.lifecycle.remove(this);
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
