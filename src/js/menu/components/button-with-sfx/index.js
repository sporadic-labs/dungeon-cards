import React, { PureComponent } from "react";
import classNames from "classnames";
import style from "./index.module.scss";

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
    const { children, sfxPlayer, color = "gray", className, ...otherProps } = this.props;

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
