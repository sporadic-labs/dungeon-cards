import Phaser from "phaser";
import { gameStore } from "../../../store";
import MobXProxy from "../../../helpers/mobx-proxy";
import { EventProxy } from "../../events";
import Scroll from "./scroll";

/**
 * @export
 * @class ScrollManager
 */
export default class ScrollManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.eventProxy = new EventProxy();
    this.debounceEvent = null;
    this.debounceTime = 200; // Wait this long before showing instructions on hover
    this.currentScroll = null;

    // Listen for new cards to be focused
    this.mobProxy = new MobXProxy();
    this.lastCard = null;
    this.mobProxy.observe(gameStore, "focusedPlayerCard", change => {
      const card = change.newValue;
      if (!card) {
        this.cancelQueuedScroll();
      } else if (card !== this.lastCard) {
        this.onNewCardFocus(card);
        this.lastCard = card;
      }
    });

    // Cancel queued instructions if card has been played or unfocused
    this.mobProxy.observe(gameStore, "activePlayerCard", change => {
      const card = change.newValue;
      if (!card) this.cancelQueuedScroll();
    });

    this.eventProxy.once(scene.events, "shutdown", this.destroy, this);
    this.eventProxy.once(scene.events, "destroy", this.destroy, this);
  }

  onNewCardFocus(card) {
    this.cancelQueuedScroll();
    this.debounceEvent = this.scene.time.addEvent({
      delay: this.debounceTime,
      callback: () => this.showNewScroll(card)
    });
  }

  showNewScroll(card) {
    if (this.currentScroll) this.currentScroll.fadeOut();
    this.currentScroll = new Scroll(this.scene, this.x, this.y, card.cardInfo);
  }

  cancelQueuedScroll() {
    if (this.debounceEvent) this.debounceEvent.remove();
  }

  destroy() {
    this.mobProxy.destroy();
    this.eventProxy.removeAll();
    this.cancelQueuedScroll();
    if (this.currentScroll) this.currentScroll.destroy();
  }
}
