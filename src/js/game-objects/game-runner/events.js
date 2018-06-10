import EmitterWithLogging from "../../helpers/emitter-with-logging";

const EVENT_NAMES = {
  ROUND_START: "ROUND_START",
  ROUND_END: "ROUND_END",
  PLAYER_TURN_START: "PLAYER_TURN_START",
  PLAYER_TURN_END: "PLAYER_TURN_END",
  ENEMY_TURN_START: "ENEMY_TURN_START",
  ENEMY_TURN_END: "ENEMY_TURN_END"
};

const emitter = new EmitterWithLogging("Game Manager");

export { emitter, EVENT_NAMES };
