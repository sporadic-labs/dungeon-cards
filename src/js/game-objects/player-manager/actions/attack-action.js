import { emitter, EVENT_NAMES } from "../events";
import logger from "../../../helpers/logger";

export default function attackAction(playerManager, card) {
  const { gameBoard, scene } = playerManager;

  const onPointerOver = pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    const cell = boardPosition ? gameBoard.getAt(boardPosition.x, boardPosition.y) : null;
    if (cell) {
      logger.log(`You are hovering over ${cell} on the board`);
      emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, cell, card);
    }
  };

  const onPointerDown = pointer => {
    const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
    if (boardPosition) {
      logger.log(`You attacked at (${boardPosition.x}, ${boardPosition.y}) on the board`);
      emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card);
      scene.input.off("pointerdown", onPointerDown);
      scene.input.off("pointerover", onPointerOver);
    } else {
      logger.log("Invalid attack location!");
    }
  };

  scene.input.on("pointerdown", onPointerDown);
  scene.input.on("pointerover", onPointerOver);
}
