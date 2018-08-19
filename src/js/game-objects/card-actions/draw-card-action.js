import { emitter, EVENT_NAMES } from "../events";
import Action from "./action";

export default class DrawCardAction extends Action {
  constructor(actionRunner, scene, card, playerManager, gameBoard, enemyManager) {
    super();
    playerManager.drawCard();
    playerManager.drawCard();
    playerManager.drawCard();
    emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card);
  }
}
