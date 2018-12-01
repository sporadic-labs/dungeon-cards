export default class PlayerAttackAnimation {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Function} cb
   */
  constructor(scene, x, y) {
    this.scene = scene;

    this.sfxPlayer = this.scene.game.globals.sfxPlayer;
    this.sfxPlayer.add("sword-clash", 2, 0.3, false);

    this.sprite = scene.add.sprite(0, 0, "assets", "attacks/player-slash");
    this.sprite.setRotation((-Math.PI / 180) * 20);
    this.sprite.setVisible(false);

    this.setPosition(x, y);
  }

  fadeout(delay) {
    setTimeout(() => {
      this.sprite.setVisible(true);
      this.sfxPlayer.play("sword-clash");
    }, delay);
    return new Promise((resolve, reject) => {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        duration: 800,
        delay: delay,
        ease: "Quad.easeOut",
        onComplete: resolve,
        callbackScope: this
      });
    });
  }

  setPosition(x, y) {
    const cx = x + this.sprite.width / 2;
    this.sprite.x = cx;
    this.sprite.y = y;
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.text);
    this.sprite.destroy();
  }
}
