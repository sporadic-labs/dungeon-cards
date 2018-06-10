import EmitterWithLogging from "../../helpers/emitter-with-logging";

const EVENT_NAMES = {
  ROUND_START: "ROUND_START",
  ROUND_END: "ROUND_END"
};

const emitter = new EmitterWithLogging("Game Manager");

export { emitter, EVENT_NAMES };
