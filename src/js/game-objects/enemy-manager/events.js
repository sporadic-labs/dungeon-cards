import EmitterWithLogging from "../../helpers/emitter-with-logging";

const EVENT_NAMES = {
  ENEMY_CARD_SELECT: "ENEMY_CARD_SELECT",
  ENEMY_CARD_FOCUS: "ENEMY_CARD_FOCUS",
  ENEMY_CARD_DEFOCUS: "ENEMY_CARD_DEFOCUS",
};

const emitter = new EmitterWithLogging(`Enemy Manager`);

export { emitter, EVENT_NAMES };
