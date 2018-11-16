import { PLAYER_CARD_INFO } from "./player-card-info";
import Phaser from "phaser";
import { EventProxy } from "../../events";
import { observe } from "mobx";
import { gameStore } from "../../../store";
import FlipEffect from "../../shared-components/flip-effect";
import TweenManager from "../../shared-components/tween-manager";

const CARD_STATE = {
  DRAWING: "DRAWING",
  IDLE: "IDLE",
  FOCUSED: "FOCUSED",
  DRAGGING: "DRAGGING",
  RETURNING: "RETURNING"
};

const DRAG_SCALE = 0.8;

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
    this.tweenManager = new TweenManager(scene);
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

    this.cardFront = scene.add
      .container(x, y, [
        this.cardShadow,
        this.card,
        this.cardContents,
        this.costDisplay,
        this.outline
      ])
      .setSize(this.card.width, this.card.height)
      .setInteractive();

    this.cardBack = scene.add.container(x, y, [
      scene.add.sprite(0, 0, "assets", "cards/card-shadow"),
      scene.add.sprite(0, 0, "assets", "cards/card-back")
    ]);

    this.initialFlip = new FlipEffect(scene, this.cardFront, this.cardBack)
      .setToBack()
      .flipToFront();
    this.eventProxy.once(this.initialFlip.events, "complete", () => {
      this.cardBack.destroy();
      this.cardBack = undefined;
      this.initialFlip.destroy();
    });

    this.isFocusEnabled = true;
    this.disableFocusing();

    this.isDragEnabled = true;
    this.disableDrag();

    this.state = CARD_STATE.DRAWING;

    // Giant hack just to get a feel for what flipping could be like
    if (this.cardInfo.energy > 0 && type.startsWith("ATTACK")) {
      const energy = this.cardInfo.energy;
      const energyKey = `cards/card-contents-energy${energy === 3 ? "-3" : ""}`;
      this.reclaimBack = scene.add
        .container(x, y, [
          scene.add.sprite(0, 0, "assets", "cards/card-shadow"),
          scene.add.sprite(0, 0, "assets", "cards/card"),
          scene.add.sprite(1, 1, "assets", "cards/card-outline"),
          scene.add.sprite(0, 0, "assets", energyKey)
        ])
        .setScale(DRAG_SCALE, DRAG_SCALE);

      this.reclaimFlip = new FlipEffect(scene, this.cardFront, this.reclaimBack, {
        frontScale: DRAG_SCALE,
        backScale: DRAG_SCALE
      }).setToFront();

      observe(gameStore, "isTargetingDropZone", change => {
        if (gameStore.activeCard !== this) return;
        const isTargetingDropZone = change.newValue;
        if (isTargetingDropZone) this.reclaimFlip.flipToBack();
        else this.reclaimFlip.flipToFront();
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
    const needsUpdate = this.x !== x || this.y !== y || this.rotation !== rotation;

    this.targetHandX = x;
    this.targetHandY = y;
    this.targetHandRotation = rotation;

    if (needsUpdate) this.moveToHand();
  }

  /**
   * @param {number} [speed=1] Speed in pixels / ms
   */
  moveToHand(speed = 1) {
    const { x, y, targetHandX, targetHandY, targetHandRotation } = this;
    const distance = Phaser.Math.Distance.Between(x, y, targetHandX, targetHandY);
    const durationMs = distance / speed;
    this.tweenManager.stop("handTween");
    this.tweenManager.add("handTween", {
      targets: this,
      x: targetHandX,
      y: targetHandY,
      rotation: targetHandRotation,
      duration: durationMs,
      ease: "Quad.easeOut",
      onComplete: () => (this.state = CARD_STATE.IDLE)
    });
  }

  /**
   * Get position of the card. By default, returns the center, but it can return any point on the
   * card via the optional origin parameter
   */
  getPosition(originX = 0.5, originY = 0.5) {
    const x = originX * this.card.displayWidth - this.card.displayWidth / 2;
    const y = originY * this.card.displayHeight - this.card.displayHeight / 2;
    const p = this.cardFront.localTransform.transformPoint(x, y);
    return p;
  }

  enableFocusing() {
    if (!this.isFocusEnabled) {
      this.isFocusEnabled = true;
      this.eventProxy.on(this.cardFront, "pointerover", this.onPointerOver, this);
      this.eventProxy.on(this.cardFront, "pointerout", this.onPointerOut, this);
    }
  }

  disableFocusing() {
    if (this.isFocusEnabled) {
      this.isFocusEnabled = false;
      this.eventProxy.off(this.cardFront, "pointerover", this.onPointerOver, this);
      this.eventProxy.off(this.cardFront, "pointerout", this.onPointerOut, this);
    }
  }

  enableDrag() {
    if (!this.isDragEnabled) {
      this.isDragEnabled = true;
      this.scene.input.setDraggable(this.cardFront, true);
      this.eventProxy.on(this.cardFront, "dragstart", this.onDragStart, this);
      this.eventProxy.on(this.cardFront, "drag", this.onDrag, this);
      this.eventProxy.on(this.cardFront, "dragend", this.onDragEnd, this);
    }
  }

  disableDrag() {
    if (this.isDragEnabled) {
      this.isDragEnabled = false;
      this.scene.input.setDraggable(this.cardFront, false);
      this.eventProxy.off(this.cardFront, "dragstart", this.onDragStart, this);
      this.eventProxy.off(this.cardFront, "drag", this.onDrag, this);
      this.eventProxy.off(this.cardFront, "dragend", this.onDragEnd, this);
    }
  }

  onDragStart(pointer) {
    this.state = CARD_STATE.DRAGGING;

    // TODO: we need a better way to compose and selectively stop tweens

    // Zero out rotation & focus and scale down
    this.tweenManager.stopAll();
    this.tweenManager.add("dragStartZero", {
      targets: this,
      rotation: 0,
      focusOffset: 0,
      duration: 200,
      ease: "Quad.easeOut"
    });
    this.tweenManager.add("dragStartScale", {
      targets: this.cardFront,
      scaleX: DRAG_SCALE,
      scaleY: DRAG_SCALE,
      duration: 200,
      ease: "Quad.easeOut"
    });

    this.dragOffsetX = (this.x - pointer.x) * DRAG_SCALE;
    this.dragOffsetY = (this.y - pointer.y) * DRAG_SCALE;

    this.x = pointer.x + this.dragOffsetX;
    this.y = pointer.y + this.dragOffsetY;

    // Allow pointer events to pass through to other objects
    this.cardFront.disableInteractive();

    this.showOutline();

    this.cardEmitter.emit("dragstart", this);
  }

  onDrag(pointer) {
    this.x = pointer.x + this.dragOffsetX;
    this.y = pointer.y + this.dragOffsetY;

    this.cardEmitter.emit("drag", this);
  }

  onDragEnd(pointer) {
    this.x = pointer.x + this.dragOffsetX;
    this.y = pointer.y + this.dragOffsetY;

    this.cardFront.setInteractive();

    this.state = CARD_STATE.RETURNING;

    // It's possible for the flip effect and the below tween to fight with one another and result in
    // the card ending in the wrong final scale value. To fix that, force the flip to be done.
    if (this.reclaimFlip && this.reclaimFlip.isFlipping()) {
      this.reclaimFlip.stopFlip();
      this.reclaimFlip.setToFront();
    }

    this.tweenManager.stopAll();
    this.tweenManager.add("dragEndScale", {
      targets: this.cardFront,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });

    this.moveToHand(1500 / 1000); // px/s => px/ms
    this.hideOutline();

    this.cardEmitter.emit("dragend", this);
  }

  onPointerOver() {
    if (this.state === CARD_STATE.IDLE) {
      this.cardEmitter.emit("pointerover", this);
      this.state = CARD_STATE.FOCUSED;
      this.tweenManager.stop("focus");
      this.tweenManager.add("focus", {
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
      this.tweenManager.stop("focus");
      this.tweenManager.add("focus", {
        targets: this,
        focusOffset: 0,
        duration: 200,
        ease: "Quad.easeOut"
      });
    }
  }

  setDepth(depth) {
    this.cardFront.setDepth(depth);
    if (this.cardBack) this.cardBack.setDepth(depth);
    if (this.reclaimBack) this.reclaimBack.setDepth(depth);
  }

  showOutline() {
    this.tweenManager.stop("outline");
    this.tweenManager.add("outline", {
      targets: this.outline,
      alpha: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  hideOutline() {
    this.tweenManager.stop("outline");
    this.tweenManager.add("outline", {
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
    this.cardFront.x = this.x + focusOffsetX;
    this.cardFront.y = this.y + focusOffsetY;
    this.cardFront.rotation = this.rotation;
    if (this.cardBack) {
      this.cardBack.x = this.cardFront.x;
      this.cardBack.y = this.cardFront.y;
      this.cardBack.rotation = this.cardFront.rotation;
    }
    if (this.reclaimBack) {
      this.reclaimBack.x = this.cardFront.x;
      this.reclaimBack.y = this.cardFront.y;
      this.reclaimBack.rotation = this.cardFront.rotation;
    }
  }

  destroy() {
    this.eventProxy.removeAll();
    if (this.reclaimBack) this.reclaimBack.destroy();
    if (this.reclaimFlip) this.reclaimFlip.destroy();
    this.scene.lifecycle.remove(this);
    this.scene.tweens.killTweensOf(this.cardFront);
    this.tweenManager.destroy();
    this.cardFront.destroy();
    this.initialFlip.destroy();
  }
}
