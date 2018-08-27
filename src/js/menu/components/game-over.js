import React, { Component } from "react";

import ButtonWithSfx from "./button-with-sfx";

export default class GameOverMenu extends Component {
  render() {
    const { onMainMenu, onRestart, gameWon, sfxPlayer } = this.props;

    return (
      <div id="game-over" className="menu">
        <div className="menu-title">Game Over</div>
        <div className="menu-title">You {gameWon ? "won!  Nice!" : "lost.  Bummer..."}</div>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onRestart}>
          Restart
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onMainMenu}>
          Main Menu
        </ButtonWithSfx>
      </div>
    );
  }
}
