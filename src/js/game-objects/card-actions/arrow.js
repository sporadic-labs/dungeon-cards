/**
 */
export default class Arrow {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, startPoint, endPoint, { fillStyle = 0xff0000, thickness = 15 } = {}) {
    this.scene = scene;
    this.scene.lifecycle.add(this);

    this.graphics = scene.add.graphics();

    this.fillStyle = fillStyle;
    this.thickness = thickness;
    this.dashLength = 25;
    this.gapLength = 25;
    this.startPoint = { x: startPoint.x, y: startPoint.y };
    this.endPoint = { x: endPoint.x, y: endPoint.y };

    this.setHighlighted(false, false);
    this.redraw();
  }

  setColor(color, redraw = true) {
    this.fillStyle = color;
    if (redraw) this.redraw();
    return this;
  }

  setStartPoint({ x, y }, redraw = true) {
    this.startPoint.x = x;
    this.startPoint.y = y;
    if (redraw) this.redraw();
    return this;
  }

  setEndPoint({ x, y }, redraw = true) {
    this.endPoint.x = x;
    this.endPoint.y = y;
    if (redraw) this.redraw();
    return this;
  }

  setHighlighted(shouldBeHighlighted, animate = true) {
    if (this.isHighlighted !== shouldBeHighlighted) {
      this.isHighlighted = shouldBeHighlighted;
      const newAlpha = shouldBeHighlighted ? 0.9 : 0.35;
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
    return this;
  }

  setVisible(shouldBeVisible) {
    this.graphics.setVisible(shouldBeVisible);
    return this;
  }

  setDepth(depth) {
    this.graphics.setDepth(depth);
    return this;
  }

  redraw() {
    const { dashLength, gapLength, thickness, endPoint, startPoint, fillStyle } = this;
    const arrowheadLength = 2.4 * thickness;
    const arrowheadWidth = 2.3 * thickness;
    const { x: x1, y: y1 } = startPoint;
    const { x: x2, y: y2 } = endPoint;
    const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
    const normalAngle = angle - Math.PI / 2;
    const normalX = Math.cos(normalAngle);
    const normalY = Math.sin(normalAngle);
    const lineOffsetX = (thickness / 2) * normalX;
    const lineOffsetY = (thickness / 2) * normalY;
    const headStartX = endPoint.x - arrowheadLength * Math.cos(angle);
    const headStartY = endPoint.y - arrowheadLength * Math.sin(angle);
    const headOffsetX = (arrowheadWidth / 2) * Math.cos(normalAngle);
    const headOffsetY = (arrowheadWidth / 2) * Math.sin(normalAngle);

    this.graphics.clear();
    this.graphics.fillStyle(fillStyle);

    const line = new Phaser.Geom.Line(x1, y1, headStartX, headStartY);
    const segmentLength = dashLength + gapLength;
    const dashedLineLength = Phaser.Geom.Line.Length(line);
    const offset = (this.scene.time.now / 20) % segmentLength;
    for (let l = offset; l < dashedLineLength; l += segmentLength) {
      const linePoints = [];
      const startLengthFraction = l / dashedLineLength;
      const endLengthFraction = Math.min((l + dashLength) / dashedLineLength, 1);
      const p1 = line.getPoint(startLengthFraction);
      const p2 = line.getPoint(endLengthFraction);
      linePoints.push({ x: p1.x - lineOffsetX, y: p1.y - lineOffsetY });
      linePoints.push({ x: p1.x + lineOffsetX, y: p1.y + lineOffsetY });
      linePoints.push({ x: p2.x + lineOffsetX, y: p2.y + lineOffsetY });
      linePoints.push({ x: p2.x - lineOffsetX, y: p2.y - lineOffsetY });
      this.graphics.fillPoints(linePoints, true);
    }

    const arrowheadPoints = [];
    arrowheadPoints.push({ x: headStartX - headOffsetX, y: headStartY - headOffsetY });
    arrowheadPoints.push({ x: headStartX + headOffsetX, y: headStartY + headOffsetY });
    arrowheadPoints.push({ x: endPoint.x, y: endPoint.y });
    this.graphics.fillPoints(arrowheadPoints, true);

    return this;
  }

  update() {
    this.redraw();
  }

  destroy() {
    this.scene.lifecycle.remove(this);
    this.scene.tweens.killTweensOf(this.graphics);
    this.graphics.destroy();
  }
}
