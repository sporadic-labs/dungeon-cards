import React, { Component } from "react";
import ButtonWithSfx from "./button-with-sfx";
import Menu from "./menu";

export default class StartMenu extends Component {
  render() {
    const { onAbout, onStart, onOptions, sfxPlayer } = this.props;

    return (
      <Menu title="Tower of Cards">
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onStart}>
          Start Game
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onOptions}>
          Options
        </ButtonWithSfx>
        <div id="about" onClick={onAbout}>
          i
        </div>
      </Menu>
    );
  }
}
