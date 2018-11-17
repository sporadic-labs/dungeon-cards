import { action, observable, computed } from "mobx";

const maxMenuHistory = 3;

class GameStore {
  @observable
  isTargetingDropZone = false;

  @observable
  activePlayerCard = null;

  @observable
  menuStateHistory = []; // Reverse chronological order

  @observable
  menuState = null;

  @observable
  lastMenuState = null;

  @observable
  hasGameStarted = false;

  @observable
  focusedPlayerCard = null;

  @observable
  focusedEnemyCard = null;

  @observable
  isPaused = false;

  @observable
  gameState = null;

  @computed
  get gameStarted() {
    return this.hasGameStarted;
  }

  @computed
  get isGamePaused() {
    return this.isPaused;
  }

  @computed
  get activeCard() {
    return this.activePlayerCard;
  }

  @action
  setGameState(gameState) {
    this.gameState = gameState;
  }

  @action
  setGameStarted(isGameStarted) {
    this.hasGameStarted = isGameStarted;
  }

  @action
  setTargetingDropZone(isTargeting) {
    this.isTargetingDropZone = isTargeting;
  }

  @action
  setActivePlayerCard(card) {
    this.activePlayerCard = card;
  }

  @action
  setFocusedPlayerCard(card) {
    this.focusedPlayerCard = card;
  }

  @action
  setFocusedEnemyCard(card) {
    this.focusedEnemyCard = card;
  }

  @action
  setMenuState(newMenuState) {
    if (this.menuStateHistory.length === 0) {
      this.menuStateHistory = [newMenuState];
      this.lastMenuState = null;
      this.menuState = newMenuState;
    } else if (newMenuState !== this.menuStateHistory[0]) {
      this.lastMenuState = this.menuStateHistory[0];
      this.menuStateHistory = [newMenuState, ...this.menuStateHistory.slice(0, maxMenuHistory - 1)];
      this.menuState = newMenuState;
    }
  }

  @action
  goBackOneMenuState() {
    if (this.menuStateHistory.length > 0) {
      this.lastMenuState = this.menuState;
      this.menuStateHistory = [...this.menuStateHistory.slice(1)];
      this.menuState = this.menuStateHistory[0];
    }
  }

  @action
  setPaused(isPaused) {
    this.isPaused = isPaused;
  }
}

const gameStore = new GameStore();

export default gameStore;
