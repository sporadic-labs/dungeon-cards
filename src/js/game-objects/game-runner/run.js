import { emitter, EVENT_NAMES } from "../events";

export default async function run(playerManager, enemyManager) {
  emitter.emit(EVENT_NAMES.ROUND_START);

  emitter.emit(EVENT_NAMES.ENEMY_TURN_START);
  await enemyManager.update();
  emitter.emit(EVENT_NAMES.ENEMY_TURN_END);

  emitter.emit(EVENT_NAMES.PLAYER_TURN_START);
  await playerManager.update();
  emitter.emit(EVENT_NAMES.PLAYER_TURN_END);

  emitter.emit(EVENT_NAMES.ROUND_END);

  run(playerManager, enemyManager);
}
