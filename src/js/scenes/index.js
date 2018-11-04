import Loading from "./loading-scene";
import Play from "./play-scene";
import Background from "./background-scene";

const SCENE_NAME = {
  LOADING: "LOADING",
  PLAY: "PLAY",
  BACKGROUND: "BACKGROUND"
};

/**
 * Register the scene classes to the given game using the SCENE_NAME enum values.
 *
 * @param {Phaser.Game} game
 */
function installScenes(game) {
  game.scene.add(SCENE_NAME.LOADING, Loading);
  game.scene.add(SCENE_NAME.PLAY, Play);
  game.scene.add(SCENE_NAME.BACKGROUND, Background);
}

export { Loading, Play, Background, installScenes, SCENE_NAME };
