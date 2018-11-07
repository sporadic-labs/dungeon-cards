import React, { Component } from "react";
import ButtonWithSfx from "../button-with-sfx";
import Menu from "../menu";
import style from "./index.module.scss";

export default class StartMenu extends Component {
  render() {
    const { onAbout, onStart, onOptions, sfxPlayer } = this.props;

    return (
      <Menu title="Tower of Cards">
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onOptions}>
          Options
        </ButtonWithSfx>
        <ButtonWithSfx color="green" sfxPlayer={sfxPlayer} onClick={onStart}>
          Start Game
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onAbout} className={style.about}>
          i
        </ButtonWithSfx>
      </Menu>
    );
  }
}
