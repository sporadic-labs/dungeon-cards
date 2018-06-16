import logger from "../../helpers/logger";
import { arrayEqual } from "../../helpers/array-utils";

/**
 * A proxy that tracks subscriptions to EventEmitters, so that all listeners can be unsubscribed
 * using `EventEmitterProxy#removeAll`. Actions can use this to subscribe to events from different
 * emitters and then clean up after themselves in an automated way.
 *
 * @export
 * @class EventEmitterProxy
 */
export default class EventEmitterProxy {
  events = [];

  on(eventEmitter, eventName, listener, context) {
    this.events.push([eventEmitter, eventName, listener, context]);
    eventEmitter.on(eventName, listener, context);
  }

  once(eventEmitter, eventName, listener, context) {
    this.events.push([eventEmitter, eventName, listener, context]);
    eventEmitter.once(eventName, listener, context);
  }

  off(eventEmitter, eventName, listener, context) {
    const args = [eventEmitter, eventName, listener, context];
    this.events = this.events.filter(array => !arrayEqual(array, args));
    eventEmitter.off(eventName, listener, context);
  }

  debugDump() {
    logger.log(`[${this.events.map(args => `\n\tEvent "${args[1]}"`).join(",")}\n]`);
  }

  /**
   * Remove all listeners that the EventEmitterProxy is currently listening to.
   *
   * @memberof EventEmitterProxy
   */
  removeAll() {
    this.events.forEach(([eventEmitter, eventName, listener, context]) =>
      eventEmitter.off(eventName, listener, context)
    );
  }
}
