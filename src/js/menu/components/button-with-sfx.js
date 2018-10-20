import React, { Component } from "react";

export default class ButtonWithSfx extends Component {
  onClick = () => {
    const { onClick, sfxPlayer } = this.props;
    sfxPlayer.playButtonClick();
    if (onClick) onClick();
  };

  render() {
    const { children, sfxPlayer, ...otherProps } = this.props;
    return (
      <button className="button button-gray" {...otherProps} onClick={this.onClick}>
        {children}
      </button>
    );
  }
}
