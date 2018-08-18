import React, { Component } from "react";

import CloseSvg from "../../images/close.svg";

export default class GameOverMenu extends Component {
  render() {
    const { onMainMenu, onRestart } = this.props;

    return (
      <div id="game-over" className="menu">
        <button className="btn-close">
          <CloseSvg />
        </button>
        <div className="menu-title">Game Over</div>
        <button onClick={onRestart}>Restart</button>
        <button onClick={onMainMenu}>Main Menu</button>
      </div>
    );
  }
}
