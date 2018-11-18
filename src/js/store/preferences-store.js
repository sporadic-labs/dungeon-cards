import { action, observable, computed } from "mobx";
import storageAutosync from "./sync-to-storage";

class PreferencesStore {
  @observable
  skipMenu = true;

  @observable
  noAudio = false;

  @observable
  hasSeenInstructions = false;

  @observable
  lastPlayed = null;

  @action
  setSkipMenu(skipMenu) {
    this.skipMenu = skipMenu;
  }

  @action
  setAudio(noAudio) {
    this.noAudio = noAudio;
  }

  @action
  setHasSeenInstructions(hasSeenInstructions) {
    this.hasSeenInstructions = hasSeenInstructions;
  }

  @action
  reset() {
    this.skipMenu = false;
    this.noAudio = false;
    this.hasSeenInstructions = false;
    this.lastPlayed = null;
  }

  @action
  setLastPlayed(lastPlayed) {
    this.lastPlayed = lastPlayed;
  }
}

const preferencesStore = new PreferencesStore();
storageAutosync("tower-of-cards-preferences-store", preferencesStore);

export default preferencesStore;
