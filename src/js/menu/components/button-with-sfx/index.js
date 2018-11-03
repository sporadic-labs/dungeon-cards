import React, { PureComponent } from "react";
import classNames from "classnames";
import style from "./index.module.scss";

/**
 * Button that plays a SFX on click. Accepts "gray" or "orange" color prop.
 *
 * @export
 * @class ButtonWithSfx
 * @extends {PureComponent}
 */
export default class ButtonWithSfx extends PureComponent {
  onClick = () => {
    const { onClick, sfxPlayer } = this.props;
    sfxPlayer.playButtonClick();
    if (onClick) onClick();
  };

  onMouseDown = event => {
    event.preventDefault(); // Prevent focus outline from triggering on press
  };

  render() {
    const { children, sfxPlayer, color = "gray", className, onClick, ...otherProps } = this.props;

    return (
      <button
        className={classNames(style.button, style[color], className)}
        onClick={this.onClick}
        onMouseDown={this.onMouseDown}
        {...otherProps}
      >
        {children}
      </button>
    );
  }
}
