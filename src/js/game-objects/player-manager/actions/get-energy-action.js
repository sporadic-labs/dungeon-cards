import { emitter, EVENT_NAMES } from "../../game-runner";

export default function getEnergyAction(playerManager, card) {
  playerManager.addEnergy(card.getEnergy());
  emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card);
}
