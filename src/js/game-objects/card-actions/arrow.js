/**
 */
export default class Arrow {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, startPoint, endPoint, { fillStyle = 0xff0000, thickness = 10 } = {}) {
    this.scene = scene;
    this.graphics = scene.add.graphics();

    this.fillStyle = fillStyle;
    this.thickness = thickness;
    this.startPoint = { x: startPoint.x, y: startPoint.y };
    this.endPoint = { x: endPoint.x, y: endPoint.y };

    this.setHighlighted(false, false);
    this.redraw();
  }

  setStartPoint({ x, y }, redraw = true) {
    this.startPoint.x = x;
    this.startPoint.y = y;
    if (redraw) this.redraw();
  }

  setEndPoint({ x, y }, redraw = true) {
    this.endPoint.x = x;
    this.endPoint.y = y;
    if (redraw) this.redraw();
  }

  setHighlighted(shouldBeHighlighted, animate = true) {
    if (this.isHighlighted !== shouldBeHighlighted) {
      this.isHighlighted = shouldBeHighlighted;
      const newAlpha = shouldBeHighlighted ? 0.9 : 0.25;
      if (animate) {
        this.scene.tweens.killTweensOf(this.graphics);
        this.scene.tweens.add({
          targets: this.graphics,
          alpha: newAlpha,
          duration: 200,
          ease: "Quad.easeOut"
        });
      } else {
        this.graphics.setAlpha(newAlpha);
      }
    }
  }

  setVisible(shouldBeVisible) {
    this.graphics.setVisible(shouldBeVisible);
  }

  redraw() {
    const { x: x1, y: y1 } = this.startPoint;
    const { x: x2, y: y2 } = this.endPoint;
    const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
    const normalAngle = angle - Math.PI / 2;
    const normalX = Math.cos(normalAngle);
    const normalY = Math.sin(normalAngle);
    const lineOffsetX = (this.thickness / 2) * normalX;
    const lineOffsetY = (this.thickness / 2) * normalY;
    const arrowheadLength = 2.5 * this.thickness;
    const arrowheadWidth = 2.3 * this.thickness;
    const headStartX = this.endPoint.x - arrowheadLength * Math.cos(angle);
    const headStartY = this.endPoint.y - arrowheadLength * Math.sin(angle);
    const headOffsetX = (arrowheadWidth / 2) * Math.cos(normalAngle);
    const headOffsetY = (arrowheadWidth / 2) * Math.sin(normalAngle);

    const linePoints = [];
    linePoints.push({ x: this.startPoint.x - lineOffsetX, y: this.startPoint.y - lineOffsetY });
    linePoints.push({ x: this.startPoint.x + lineOffsetX, y: this.startPoint.y + lineOffsetY });
    linePoints.push({ x: headStartX + lineOffsetX, y: headStartY + lineOffsetY });
    linePoints.push({ x: headStartX - lineOffsetX, y: headStartY - lineOffsetY });

    const arrowheadPoints = [];
    arrowheadPoints.push({ x: headStartX - headOffsetX, y: headStartY - headOffsetY });
    arrowheadPoints.push({ x: headStartX + headOffsetX, y: headStartY + headOffsetY });
    arrowheadPoints.push({ x: this.endPoint.x, y: this.endPoint.y });

    this.graphics.clear();
    this.graphics.fillStyle(this.fillStyle);
    this.graphics.fillPoints(linePoints, true);
    this.graphics.fillPoints(arrowheadPoints, true);
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.graphics);
    this.graphics.destroy();
  }
}
