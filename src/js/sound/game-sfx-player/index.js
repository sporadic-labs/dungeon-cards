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
  add(key, maxSimultaneous = 1, volume = 1.0, loop = false) {
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
    console.log("Attempting to play a sound!");
    if (preferencesStore.noAudio) return;
    if (!this.loadedSounds[key]) {
      this.add(key);
    }
    const sound = this.loadedSounds[key];
    let didPlay = false;
    if (sound.currentlyPlaying < sound.maxSimultaneous) {
      console.log("Playing this sound is allowed.");
      console.log(sound.currentlyPlaying);
      console.log(sound.maxSimultaneous);
      sound.currentlyPlaying++;
      sound.phaserSound.once("ended", _ => sound.currentlyPlaying--);
      // didPlay = sound.phaserSound.play(playArguments);
      didPlay = super.play(key, playArguments);
    }
    return didPlay;
  }

  /**
   *
   */
  playButtonClick() {
    if (preferencesStore.noAudio) return;
    this.play("button-click", { volume: this.defaultVolume });
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
