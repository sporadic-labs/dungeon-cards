export default class GameSfxPlayer {
  constructor(game) {
    this.game = game;
    this.defaultVolume = 0.1;
  }

  playButtonClick() {
    this.game.sound.play("click1", { volume: this.defaultVolume });
  }
}
