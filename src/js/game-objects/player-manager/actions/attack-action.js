import { emitter, EVENT_NAMES } from "../events";
import logger from "../../../helpers/logger";

export default function attackAction(playerManager, card) {
  const { gameBoard, scene } = playerManager;

  const onPointerDown = pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (boardPosition) {
      logger.log(`You attacked at (${boardPosition.x}, ${boardPosition.y}) on the board`);
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card);
      scene.input.off("pointerdown", onPointerDown);
    } else {
      logger.log("Invalid attack location!");
    }
  };

  scene.input.on("pointerdown", onPointerDown);
}
