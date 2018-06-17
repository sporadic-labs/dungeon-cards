import logger from "../../helpers/logger";
import { arrayEqual } from "../../helpers/array-utils";

/**
 * A proxy that tracks subscriptions to EventEmitters, so that all listeners can be unsubscribed
 * using `EventProxy#removeAll`. Actions can use this to subscribe to events from different
 * emitters and then clean up after themselves in an automated way.
 *
 * @export
 * @class EventProxy
 */
export default class EventProxy {
  /**
   * Array of subscriptions to EventEmitters, in the form [emitter, event, listener, context].
   *
   * @memberof EventProxy
   */
  subscriptions = [];

  on(eventEmitter, eventName, listener, context) {
    this.subscriptions.push([eventEmitter, eventName, listener, context]);
    eventEmitter.on(eventName, listener, context);
  }

  once(eventEmitter, eventName, listener, context) {
    this.subscriptions.push([eventEmitter, eventName, listener, context]);
    eventEmitter.once(eventName, listener, context);
  }

  off(eventEmitter, eventName, listener, context) {
    const args = [eventEmitter, eventName, listener, context];
    this.subscriptions = this.subscriptions.filter(array => !arrayEqual(array, args));
    eventEmitter.off(eventName, listener, context);
  }

  debugDump() {
    logger.log(`[${this.subscriptions.map(args => `\n\tEvent "${args[1]}"`).join(",")}\n]`);
  }

  /**
   * Remove all listeners that the EventProxy is currently listening to.
   *
   * @memberof EventProxy
   */
  removeAll() {
    this.subscriptions.forEach(([eventEmitter, eventName, listener, context]) =>
      eventEmitter.off(eventName, listener, context)
    );
  }
}
