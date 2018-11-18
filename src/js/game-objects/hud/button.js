import { EventProxy } from "../events";

const noop = () => {};

const BUTTON_STATE = {
  NORMAL: "NORMAL",
  HOVER: "HOVER",
  PRESSED: "PRESSED"
};

const defaultFrameMapping = {
  normal: "normal",
  hover: "hover",
  pressed: "pressed"
};

const defaultOrigin = { x: 0.5, y: 0.5 };

/**
 * A button is a sprite with three textures: one for "normal" resting state, on for "hover" state
 * and one for "pressed" state. This automatically updates the texture to match and allows tracking
 * of button presses via an onDown callback.
 * @export
 * @class Button
 */
export default class Button {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(
    scene,
    x,
    y,
    {
      framePrefix = "",
      frameMapping = defaultFrameMapping,
      onDown = noop,
      origin = defaultOrigin
    } = {}
  ) {
    this.scene = scene;
    this.onDown = onDown;
    this.isHovered = false;
    this.isPressed = false;
    this.sfxPlayer = this.scene.game.globals.sfxPlayer;

    this.frameNames = {
      [BUTTON_STATE.NORMAL]: `${framePrefix}${frameMapping.normal}`,
      [BUTTON_STATE.HOVER]: `${framePrefix}${frameMapping.hover}`,
      [BUTTON_STATE.PRESSED]: `${framePrefix}${frameMapping.pressed}`
    };

    this.sprite = scene.add
      .sprite(x, y, "assets", this.frameNames[BUTTON_STATE.NORMAL])
      .setOrigin(origin.x, origin.y)
      .setInteractive();

    this.updateFrame();
    this.enableInteractivity();

    this.proxy = new EventProxy();
    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  setIsHovered(isHovered) {
    this.isHovered = isHovered;
    this.updateFrame();
  }

  setIsPressed(isPressed) {
    this.isPressed = isPressed;
    this.updateFrame();
  }

  hitTest() {
    // Ugh, this feels a bit leaky & expensive as an abstraction, but it's all I can find in Phaser
    return (
      this.scene.game.input.hitTest(
        this.scene.input.activePointer,
        [this.sprite],
        this.scene.cameras.main
      ).length === 1
    );
  }

  enableInteractivity() {
    this.isHovered = this.hitTest();
    this.isPressed = false;
    this.updateFrame();
    this.sprite.on("pointerdown", this.onPointerDown, this);
    this.sprite.on("pointerup", this.onPointerUp, this);
    this.sprite.on("pointerover", this.onPointerOver, this);
    this.sprite.on("pointerout", this.onPointerOut, this);
  }

  disableInteractivity() {
    this.reset();
    this.sprite.off("pointerdown", this.onPointerDown, this);
    this.sprite.off("pointerup", this.onPointerUp, this);
    this.sprite.off("pointerover", this.onPointerOver, this);
    this.sprite.off("pointerout", this.onPointerOut, this);
  }

  /**
   * Reset the internal state of the button to not hovered and not pressed. This is useful in edge
   * cases, e.g. when the game is paused immediately when a button is pressed.
   * @memberof Button
   */
  reset() {
    this.isHovered = false;
    this.isPressed = false;
    this.updateFrame();
  }

  updateFrame() {
    // Pressed takes precedence over hovered
    let frame;
    if (this.isPressed) frame = this.frameNames[BUTTON_STATE.PRESSED];
    else if (this.isHovered) frame = this.frameNames[BUTTON_STATE.HOVER];
    else frame = this.frameNames[BUTTON_STATE.NORMAL];
    this.sprite.setTexture("assets", frame);
  }

  onPointerOver() {
    this.isHovered = true;
    this.updateFrame();
  }

  onPointerOut() {
    this.isHovered = false;
    this.updateFrame();
  }

  onPointerUp() {
    this.isPressed = false;
    this.updateFrame();
  }

  onPointerDown() {
    this.sfxPlayer.playButtonClick();
    this.isPressed = true;
    this.updateFrame();
    this.onDown();
  }

  destroy() {
    this.sprite.destroy();
    this.proxy.removeAll();
  }
}
