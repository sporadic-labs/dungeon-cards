import React, { Component } from "react";
import { observer } from "mobx-react";
import ButtonWithSfx from "./button-with-sfx";
import Menu from "./menu";

@observer
export default class DebugMenu extends Component {
  onToggleAudio = () => {
    const { preferencesStore } = this.props;
    preferencesStore.setAudio(!preferencesStore.noAudio);
  };

  onToggleMenu = () => {
    const { preferencesStore } = this.props;
    preferencesStore.setSkipMenu(!preferencesStore.skipMenu);
  };

  onSlide = e => this.props.musicStore.setVolume(e.target.value);

  render() {
    const { preferencesStore, onResume, sfxPlayer } = this.props;

    return (
      <Menu id="debug-menu" title="Debug Menu">
        <form>
          <label>
            Mute All Sound:
            <input
              type="checkbox"
              checked={preferencesStore.noAudio}
              onChange={this.onToggleAudio}
            />
          </label>

          <label>
            Bypass Main Menu:
            <input
              type="checkbox"
              checked={preferencesStore.skipMenu}
              onChange={this.onToggleMenu}
            />
          </label>
        </form>

        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onResume}>
          Resume Game
        </ButtonWithSfx>
      </Menu>
    );
  }
}
