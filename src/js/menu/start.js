import React, { Component } from "react";

export default class StartMenu extends Component {
  render() {
    const { onAbout, onStart, onOptions } = this.props;

    return (
      <div id="start-menu" className="menu">
        <div className="menu-title">Tower of Cards</div>
        <button onClick={onStart}>Start Game</button>
        <button onClick={onOptions}>Options</button>
        <div id="about" onClick={onAbout}>
          i
        </div>
      </div>
    );
  }
}
