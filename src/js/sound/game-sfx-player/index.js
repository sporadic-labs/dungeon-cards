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
  add(key, maxSimultaneous = 1, volume = this.defaultVolume, loop = false) {
    const addedSound = super.add(key, { volume, loop });
    if (!this.loadedSounds[key]) {
      this.loadedSounds[key] = {
        key,
        maxSimultaneous,
        currentlyPlaying: 0
      };
    }
    addedSound.once("ended", _ => this.loadedSounds[key].currentlyPlaying--);
    return addedSound;
  }

  /**
   *
   * @param {*} key
   * @param {*} playArguments
   */
  play(key, playArguments) {
    if (preferencesStore.noAudio) return;
    1;
    const sound = this.add(key);
    const soundInfo = this.loadedSounds[key];
    let didPlay = false;
    if (soundInfo.currentlyPlaying < soundInfo.maxSimultaneous) {
      soundInfo.currentlyPlaying++;
      sound.once("ended", _ => sound.currentlyPlaying--);
      didPlay = super.play(key);
    }
    return didPlay;
  }

  /**
   *
   */
  playButtonClick() {
    if (preferencesStore.noAudio) return;
    this.play("button-click");
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
