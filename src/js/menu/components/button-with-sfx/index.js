import React, { Component } from "react";
import style from "./index.module.scss";

export default class ButtonWithSfx extends Component {
  onClick = () => {
    const { onClick, sfxPlayer } = this.props;
    sfxPlayer.playButtonClick();
    if (onClick) onClick();
  };

  render() {
    const { children, sfxPlayer, color = "gray", ...otherProps } = this.props;

    return (
      <button className={`${style.button} ${style[color]}`} {...otherProps} onClick={this.onClick}>
        {children}
      </button>
    );
  }
}
