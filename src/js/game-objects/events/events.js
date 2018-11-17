import EmitterWithLogging from "../../helpers/emitter-with-logging";

const EVENT_NAMES = {
  GAME_START: "GAME_START",
  GAME_OVER: "GAME_OVER",

  ROUND_START: "ROUND_START",
  ROUND_END: "ROUND_END",
  PLAYER_TURN_START: "PLAYER_TURN_START",
  PLAYER_TURN_END: "PLAYER_TURN_END",
  ENEMY_TURN_START: "ENEMY_TURN_START",
  ENEMY_TURN_END: "ENEMY_TURN_END",

  ACTION_START: "ACTION_START",
  ACTION_PLAY: "ACTION_PLAY",
  ACTION_CANCEL: "ACTION_CANCEL",
  ACTION_COMPLETE: "ACTION_COMPLETE",
  ACTION_UNSUCCESSFUL: "ACTION_UNSUCCESSFUL",

  GAMEBOARD_CARD_FOCUS: "GAMEBOARD_CARD_FOCUS",
  GAMEBOARD_CARD_DEFOCUS: "GAMEBOARD_CARD_DEFOCUS",

  PLAYER_CARD_DRAG_START: "PLAYER_CARD_DRAG_START",
  PLAYER_CARD_DRAG: "PLAYER_CARD_DRAG",
  PLAYER_CARD_DRAG_END: "PLAYER_CARD_DRAG_END",
  PLAYER_CARD_DISCARD: "PLAYER_CARD_DISCARD",

  PLAYER_TURN_ATTEMPT_COMPLETE: "PLAYER_TURN_ATTEMPT_COMPLETE",
  PLAYER_TURN_COMPLETE: "PLAYER_TURN_COMPLETE",

  ENEMY_CARD_FOCUS: "ENEMY_CARD_FOCUS",
  ENEMY_CARD_DEFOCUS: "ENEMY_CARD_DEFOCUS",
  ENEMY_CARD_SOFT_FOCUS: "ENEMY_CARD_SOFT_FOCUS",
  ENEMY_CARD_SOFT_DEFOCUS: "ENEMY_CARD_SOFT_DEFOCUS",
  ENEMY_CARD_SELECT: "ENEMY_CARD_SELECT",

  INSTRUCTIONS_FOCUS: "INSTRUCTIONS_FOCUS",
  INSTRUCTIONS_DEFOCUS: "INSTRUCTIONS_DEFOCUS",
  INSTRUCTIONS_NEXT: "INSTRUCTIONS_NEXT",
  INSTRUCTIONS_CLOSE: "INSTRUCTIONS_CLOSE",

};

/**
 * This event is fired when locations in the game board should be focused.
 *
 * @event GAMEBOARD_CARD_FOCUS
 * @param {object|object[]} cardLocation(s) - either a single location on the board that should be
 * focused, or an array of locations that should be focused. Locations are in the form {x, y}.
 */

const emitter = new EmitterWithLogging("Game Manager");

export { emitter, EVENT_NAMES };
