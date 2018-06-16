import { emitter, EVENT_NAMES } from "../../game-runner";
import logger from "../../../helpers/logger";

export default function attackAction(playerManager, card) {
  const { gameBoard, scene } = playerManager;

  const onPointerOver = pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (boardPosition) {
      logger.log(`You are hovering over (${boardPosition.x}, ${boardPosition.y}) on the board`);
      emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, card, boardPosition.x, boardPosition.y);
    }
  };

  const onPointerDown = pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (boardPosition) {
      logger.log(`You attacked at (${boardPosition.x}, ${boardPosition.y}) on the board`);
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card, boardPosition.x, boardPosition.y);
      scene.input.off("pointerdown", onPointerDown);
      scene.input.off("pointerover", onPointerOver);
    } else {
      logger.log("Invalid attack location!");
    }
  };

  scene.input.on("pointerdown", onPointerDown);
  scene.input.on("pointerover", onPointerOver);
}
