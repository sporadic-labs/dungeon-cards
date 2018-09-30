import Phaser from "phaser";
import { getFontString } from "../../../font";
import { EventProxy } from "../../events/index";

const descriptionStyle = {
  font: getFontString("Chivo", { size: "12px", weight: 400 }),
  fill: "#3C3E42",
  align: "center",
  wordWrap: { width: 120 }
};

const titleStyle = {
  font: getFontString("Chivo", { size: "13px", weight: 600 }),
  fill: "#3C3E42",
  wordWrap: { width: 120 }
};

/**
 * @export
 * @class Scroll
 */
export default class Scroll {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y, rotation, cardInfo) {
    this.scene = scene;

    const bodyFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-body-",
      end: 11,
      zeroPad: 5
    });
    const rollerFrames = scene.anims.generateFrameNames("assets", {
      prefix: "scroll/scroll-rollers-",
      end: 11,
      zeroPad: 5
    });

    scene.anims.create({ key: "rollers-open", frames: rollerFrames, frameRate: 40 });
    scene.anims.create({ key: "body-open", frames: bodyFrames, frameRate: 40 });

    this.scrollBody = scene.add.sprite(0, 0, "assets", bodyFrames[0].frame);
    this.scrollRollers = scene.add.sprite(0, 0, "assets", rollerFrames[0].frame);

    const cx = x + this.scrollRollers.width / 2;
    const cy = y + this.scrollRollers.height / 2;
    this.scrollRollers.setPosition(cx, cy).setRotation(rotation);
    this.scrollBody.setPosition(cx, cy).setRotation(rotation);

    this.cx = cx;
    this.cy = cy;
    this.spacing = 8;

    // Create the elements that go in the scroll without positioning
    const { key, title, description, cost, energy } = cardInfo;
    this.image = scene.add.image(0, 0, "assets", `${key}-scroll`).setOrigin(0.5, 0);
    this.titleText = scene.add.text(0, 0, title, titleStyle).setOrigin(0.5, 0);
    this.descriptionText = scene.add.text(0, 0, description, descriptionStyle).setOrigin(0.5, 0);
    const costString = cost !== null ? `Cost to play: ${cost}` : "";
    this.costText = scene.add.text(0, 0, costString, descriptionStyle).setOrigin(0.5, 0);
    const energyString = energy !== null ? `Reclaim energy: ${energy}` : "";
    this.energyText = scene.add.text(0, 0, energyString, descriptionStyle).setOrigin(0.5, 0);
    this.container = scene.add.container(0, 0, [
      this.image,
      this.titleText,
      this.descriptionText,
      this.costText,
      this.energyText
    ]);
    this.container.setRotation(rotation);

    // Position everything and then center the container
    this.titleText.setPosition(0, 0);
    this.image.setPosition(0, this.titleText.getBottomLeft().y + this.spacing);
    this.descriptionText.setPosition(0, this.image.getBottomLeft().y + this.spacing);
    this.costText.setPosition(0, this.descriptionText.getBottomLeft().y + this.spacing);
    this.energyText.setPosition(0, this.costText.getBottomLeft().y + this.spacing / 8);
    this.container.setPosition(this.cx, this.cy - this.container.getBounds().height / 2);

    // Mask synced to the scroll body animation
    const mask = new Phaser.Display.Masks.BitmapMask(scene, this.scrollBody);
    this.container.setMask(mask);

    this.scrollBody.anims.play("body-open");
    this.scrollRollers.anims.play("rollers-open");

    this.eventProxy = new EventProxy();
    this.eventProxy.once(scene.events, "shutdown", this.destroy, this);
    this.eventProxy.once(scene.events, "destroy", this.destroy, this);
  }

  destroy() {
    this.eventProxy.removeAll();
    this.container.destroy();
    this.scrollBody.destroy();
    this.scrollRollers.destroy();
  }
}
