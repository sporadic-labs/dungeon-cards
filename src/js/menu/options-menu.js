import React, { Component } from "react";
import { observer } from "mobx-react";

@observer
export default class OptionsMenu extends Component {
  onToggle = () => {
    const { musicStore } = this.props;
    if (musicStore.isPlaying) musicStore.pause();
    else musicStore.play();
  };

  onSlide = e => {
    console.log(e.target.value);
    this.props.musicStore.setVolume(e.target.value);
  };

  render() {
    const { onBack, musicStore } = this.props;

    return (
      <div id="options" className="menu">
        <div className="menu-title">Options</div>

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
            <input type="checkbox" checked={!musicStore.isPlaying} onChange={this.onToggle} />
          </label>
        </form>

        <button onClick={onBack}>Back</button>
      </div>
    );
  }
}
