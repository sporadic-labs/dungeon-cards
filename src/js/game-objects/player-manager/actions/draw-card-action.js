import { emitter, EVENT_NAMES } from "../events";

export default function drawCardAction(playerManager, card) {
  playerManager.drawCard();
  playerManager.drawCard();
  playerManager.drawCard();
  emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card);
}
