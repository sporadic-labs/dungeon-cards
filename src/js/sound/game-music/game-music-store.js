import { action, observable } from "mobx";
import storageAutosync from "../../store/sync-to-storage";

class GameMusicStore {
  @observable
  volume = 1;
  @observable
  isPlaying = false;
  @observable
  isMuted = false;

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
storageAutosync("tower-of-cards-game-music-store", store);

export default store;
