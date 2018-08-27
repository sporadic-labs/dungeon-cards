import { action, observable, computed } from "mobx";

const maxMenuHistory = 3;

class GameStore {
  @observable
  isReclaimActive = false;

  @observable
  activePlayerCard = null;

  @observable
  menuStateHistory = []; // Reverse chronological order

  @observable
  hasGameStarted = false;

  @observable
  focusedPlayerCard = null;

  @observable
  isPaused = false;

  @computed
  get gameStarted() {
    return this.hasGameStarted;
  }

  @computed
  get menuState() {
    return this.menuStateHistory.length > 0 ? this.menuStateHistory[0] : null;
  }

  @computed
  get isGamePaused() {
    return this.isPaused;
  }

  @action
  setGameStarted(isGameStarted) {
    this.hasGameStarted = isGameStarted;
  }

  @action
  setReclaimActive(isActive) {
    this.isReclaimActive = isActive;
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
  setMenuState(newMenuState) {
    if (this.menuStateHistory.length === 0) {
      this.menuStateHistory = [newMenuState];
    } else if (newMenuState !== this.menuStateHistory[0]) {
      this.menuStateHistory = [newMenuState, ...this.menuStateHistory.slice(0, maxMenuHistory - 1)];
    }
  }

  @action
  goBackOneMenuState() {
    if (this.menuStateHistory.length > 0) {
      this.menuStateHistory = [...this.menuStateHistory.slice(1)];
    }
  }

  @action
  setPaused(isPaused) {
    this.isPaused = isPaused;
  }
}

const store = new GameStore();

export default store;
