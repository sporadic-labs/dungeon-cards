import { PLAYER_CARD_TYPES } from "../player-manager/player-card";
import { emitter, EVENT_NAMES } from "../events";
import { EndTurnButton } from "../hud";
import { EventProxy } from "../events";
import AttackAction from "./attack-action";
import BlockAction from "./block-action";
import DrawCardAction from "./draw-card-action";
import GetEnergyAction from "./get-energy-action";
import ShiftAction from "./shift-action";

const attacks = [
  PLAYER_CARD_TYPES.ATTACK_ONE,
  PLAYER_CARD_TYPES.ATTACK_THREE_HORIZONTAL,
  PLAYER_CARD_TYPES.ATTACK_THREE_VERTICAL,
  PLAYER_CARD_TYPES.ATTACK_GRID
];

export default class ActionRunner {
  constructor(scene, playerManager, enemyManager, gameBoard) {
    this.scene = scene;
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.gameBoard = gameBoard;
    this.currentAction = null;
    this.proxy = new EventProxy();

    const { width, height } = scene.sys.game.config;
    this.endTurnButton = new EndTurnButton(scene, 80, height / 2);
  }

  async runActions() {
    this.playerManager.enableSelecting();
    this.endTurnButton.activate();

    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_SELECT, this.onPlayerCardSelect, this);
    this.proxy.on(emitter, EVENT_NAMES.PLAYER_CARD_DISCARD, this.onPlayerDiscard, this);
    this.proxy.on(emitter, EVENT_NAMES.ACTION_COMPLETE, this.onComplete, this);

    // Allow the player to take actions until they explicitly click the "end turn" button
    await this.endActions();

    this.playerManager.disableSelecting();
    this.endTurnButton.deactivate();
    this.proxy.removeAll();
  }

  onPlayerDiscard() {
    // Player has discarded the card corresponding to the current action. Note: maybe we need to
    // differentiate between "reclaim for energy" and "discard" events
    if (this.currentAction) this.currentAction.destroy();
  }

  onPlayerCardSelect(card) {
    if (this.currentAction) this.currentAction.destroy();
    this.runAction(card);
  }

  onComplete(card) {
    if (this.currentAction) this.currentAction.destroy();
    this.playerManager.discardCard(card);
  }

  endActions() {
    return new Promise(resolve => emitter.once(EVENT_NAMES.PLAYER_TURN_COMPLETE, resolve));
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
        this.scene,
        card,
        this.playerManager,
        this.gameBoard,
        this.enemyManager
      );
    }
  }
}
