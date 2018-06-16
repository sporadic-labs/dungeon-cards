import { emitter, EVENT_NAMES } from "../game-runner";
import logger from "../../helpers/logger";
import EventProxy from "./event-emitter-proxy";

export default function attackAction(playerManager, card) {
  const { gameBoard, scene } = playerManager;

  const proxy = new EventProxy();

  proxy.on(scene.input, "pointerover", pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (boardPosition) {
      logger.log(`You are hovering over (${boardPosition.x}, ${boardPosition.y}) on the board`);
      emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, card, boardPosition.x, boardPosition.y);
    }
  });

  proxy.on(scene.input, "pointerdown", pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (boardPosition) {
      logger.log(`You a ttacked at (${boardPosition.x}, ${boardPosition.y}) on the board`);
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card, boardPosition.x, boardPosition.y);
      proxy.removeAll();
    } else {
      logger.log("Invalid attack location!");
    }
  });
}
