import { action, observable } from "mobx";

class GameMusicStore {
  @observable volume = 1;
  @observable isPlaying = false;

  @action
  play() {
    this.isPlaying = true;
  }

  @action
  pause() {
    this.isPlaying = false;
  }

  @action
  setVolume(newVolume) {
    if (newVolume < 0) newVolume = 0;
    if (newVolume > 1) newVolume = 1;
    this.volume = newVolume;
    this.music.setVolume(newVolume);
  }
}

export default GameMusicStore;
