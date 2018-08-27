import React, { Component } from "react";
import ButtonWithSfx from "./button-with-sfx";

export default class PauseButton extends Component {
  render() {
    const { isPaused, onPause, sfxPlayer } = this.props;

    return (
      <ButtonWithSfx id="pause-controls" sfxPlayer={sfxPlayer} onClick={isPaused ? null : onPause}>
        {<i className="fa fa-pause" />}
      </ButtonWithSfx>
    );
  }
}
