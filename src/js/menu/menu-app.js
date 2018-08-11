import React, { Component } from "react";
import { observer } from "mobx-react";
import { MENU_STATES } from "./menu-states";
import StartMenu from "./components/start-menu";
import AboutMenu from "./components/about-menu";
import GameOverMenu from "./components/game-over-menu";

@observer
class Menu extends Component {
  goBackOneState = () => {
    this.props.gameStore.goBackOneMenuState();
  };

  startGame = () => {
    this.props.gameStore.setMenuState(MENU_STATES.GAME_ON);
  };

  goToStartMenu = () => {
    this.props.gameStore.setMenuState(MENU_STATES.START_MENU);
  };

  goToAboutMenu = () => {
    this.props.gameStore.setMenuState(MENU_STATES.ABOUT);
  };

  gameOver = () => {
    this.props.gameStore.setMenuState(MENU_STATES.GAME_OVER);
  };

  render() {
    const { gameStore, width, height } = this.props;

    let activeMenu;
    if (gameStore.menuState === MENU_STATES.START_MENU) {
      activeMenu = (
        <StartMenu
          gameStore={gameStore}
          onOptions={this.goToOptionsMenu}
          onStart={this.startGame}
          onAbout={this.goToAboutMenu}
          goToInstructionsMenu={this.goToInstructionsMenu}
        />
      );
    } else if (gameStore.menuState === MENU_STATES.GAME_OVER) {
      activeMenu = (
        <GameOverMenu
          gameStore={gameStore}
          onMainMenu={this.goToStartMenu}
          onRestart={this.restartGame}
        />
      );
    } else if (gameStore.menuState === MENU_STATES.ABOUT) {
      activeMenu = <AboutMenu gameStore={gameStore} onBack={this.goBackOneState} />;
    }

    return (
      <div id="hud" style={{ width: `${width}px`, height: `${height}px` }}>
        {activeMenu}
      </div>
    );
  }
}

export default Menu;
