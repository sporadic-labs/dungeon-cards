import { action, observable } from "mobx";

class GameStore {
  @observable isReclaimActive = false;
  @observable activePlayerCard = null;

  @action
  setReclaimActive(isActive) {
    this.isReclaimActive = isActive;
  }

  @action
  setActivePlayerCard(card) {
    this.activePlayerCard = card;
  }
}

const store = new GameStore();

export default store;
