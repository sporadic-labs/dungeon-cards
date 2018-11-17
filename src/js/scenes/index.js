import Loading from "./loading-scene";
import Play from "./play-scene";
import Background from "./background-scene";
import Instructions from "./instructions-scene/index";

const SCENE_NAME = {
  LOADING: "LOADING",
  PLAY: "PLAY",
  BACKGROUND: "BACKGROUND",
  INSTRUCTIONS: "INSTRUCTIONS"
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
  game.scene.add(SCENE_NAME.INSTRUCTIONS, Instructions);
}

export { Loading, Play, Background, Instructions, installScenes, SCENE_NAME };
