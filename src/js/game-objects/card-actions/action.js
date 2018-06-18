/**
 * Interface for defining the structure of an action. Basically a way to enforce that all actions
 * can be cleaned up via Action#destroy.
 *
 * @export
 * @class Action
 */
export default class Action {
  destroy() {
    // noop - child classes should implement their own logic
  }
}
