import { action, observable } from "mobx";

class GameStore {
  @observable isReclaimActive = false;

  @action
  setReclaimActive(isActive) {
    this.isReclaimActive = isActive;
  }
}

const store = new GameStore();

export default store;
