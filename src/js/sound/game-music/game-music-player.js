// TODO: split the store and view parts of this code into separate files. GameMusicStore is already
// set up with the store bits.

import { action, observable } from "mobx";

class GameMusicPlayer {
  @observable volume = 1;
  @observable isPlaying = false;

  constructor(game, musicFileKey) {
    this.game = game;
    this.musicFileKey = musicFileKey;
    this.music = null;
  }

  @action
  play() {
    if (!this.music) this.music = this.game.sound.add(this.musicFileKey, { loop: true });
    this.music.play();
    this.isPlaying = true;
  }

  @action
  pause() {
    this.music.pause();
    this.isPlaying = false;
  }

  @action
  setVolume(newVolume) {
    if (newVolume < 0) newVolume = 0;
    if (newVolume > 1) newVolume = 1;
    this.volume = newVolume;
    this.music.setVolume(newVolume);
  }

  destroy() {
    this.music = this.game.sound.destroy();
  }
}

export default GameMusicPlayer;
