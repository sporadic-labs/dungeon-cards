import { emitter, EVENT_NAMES } from "./events";

export default async function run(playerManager, enemyManager) {
  emitter.emit(EVENT_NAMES.ROUND_START);

  await enemyManager.update();
  await playerManager.update();

  emitter.emit(EVENT_NAMES.ROUND_END);

  run(playerManager, enemyManager);
}
