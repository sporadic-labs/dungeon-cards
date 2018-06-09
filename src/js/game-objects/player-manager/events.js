import { Events } from "phaser";
import Logger from "../../helpers/logger";

const EVENT_NAMES = {
  ACTION_START: "ACTION_START",
  ACTION_CANCEL: "ACTION_CANCEL",
  ACTION_COMPLETE: "ACTION_COMPLETE",
  PLAYER_CARD_SELECT: "PLAYER_CARD_SELECT",
  PLAYER_CARD_DESELECT: "PLAYER_CARD_DESELECT",
  PLAYER_CARD_FOCUS: "PLAYER_CARD_FOCUS",
  PLAYER_CARD_DEFOCUS: "PLAYER_CARD_DEFOCUS",
  END_PLAYER_TURN: "END_PLAYER_TURN"
};

const emitter = new Events.EventEmitter();

// Snoop on the emitter for debugging
emitter.emit = function(event, ...args) {
  Logger.log(`Event emitted: ${event}`);
  Events.EventEmitter.prototype.emit.call(emitter, event, ...args);
};

export { emitter, EVENT_NAMES };
