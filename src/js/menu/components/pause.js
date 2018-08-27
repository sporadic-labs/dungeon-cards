import React, { Component } from "react";
import ButtonWithSfx from "./button-with-sfx";

export default class PauseMenu extends Component {
  render() {
    const { onResume, onMainMenu, onOptions, sfxPlayer } = this.props;

    return (
      <div id="pause-menu" className="menu">
        <div className="menu-title">Game Paused</div>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onMainMenu}>
          Main Menu
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onOptions}>
          Options
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onResume}>
          Resume Game
        </ButtonWithSfx>
      </div>
    );
  }
}
