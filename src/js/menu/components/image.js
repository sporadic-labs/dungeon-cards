import React, { PureComponent } from "react";

/**
 * Image, except with no dragging to prevent ghosting
 *
 * @export
 * @class Image
 * @extends {PureComponent}
 */
export default class Image extends PureComponent {
  render() {
    return <img draggable={false} {...this.props} />;
  }
}
