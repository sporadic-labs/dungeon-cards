import { emitter, EVENT_NAMES } from "../game-runner";
import logger from "../../helpers/logger";
import { EventProxy } from "../events";

function getAttackPositions(pointer, gameBoard, attackPattern) {
  const positions = [];

  // TODO: this is wrong, the center of the attack can be off the board
  const boardPosition = gameBoard.getBoardPosition(pointer.x, pointer.y);
  if (!boardPosition) return [];

  attackPattern.forEach(({ x: dx, y: dy }) => {
    const x = boardPosition.x + dx;
    const y = boardPosition.y + dy;
    if (gameBoard.isInBounds(x, y)) positions.push({ x, y });
  });

  return positions;
}

export default function attackAction(playerManager, card) {
  const { gameBoard, scene } = playerManager;
  const proxy = new EventProxy();
  const attackPattern = card.cardInfo.cells;

  proxy.on(scene.input, "pointerover", pointer => {
    const positions = getAttackPositions(pointer, gameBoard, attackPattern);
    positions.forEach(({ x, y }) => {
      const enemy = gameBoard.getAt(x, y);
      if (enemy) {
        logger.log(`You are hovering over (${x}, ${y}) on the board`);
        emitter.emit(EVENT_NAMES.GAMEBOARD_CARD_FOCUS, card, x, y);
      }
    });
  });

  proxy.on(scene.input, "pointerdown", pointer => {
    const positions = getAttackPositions(pointer, gameBoard, attackPattern);

    if (positions.length) {
      positions.forEach(({ x, y }) => {
        const enemy = gameBoard.getAt(x, y);
        if (enemy) {
          logger.log(`You attacked at (${x}, ${y}) on the board`);
          emitter.emit(EVENT_NAMES.ACTION_COMPLETE, card, x, y);
        }
      });

      proxy.removeAll();
    }
  });
}
