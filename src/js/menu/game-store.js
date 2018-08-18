import { autorun, computed, observable } from "mobx";
import { MENU_STATES } from "./menu-states";

const maxMenuHistory = 3;

class GameStore {
  // State properties
  @observable menuStateHistory = [MENU_STATES.START_MENU]; // Reverse chronological order

  // Computed properties
  @computed
  get menuState() {
    return this.menuStateHistory[0];
  }

  constructor() {
    autorun(() => {
      console.log(this.menuState);
    });
  }

  // Actions - these mutate the state
  setMenuState(newMenuState) {
    if (newMenuState !== this.menuStateHistory[0]) {
      this.menuStateHistory = [newMenuState, ...this.menuStateHistory.slice(0, maxMenuHistory - 1)];
    }
  }

  goBackOneMenuState() {
    if (this.menuStateHistory.length > 0) {
      this.menuStateHistory = [...this.menuStateHistory.slice(1)];
    }
  }
}

const gameStore = new GameStore();

export default gameStore;
