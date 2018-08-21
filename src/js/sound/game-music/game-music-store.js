import { action, observable } from "mobx";

class GameMusicStore {
  @observable volume = 0.5;
  @observable isPlaying = false;
  @observable isMuted = false;

  @action
  play() {
    this.isPlaying = true;
  }

  @action
  pause() {
    this.isPlaying = false;
  }

  @action
  setMute(isMuted) {
    this.isMuted = isMuted;
  }

  @action
  setVolume(newVolume) {
    if (newVolume < 0) newVolume = 0;
    if (newVolume > 1) newVolume = 1;
    this.volume = newVolume;
  }
}

const store = new GameMusicStore();

export default store;
