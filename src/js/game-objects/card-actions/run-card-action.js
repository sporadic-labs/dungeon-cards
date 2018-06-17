import drawCardAction from "./draw-card-action";
import getEnergyAction from "./get-energy-action";
import attackAction from "./attack-action";
import blockAction from "./block-action";
import { PLAYER_CARD_TYPES } from "../player-manager/player-card";
import { emitter, EVENT_NAMES } from "../game-runner";

const attacks = [
  PLAYER_CARD_TYPES.ATTACK_ONE,
  PLAYER_CARD_TYPES.ATTACK_THREE_HORIZONTAL,
  PLAYER_CARD_TYPES.ATTACK_THREE_VERTICAL,
  PLAYER_CARD_TYPES.ATTACK_GRID
];

export default function runCardAction(playerManager, card) {
  emitter.emit(EVENT_NAMES.ACTION_START);
  if (card.type === PLAYER_CARD_TYPES.DRAW_THREE) {
    drawCardAction(playerManager, card);
  } else if (card.type === PLAYER_CARD_TYPES.ENERGY) {
    getEnergyAction(playerManager, card);
  } else if (attacks.includes(card.type)) {
    attackAction(playerManager, card);
  } else if (card.type === PLAYER_CARD_TYPES.BLOCK) {
    blockAction(playerManager, card);
  }
}