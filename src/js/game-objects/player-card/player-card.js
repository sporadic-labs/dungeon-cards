import { PLAYER_CARD_INFO } from "./player-card-info";
import { EVENTS } from "../events";

export default class PlayerCard {
  /**
   * @param {Phaser.Scene} scene
   * @param {PLAYER_CARD_TYPES} type
   */
  constructor(scene, type, x, y) {
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
    this.sprite.on("pointerdown", () => (this.selected ? this.deselect() : this.select()));
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  select() {
    this.selected = true;
    this.scene.tweens.killTweensOf(this.outline);
    this.scene.tweens.add({
      targets: [this.sprite, this.outline],
      scaleY: 1.1,
      scaleX: 1.1,
      duration: 200,
      ease: "Quad.easeOut"
    });
    this.scene.tweens.add({
      targets: this.outline,
      alpha: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
    this.scene.events.emit(EVENTS.SELECT_PLAYER_CARD, this);
  }

  deselect() {
    this.selected = false;
    this.scene.tweens.killTweensOf(this.outline);
    this.scene.tweens.add({
      targets: [this.sprite, this.outline],
      scaleY: 1,
      scaleX: 1,
      duration: 200,
      ease: "Quad.easeOut"
    });
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

  moveTo() {
    // Animate and move to world pixel positions
  }

  destroy() {
    this.outline.destroy();
    this.sprite.destroy();
  }
}
