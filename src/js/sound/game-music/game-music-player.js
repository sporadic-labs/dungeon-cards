import { autorun } from "mobx";

export default class GameMusicPlayer {
  constructor(game, musicStore, musicFileKey) {
    this.game = game;
    this.musicFileKey = musicFileKey;
    this.musicStore = musicStore;
    this.music = null;
    this.musicVolumeScale = 0.1;
  }

  init() {
    this.music = this.game.sound.add(this.musicFileKey, { looping: true });

    const store = this.musicStore;

    this.unsubscribe = autorun(() => {
      const musicVolume = store.volume * this.musicVolumeScale;
      if (store.volume !== musicVolume) this.music.setVolume(musicVolume);

      if (store.isPlaying && !this.music.isPlaying) this.music.play();
      else if (!store.isPlaying && this.music.isPlaying) this.music.stop();

      if (store.isMuted !== this.music.isMuted) this.music.setMute(store.isMuted);
    });

    store.play();
  }

  destroy() {
    if (this.music) this.music.destroy();
    if (this.unsubscribe) this.unsubscribe();
  }
}
