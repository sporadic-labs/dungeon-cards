import EmitterWithLogging from "../../helpers/emitter-with-logging";

const EVENT_NAMES = {
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

  GAMEBOARD_CARD_FOCUS: "GAMEBOARD_CARD_FOCUS",
  GAMEBOARD_CARD_DEFOCUS: "GAMEBOARD_CARD_DEFOCUS",

  PLAYER_CARD_SELECT: "PLAYER_CARD_SELECT",
  PLAYER_CARD_DESELECT: "PLAYER_CARD_DESELECT",
  PLAYER_CARD_FOCUS: "PLAYER_CARD_FOCUS",
  PLAYER_CARD_DEFOCUS: "PLAYER_CARD_DEFOCUS",
  PLAYER_CARD_DISCARD: "PLAYER_CARD_DISCARD",
  PLAYER_TURN_ATTEMPT_COMPLETE: "PLAYER_TURN_ATTEMPT_COMPLETE",
  PLAYER_TURN_COMPLETE: "PLAYER_TURN_COMPLETE",

  ENEMY_CARD_FOCUS: "ENEMY_CARD_FOCUS",
  ENEMY_CARD_DEFOCUS: "ENEMY_CARD_DEFOCUS"
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
