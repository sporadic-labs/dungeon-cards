import React, { Component } from "react";
import { observer } from "mobx-react";
import { MENU_STATES } from "./menu-states";
import StartMenu from "./start";
import AboutMenu from "./about";
import GameOverMenu from "./game-over";
import { emitter, EVENT_NAMES } from "../game-objects/events";
import OptionsMenu from "./options-menu";

@observer
class Menu extends Component {
  goBackOneState = () => {
    this.props.gameStore.goBackOneMenuState();
  };

  startGame = () => {
    this.props.gameStore.setMenuState(MENU_STATES.GAME_ON);
    this.props.gameStore.setGameStarted(true);
    emitter.emit(EVENT_NAMES.GAME_START);
  };

  goToStartMenu = () => {
    this.props.gameStore.setMenuState(MENU_STATES.START_MENU);
  };

  goToOptionsMenu = () => {
    this.props.gameStore.setMenuState(MENU_STATES.OPTIONS);
  };

  goToAboutMenu = () => {
    this.props.gameStore.setMenuState(MENU_STATES.ABOUT);
  };

  gameOver = () => {
    this.props.gameStore.setMenuState(MENU_STATES.GAME_OVER);
  };

  render() {
    const { gameStore, width, height, musicStore, sfxPlayer } = this.props;

    const commonProps = { gameStore, musicStore, sfxPlayer };
    let activeMenu;
    if (gameStore.menuState === MENU_STATES.START_MENU) {
      activeMenu = (
        <StartMenu
          {...commonProps}
          onStart={this.startGame}
          onAbout={this.goToAboutMenu}
          onOptions={this.goToOptionsMenu}
        />
      );
    } else if (gameStore.menuState === MENU_STATES.GAME_OVER) {
      activeMenu = (
        <GameOverMenu {...commonProps} onMainMenu={this.goToStartMenu} onRestart={this.startGame} />
      );
    } else if (gameStore.menuState === MENU_STATES.ABOUT) {
      activeMenu = <AboutMenu {...commonProps} onBack={this.goBackOneState} />;
    } else if (gameStore.menuState === MENU_STATES.OPTIONS) {
      activeMenu = (
        <OptionsMenu {...commonProps} musicStore={musicStore} onBack={this.goBackOneState} />
      );
    }

    return (
      <div id="hud" style={{ width: `${width}px`, height: `${height}px` }}>
        {activeMenu}
      </div>
    );
  }
}

export default Menu;
