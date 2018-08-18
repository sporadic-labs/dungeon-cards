import React, { Component } from "react";

export default class StartMenu extends Component {
  render() {
    const { onAbout, onStart } = this.props;

    return (
      <div id="start-menu" className="menu">
        <div className="menu-title">Tower of Cards</div>
        <button onClick={onStart}>Start Game</button>
        <div id="about" onClick={onAbout}>
          i
        </div>
      </div>
    );
  }
}
