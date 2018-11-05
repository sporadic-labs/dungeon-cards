import React, { PureComponent } from "react";
import classNames from "classnames";
import style from "./index.module.scss";

/**
 * Simple styled input[type="checkbox"]. Hides the real <input /> and uses the <label /> to trigger
 * checking/unchecking.
 *
 * @export
 * @class Slider
 * @extends {PureComponent}
 */
export default class Checkbox extends PureComponent {
  render() {
    const { className, checked, ...otherProps } = this.props;
    return (
      <label className={classNames(style.checkboxContainer, checked && style.checked)}>
        <input
          type="checkbox"
          checked={checked}
          className={classNames(style.checkbox, className)}
          {...otherProps}
        />
      </label>
    );
  }
}
