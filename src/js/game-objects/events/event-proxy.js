import logger from "../../helpers/logger";

/**
 * An event listener with a guard against being invoked after it has been unsubscribed. Note, we
 * could speed this up by using the life cycle plugin pattern of proxying the emitter - rather than
 * the individual listeners - by using a map from emitter => array of listeners.
 *
 * @class EventListener
 */
class EventListener {
  constructor(eventEmitter, eventName, listener, context, isOnce = false) {
    this.eventEmitter = eventEmitter;
    this.eventName = eventName;
    this.listener = listener;
    this.context = context;
    this.isSubscribed = true;

    if (isOnce) eventEmitter.once(eventName, this.onEvent, this);
    else eventEmitter.on(eventName, this.onEvent, this);
  }

  /**
   * Does this listener match the given signature
   */
  doesMatch(eventEmitter, eventName, listener, context) {
    return (
      eventEmitter === this.eventEmitter &&
      this.eventName === eventName &&
      this.listener === listener &&
      context === this.context
    );
  }

  onEvent(...args) {
    if (this.isSubscribed) this.listener.apply(this.context, args);
  }

  destroy() {
    this.isSubscribed = false;
    this.eventEmitter.off(this.eventName, this.onEvent, this);
  }
}

/**
 * A proxy that tracks subscriptions to EventEmitters, so that all listeners can be unsubscribed
 * using `EventProxy#removeAll`. Actions can use this to subscribe to events from different
 * emitters and then clean up after themselves in an automated way.
 *
 * @export
 * @class EventProxy
 */
export default class EventProxy {
  listeners = [];

  on(eventEmitter, eventName, listener, context) {
    this.listeners.push(new EventListener(eventEmitter, eventName, listener, context));
  }

  once(eventEmitter, eventName, listener, context) {
    this.listeners.push(new EventListener(eventEmitter, eventName, listener, context), true);
  }

  off(eventEmitter, eventName, listener, context) {
    this.listeners = this.listeners.filter(listener => {
      if (listener.doesMatch(eventEmitter, eventName, listener, context)) {
        listener.destroy();
        return false;
      }
      return true;
    });
  }

  debugDump() {
    logger.log(
      `[${this.listeners.map(listener => `\n\tEvent "${listener.eventName}"`).join(",")}\n]`
    );
  }

  /**
   * Remove all listeners that the EventProxy is currently listening to.
   *
   * @memberof EventProxy
   */
  removeAll() {
    this.listeners.forEach(listener => listener.destroy());
    this.listeners = [];
  }
}
