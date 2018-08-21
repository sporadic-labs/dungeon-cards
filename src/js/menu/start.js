import React, { Component } from "react";
import ButtonWithSfx from "./button-with-sfx";

export default class StartMenu extends Component {
  render() {
    const { onAbout, onStart, onOptions, sfxPlayer } = this.props;

    return (
      <div id="start-menu" className="menu">
        <div className="menu-title">Tower of Cards</div>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onStart}>
          Start Game
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onOptions}>
          Options
        </ButtonWithSfx>
        <div id="about" onClick={onAbout}>
          i
        </div>
      </div>
    );
  }
}
