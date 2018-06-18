import { emitter, EVENT_NAMES } from "../events";
import Action from "./action";

export default class GetEnergyAction extends Action {
  constructor(scene, card, playerManager, gameBoard, enemyManager) {
    super();
    playerManager.addEnergy(card.getEnergy());
    emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card);
  }
}
