export default class MovementContoller {
  constructor(parent, physicsBody, scene) {
    this.parent = parent;
    this.physicsBody = physicsBody;
    this.scene = scene;
    this.physics = scene.physics;

    this.physicsBody.setDrag(500).setAngularDrag(500);

    const { LEFT, RIGHT, UP } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      left: scene.input.keyboard.addKey(LEFT),
      right: scene.input.keyboard.addKey(RIGHT),
      up: scene.input.keyboard.addKey(UP)
    };

    // Register destroy via pub/sub
  }

  update(time, delta) {
    const body = this.physicsBody;
    const heading = (body.rotation + 90) * Math.PI / 180;

    if (this.keys.left.isDown) body.setAngularVelocity(-200);
    else if (this.keys.right.isDown) body.setAngularVelocity(200);

    if (this.keys.up.isDown) body.acceleration.setToPolar(heading, 200);
    else body.setAcceleration(0);
  }

  destroy() {
    // noop
  }
}
