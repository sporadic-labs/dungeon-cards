import React, { Component } from "react";
import { observer } from "mobx-react";
import ButtonWithSfx from "./button-with-sfx";
import Menu from "./menu";

@observer
export default class DebugMenu extends Component {
  onToggleMute = () => {
    const { musicStore } = this.props;
    musicStore.setMute(!musicStore.isMuted);
  };

  onToggleMenu = () => {
    const { gameStore } = this.props;
    gameStore.setSkipMenu(!gameStore.skipMenu);
  };

  onSlide = e => this.props.musicStore.setVolume(e.target.value);

  render() {
    const { gameStore, onResume, musicStore, sfxPlayer } = this.props;

    return (
      <div id="debug-menu" className="menu">
        <div className="menu-title">Debug Menu</div>
        <form>
          <label>
            Volume
            <input
              type="range"
              value={musicStore.volume}
              min="0"
              max="1"
              step="0.05"
              onChange={this.onSlide}
            />
          </label>

          <label>
            Mute Background Music:
            <input type="checkbox" checked={musicStore.isMuted} onChange={this.onToggleMute} />
          </label>

          <label>
            Bypass Main Menu:
            <input type="checkbox" checked={gameStore.skipMenu} onChange={this.onToggleMenu} />
          </label>
        </form>

        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onResume}>
          Resume Game
        </ButtonWithSfx>
      </div>
    );
  }
}
