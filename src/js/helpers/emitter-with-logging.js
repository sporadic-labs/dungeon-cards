import { Events } from "phaser";
import Logger from "./logger";

/**
 * Snoop on the emitter for debugging
 */
export default class EmitterWithLogging extends Events.EventEmitter {
  constructor(key) {
    super();
    this.key = key;
  }

  emit(event, ...args) {
    Logger.log(`${this.key} Event emitted: ${event}`);
    super.emit(event, ...args);
  }
}
