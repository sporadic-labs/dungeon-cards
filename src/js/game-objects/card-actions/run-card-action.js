import { PLAYER_CARD_TYPES } from "../player-manager/player-card";
import { emitter, EVENT_NAMES } from "../events";
import { EndTurnButton } from "../hud";
import { EventProxy } from "../events";
import AttackAction from "./attack-action";
import BlockAction from "./block-action";
import DrawCardAction from "./draw-card-action";
import GetEnergyAction from "./get-energy-action";
import ShiftAction from "./shift-action";
import Arrow from "./arrow";
import HudToast from "../hud/hud-toast";

const attacks = [
  PLAYER_CARD_TYPES.ATTACK_ONE,
  PLAYER_CARD_TYPES.ATTACK_THREE_HORIZONTAL,
  PLAYER_CARD_TYPES.ATTACK_THREE_VERTICAL,
  PLAYER_CARD_TYPES.ATTACK_GRID
];

const promisifyEvent = (emitter, eventName) =>
  new Promise(resolve => emitter.once(eventName, resolve));

export default class ActionRunner {
  constructor(scene, playerManager, enemyManager, gameBoard) {
    this.scene = scene;
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.gameBoard = gameBoard;
    this.currentAction = null;
    this.proxy = new EventProxy();
    this.toast = new HudToast(scene);

    const { height } = scene.sys.game.config;
    this.endTurnButton = new EndTurnButton(scene, 80, height / 2 - 16);
    this.endTurnButton.deactivate();

    this.proxy.on(scene.events, "shutdown", this.destroy, this);
    this.proxy.on(scene.events, "destroy", this.destroy, this);
  }

  showToast(text) {
    this.toast.setMessage(text);
  }

  async runActions() {
    this.playerManager.enableSelecting();
    this.endTurnButton.activate();

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DRAG_START, this.onPlayerCardSelect, this);
    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DISCARD, this.killCurrentAction, this);
    this.proxy.on(emitter, EVENT_NAMES.ACTION_COMPLETE, this.onComplete, this);
    this.proxy.on(emitter, EVENT_NAMES.ACTION_UNSUCCESSFUL, this.killCurrentAction, this);

    // Allow the player to take actions until they explicitly click the "end turn" button
    await promisifyEvent(emitter, EVENT_NAMES.PLAYER_TURN_COMPLETE);

    if (this.currentAction) this.currentAction.destroy();
    this.playerManager.disableSelecting();
    this.endTurnButton.deactivate();
    this.proxy.removeAll();
  }

  killCurrentAction() {
    if (this.currentAction) this.currentAction.destroy();
  }

  onPlayerCardSelect(card) {
    this.killCurrentAction();
    this.runAction(card);
  }

  onComplete(card) {
    this.killCurrentAction();
    this.playerManager.discardCard(card);
  }

  runAction(card) {
    emitter.emit(EVENT_NAMES.ACTION_START);

    let Constructor;
    if (card.type === PLAYER_CARD_TYPES.DRAW_THREE) {
      Constructor = DrawCardAction;
    } else if (card.type === PLAYER_CARD_TYPES.ENERGY) {
      Constructor = GetEnergyAction;
    } else if (attacks.includes(card.type)) {
      Constructor = AttackAction;
    } else if (card.type === PLAYER_CARD_TYPES.BLOCK) {
      Constructor = BlockAction;
    } else if (
      card.type === PLAYER_CARD_TYPES.SHIFT_LEFT ||
      card.type === PLAYER_CARD_TYPES.SHIFT_RIGHT
    ) {
      Constructor = ShiftAction;
    }

    if (Constructor) {
      this.currentAction = new Constructor(
        this,
        this.scene,
        card,
        this.playerManager,
        this.gameBoard,
        this.enemyManager
      );
    }
  }

  destroy() {
    this.toast.destroy();
    this.killCurrentAction();
    this.proxy.removeAll();
  }
}
