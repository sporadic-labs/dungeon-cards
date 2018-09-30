import Phaser from "phaser";
import store from "../../../store/index";
import MobXProxy from "../../../helpers/mobx-proxy";
import { EventProxy } from "../../events/index";
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
    this.scrolls = [];
    this.x = x;
    this.y = y;
    this.rotations = [-(2 * Math.PI) / 180, 0, (2 * Math.PI) / 180];
    this.rotationIndex = 0;
    this.eventProxy = new EventProxy();
    this.debounceEvent = null;
    this.debounceTime = 200; // Wait this long before showing instructions on hover

    // Listen for new cards to be focused
    this.mobProxy = new MobXProxy();
    this.lastCard = null;
    this.mobProxy.observe(store, "focusedPlayerCard", change => {
      const card = change.newValue;
      if (!card) {
        this.cancelQueuedScroll();
      } else if (card !== this.lastCard) {
        this.onNewCardFocus(card);
        this.lastCard = card;
      }
    });

    // Cancel queued instructions if card has been played or unfocused
    this.mobProxy.observe(store, "activePlayerCard", change => {
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
    const rotation = this.rotations[this.rotationIndex];
    this.rotationIndex += 1;
    if (this.rotationIndex > this.rotations.length - 1) this.rotationIndex = 0;
    const scroll = new Scroll(this.scene, this.x, this.y, rotation, card.cardInfo);
    this.scrolls.push(scroll);

    // If we've got enough scrolls to cover all rotations, remove the oldest scroll for performance
    if (this.scrolls.length > this.rotations.length + 1) {
      this.scrolls[0].destroy();
      this.scrolls = this.scrolls.slice(1);
    }
  }

  cancelQueuedScroll() {
    if (this.debounceEvent) this.debounceEvent.remove();
  }

  destroy() {
    this.mobProxy.destroy();
    this.eventProxy.removeAll();
    this.cancelQueuedScroll();
    this.scrolls.forEach(scroll => scroll.destroy());
  }
}
