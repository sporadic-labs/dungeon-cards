import drawCardAction from "./draw-card-action";
import { PLAYER_CARD_TYPES } from "../player-card";

export default function runCardAction(playerManager, card) {
  if (card.type === PLAYER_CARD_TYPES.DRAW_THREE) {
    drawCardAction(playerManager, card);
  }
}
