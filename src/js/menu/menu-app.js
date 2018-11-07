import React, { Component } from "react";
import { observer } from "mobx-react";
import { MENU_STATES } from "./menu-states";
import { emitter, EVENT_NAMES } from "../game-objects/events";
import {
  StartMenu,
  AboutMenu,
  GameOverMenu,
  OptionsMenu,
  PauseMenu,
  DebugMenu
} from "./components";
import MenuTransition from "./components/menu-transition";

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

  resumeGame = () => {
    this.props.gameStore.setPaused(false);
    this.props.gameStore.setMenuState(MENU_STATES.GAME_ON);
  };

  goToStartMenu = () => {
    this.props.gameStore.setGameStarted(false);
    this.props.gameStore.setMenuState(MENU_STATES.START_MENU);
  };

  goToOptionsMenu = () => {
    this.props.gameStore.setMenuState(MENU_STATES.OPTIONS);
  };

  goToAboutMenu = () => {
    this.props.gameStore.setMenuState(MENU_STATES.ABOUT);
  };

  goToPauseMenu = () => {
    this.props.gameStore.setPaused(true);
    this.props.gameStore.setMenuState(MENU_STATES.PAUSE);
  };

  gameOver = () => {
    this.props.gameStore.setPaused(true);
    this.props.gameStore.setMenuState(MENU_STATES.GAME_OVER);
  };

  render() {
    const { gameStore, preferencesStore, musicStore, sfxPlayer } = this.props;

    const commonProps = { gameStore, preferencesStore, musicStore, sfxPlayer };
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
    } else if (
      gameStore.menuState === MENU_STATES.GAME_OVER_WON ||
      gameStore.menuState === MENU_STATES.GAME_OVER_LOST
    ) {
      const gameWon = gameStore.menuState === MENU_STATES.GAME_OVER_WON;
      activeMenu = (
        <GameOverMenu
          {...commonProps}
          onMainMenu={this.goToStartMenu}
          onRestart={this.startGame}
          gameWon={gameWon}
        />
      );
    } else if (gameStore.menuState === MENU_STATES.ABOUT) {
      activeMenu = <AboutMenu {...commonProps} onBack={this.goBackOneState} />;
    } else if (gameStore.menuState === MENU_STATES.OPTIONS) {
      activeMenu = <OptionsMenu {...commonProps} onBack={this.goBackOneState} />;
    } else if (gameStore.menuState === MENU_STATES.PAUSE) {
      activeMenu = (
        <PauseMenu
          {...commonProps}
          onMainMenu={this.goToStartMenu}
          onOptions={this.goToOptionsMenu}
          onResume={this.resumeGame}
        />
      );
    } else if (gameStore.menuState === MENU_STATES.DEBUG) {
      activeMenu = <DebugMenu {...commonProps} onResume={this.resumeGame} />;
    }

    return (
      <div id="hud">
        <MenuTransition gameStore={gameStore}>{activeMenu}</MenuTransition>
      </div>
    );
  }
}

export default Menu;
