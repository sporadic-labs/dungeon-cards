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
    this.yOffset = 0;
    this.rotation = 0;
    this.scale = 1;

    this.cardShadow = scene.add.sprite(0, 0, "assets", "cards/card-shadow");
    this.card = scene.add.sprite(0, 0, "assets", "cards/card");

    // TODO: this is just a simple wrapper to get the assets in the game. We need different classes
    // or components for each type of card to handle the specialized logic
    const key = PLAYER_CARD_INFO[type].key;
    this.cardContents = scene.add
      .sprite(0, 0, "assets", key)
      .setOrigin(0.5, 0.5)
      .setInteractive();

    this.outline = scene.add.sprite(0, 0, "assets", `cards/card-outline`).setOrigin(0.5, 0.5);
    this.outline.setAlpha(0);

    this.group = scene.add.group();
    this.group.add(this.outline);
    this.group.add(this.card);
    this.group.add(this.cardContents);
    this.group.add(this.cardShadow);

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
    return { x: this.x, y: this.y };
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

  onPointerOver = () => emitter.emit(EVENT_NAMES.PLAYER_CARD_FOCUS, this);

  onPointerOut = () => emitter.emit(EVENT_NAMES.PLAYER_CARD_DEFOCUS, this);

  onPointerDown = () => {
    const { PLAYER_CARD_DESELECT, PLAYER_CARD_SELECT } = EVENT_NAMES;
    const name = this.selected ? PLAYER_CARD_DESELECT : PLAYER_CARD_SELECT;
    emitter.emit(name, this);
  };

  setDepth(depth) {
    Phaser.Actions.SetDepth(this.group.getChildren(), depth);
  }

  setRotation(radians) {
    this.rotation = radians;
  }

  focus() {
    if (this.focused) return;
    this.focused = true;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scale: 1,
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
      scale: 1,
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

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    const cx = this.x + this.card.width / 2;
    const cy = this.y + this.card.height / 2;
    Phaser.Actions.SetXY(this.group.getChildren(), cx, cy + this.yOffset);
    Phaser.Actions.SetRotation(this.group.getChildren(), this.rotation);
    Phaser.Actions.SetScale(this.group.getChildren(), this.scale);
  }

  moveTo() {
    // Animate and move to world pixel positions
  }

  destroy() {
    this.group.destroy(true);
    this.scene.lifecycle.remove(this);
  }
}
