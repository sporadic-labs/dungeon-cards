import { PLAYER_CARD_INFO } from "./player-card-info";
import { emitter, EVENT_NAMES } from "../events";
import LifecycleObject from "../../lifecycle-object";

export default class PlayerCard extends LifecycleObject {
  /**
   * @param {Phaser.Scene} scene
   * @param {PLAYER_CARD_TYPES} type
   */
  constructor(scene, type, x, y) {
    super(scene);

    this.type = type;
    this.scene = scene;

    // TODO: this is just a simple wrapper to get the assets in the game. We need different classes
    // or components for each type of card to handle the specialized logic
    const key = PLAYER_CARD_INFO[type].key;
    this.sprite = scene.add
      .sprite(0, 0, "assets", `cards/${key}`)
      .setOrigin(0.5, 0.5)
      .setInteractive();

    this.outline = scene.add.sprite(0, 0, "assets", `cards/outline`).setOrigin(0.5, 0.5);
    this.outline.setAlpha(0);

    this.setPosition(x, y);

    this.selected = false;
    this.focused = false;

    // TODO: this should only be enabled after the card as tweened into position. It shouldn't start
    // enabled.
    this.enableFocusing();
  }

  getEnergy() {
    return PLAYER_CARD_INFO[this.type].energy;
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  enableFocusing() {
    this.sprite.on("pointerover", this.onPointerOver);
    this.sprite.on("pointerout", this.onPointerOut);
  }

  disableFocusing() {
    this.sprite.off("pointerover", this.onPointerOver);
    this.sprite.off("pointerout", this.onPointerOut);
  }

  enableSelecting() {
    this.sprite.on("pointerdown", this.onPointerDown);
  }

  disableSelecting() {
    this.sprite.off("pointerdown", this.onPointerDown);
  }

  onPointerOver = () => emitter.emit(EVENT_NAMES.PLAYER_CARD_FOCUS, this);

  onPointerOut = () => emitter.emit(EVENT_NAMES.PLAYER_CARD_DEFOCUS, this);

  onPointerDown = () => {
    const { PLAYER_CARD_DESELECT, PLAYER_CARD_SELECT } = EVENT_NAMES;
    const name = this.selected ? PLAYER_CARD_DESELECT : PLAYER_CARD_SELECT;
    emitter.emit(name, this);
  };

  setDepth(depth) {
    this.sprite.setDepth(depth);
    this.outline.setDepth(depth);
  }

  setRotation(radians) {
    this.sprite.setRotation(radians);
    this.outline.setRotation(radians);
  }

  focus() {
    if (this.focused) return;
    this._originalY = this.sprite.y;
    this.focused = true;
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 10,
      scaleY: 1.1,
      scaleX: 1.1,
      duration: 200,
      ease: "Quad.easeOut"
    });
  }

  defocus() {
    if (!this.focused) return;
    this.focused = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({
      targets: this.sprite,
      y: this._originalY,
      scaleY: 1,
      scaleX: 1,
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

  setPosition(x, y) {
    const cx = x + this.sprite.width / 2;
    const cy = y + this.sprite.height / 2;
    this.sprite.x = cx;
    this.sprite.y = cy;
    this.outline.x = this.sprite.x;
    this.outline.y = this.sprite.y;
  }

  update() {
    this.outline.setScale(this.sprite.scaleX, this.sprite.scaleY);
  }

  moveTo() {
    // Animate and move to world pixel positions
  }

  destroy() {
    this.outline.destroy();
    this.sprite.destroy();
  }
}
