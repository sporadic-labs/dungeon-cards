import React, { Component } from "react";
import ButtonWithSfx from "./button-with-sfx";
import Menu from "./menu";

export default class PauseMenu extends Component {
  render() {
    const { onResume, onMainMenu, onOptions, sfxPlayer } = this.props;

    return (
      <Menu id="pause-menu" title="Game Paused">
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onMainMenu}>
          Main Menu
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onOptions}>
          Options
        </ButtonWithSfx>
        <ButtonWithSfx color="green" sfxPlayer={sfxPlayer} onClick={onResume}>
          Resume Game
        </ButtonWithSfx>
      </Menu>
    );
  }
}
