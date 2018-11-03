import React, { Component } from "react";
import ButtonWithSfx from "./button-with-sfx";
import Menu from "./menu";

export default class GameOverMenu extends Component {
  render() {
    const { onMainMenu, onRestart, gameWon, sfxPlayer } = this.props;

    return (
      <Menu id="game-over" title="Game Over">
        <div className="menu-title">You {gameWon ? "won!  Nice!" : "lost.  Bummer..."}</div>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onRestart}>
          Restart
        </ButtonWithSfx>
        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onMainMenu}>
          Main Menu
        </ButtonWithSfx>
      </Menu>
    );
  }
}
