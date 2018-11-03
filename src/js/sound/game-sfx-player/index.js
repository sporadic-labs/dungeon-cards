import { Sound } from "phaser";
const { WebAudioSoundManager } = Sound;

import { preferencesStore } from "../../store";

export default class GameSfxPlayer extends WebAudioSoundManager {
  constructor(game) {
    super(game);
    this.game = game;
    this.loadedSounds = {};
    this.defaultVolume = 1.0;
  }

  /**
   *
   * @param {*} key
   * @param {*} maxSimultaneous
   * @param {*} volume
   * @param {*} loop
   */
  add(key, maxSimultaneous = 2, volume = 1.0, loop = false) {
    if (!this.loadedSounds[key]) {
      const addedSound = super.add(key, { volume, loop });
      this.loadedSounds[key] = {
        key,
        maxSimultaneous,
        currentlyPlaying: 0,
        phaserSound: addedSound
      };
    }
    return this.loadedSounds[key].phaserSound;
  }

  /**
   *
   * @param {*} key
   * @param {*} playArguments
   */
  play(key, playArguments) {
    console.log(`play ${key}`);
    if (preferencesStore.noAudio) return;
    if (!this.loadedSounds[key]) {
      this.add(key);
    }
    const sound = this.loadedSounds[key];
    let didPlay = false;
    if (sound.currentlyPlaying < sound.maxSimultaneous) {
      sound.currentlyPlaying++;
      sound.phaserSound.once("ended", _ => sound.currentlyPlaying--);
      didPlay = sound.phaserSound.play(playArguments);
    }
    return didPlay;
  }

  /**
   *
   */
  playButtonClick() {
    console.log("play button click");
    if (preferencesStore.noAudio) return;
    this.play("click1", { volume: this.defaultVolume });
  }

  /**
   *
   */
  destroy() {
    for (const sound of this.loadedSounds) {
      this.game.sound.remove(sound.key);
    }
  }
}
