import { autorun } from "mobx";

class GameMusicPlayer {
  constructor(game, musicStore, musicFileKey) {
    this.game = game;
    this.musicFileKey = musicFileKey;
    this.musicStore = musicStore;
    this.music = null;
  }

  init() {
    this.music = this.game.sound.add(this.musicFileKey, { looping: true });

    const store = this.musicStore;

    this.unsubscribe = autorun(() => {
      if (store.volume !== this.music.volume) this.music.setVolume(store.volume);

      if (store.isPlaying && !this.music.isPlaying) this.music.play();
      else if (!store.isPlaying && this.music.isPlaying) this.music.stop();

      if (store.isMuted !== this.music.isMuted) this.music.setMute(store.isMuted);
    });

    store.volume = 0.1;
    store.play();
  }

  destroy() {
    if (this.music) this.music.destroy();
    if (this.unsubscribe) this.unsubscribe();
  }
}

export default GameMusicPlayer;
