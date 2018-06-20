import { emitter, EVENT_NAMES } from "../events";

export default async function run(playerManager, enemyManager, actionRunner) {
  let gameIsRunning = true;

  while (gameIsRunning) {
    emitter.emit(EVENT_NAMES.ROUND_START);

    emitter.emit(EVENT_NAMES.ENEMY_TURN_START);
    await enemyManager.update();
    emitter.emit(EVENT_NAMES.ENEMY_TURN_END);

    emitter.emit(EVENT_NAMES.PLAYER_TURN_START);
    // Player's turn
    await playerManager.drawCard();
    await actionRunner.runActions();
    // TODO: ask player to discard cards here
    emitter.emit(EVENT_NAMES.PLAYER_TURN_END);

    emitter.emit(EVENT_NAMES.ROUND_END);
  }
}
