import { emitter, EVENT_NAMES } from "../events";

export default function getEnergyAction(playerManager, card) {
  playerManager.addEnergy(1);
  emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card);
}
