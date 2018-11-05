import React, { PureComponent } from "react";
import classNames from "classnames";
import style from "./index.module.scss";

/**
 * Simple styled input[type="range"] slider.
 *
 * @export
 * @class Slider
 * @extends {PureComponent}
 */
export default class Slider extends PureComponent {
  render() {
    const { className, ...otherProps } = this.props;

    return <input className={classNames(style.slider, className)} type="range" />;
  }
}
