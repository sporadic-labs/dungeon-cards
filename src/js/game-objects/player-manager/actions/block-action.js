import { emitter, EVENT_NAMES } from "../events";
import logger from "../../../helpers/logger";

export default function blockAction(playerManager, card) {
  const { gameBoard, scene } = playerManager;

  const onPointerOver = pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (boardPosition) {
      emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, card, boardPosition.x, boardPosition.y);
    }
  };

  const onPointerDown = pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (!boardPosition) {
      logger.log("Trying to block a location not on the board");
      return;
    }

    const enemy = gameBoard.getAt(boardPosition.x, boardPosition.y);
    if (!enemy) {
      logger.log("Trying to block an empty location");
      return;
    }

    enemy.setBlocked();
    scene.input.off("pointerdown", onPointerDown);
    scene.input.off("pointerover", onPointerOver);
    emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card, boardPosition.x, boardPosition.y);
  };

  scene.input.on("pointerdown", onPointerDown);
  scene.input.on("pointerover", onPointerOver);
}
