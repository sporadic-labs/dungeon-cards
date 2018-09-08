import { autorun, observe } from "mobx";

/**
 * A class to proxy mobx subscriptions so that we can group related subscriptions them together and
 * easily unsubscribe in an object-oriented way.
 */
export default class MobXProxy {
  disposers = [];

  disposeAndRemove(disposer) {
    disposer();
    this.disposers = this.disposers.filter(d => d !== disposer);
  }

  observe(target, propertyName, listener, invokeImmediately) {
    const disposer = observe(target, propertyName, listener, invokeImmediately);
    this.disposers.push(disposer);
    return () => this.disposeAndRemove(disposer);
  }

  autorun(listener, options) {
    const disposer = autorun(listener, options);
    this.disposers.push(disposer);
    return () => this.disposeAndRemove(disposer);
  }

  destroy() {
    this.disposers.forEach(dispose => dispose());
    this.disposers = [];
  }
}
