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
  hasGameStarted = false;

  @observable
  focusedPlayerCard = null;

  @observable
  focusedEnemyCard = null;

  @observable
  isPaused = false;

  @observable
  skipMenu = true;

  @observable
  noAudio = false;

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

  @computed
  get activeCard() {
    return this.activePlayerCard;
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

  @action
  setSkipMenu(skipMenu) {
    this.skipMenu = skipMenu;
  }
}

const store = new GameStore();

export default store;
