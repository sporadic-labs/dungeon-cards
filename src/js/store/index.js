import { action, observable, computed } from "mobx";

const maxMenuHistory = 3;

class GameStore {
  @observable
  isReclaimActive = false;

  @observable
  activePlayerCard = null;

  @observable
  focusedPlayerCard = null;

  @observable
  menuStateHistory = []; // Reverse chronological order

  @observable
  hasGameStarted = false;

  @action
  setGameStarted(isGameStarted) {
    this.hasGameStarted = isGameStarted;
  }

  @computed
  get menuState() {
    return this.menuStateHistory[0];
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
    if (newMenuState !== this.menuStateHistory[0]) {
      this.menuStateHistory = [newMenuState, ...this.menuStateHistory.slice(0, maxMenuHistory - 1)];
    }
  }

  @action
  goBackOneMenuState() {
    if (this.menuStateHistory.length > 0) {
      this.menuStateHistory = [...this.menuStateHistory.slice(1)];
    }
  }
}

const store = new GameStore();

export default store;
