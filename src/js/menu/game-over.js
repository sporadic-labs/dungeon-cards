import React, { Component } from "react";

import CloseSvg from "../../images/close.svg";

export default class GameOverMenu extends Component {
  render() {
    return (
      <div id="game-over" class="menu">
        <button class="btn-close">
          <CloseSvg />
        </button>
        <div class="menu-title">Game Over</div>
        <button>Restart</button>
        <button>Main Menu</button>
      </div>
    );
  }
}
