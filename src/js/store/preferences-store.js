import { action, observable, computed } from "mobx";
import storageAutosync from "./sync-to-storage";

class PreferencesStore {
  @observable
  skipMenu = true;

  @observable
  noAudio = false;

  @observable
  showInstructionsOnPlay = true;

  @action
  setSkipMenu(skipMenu) {
    this.skipMenu = skipMenu;
  }

  @action
  setAudio(noAudio) {
    this.noAudio = noAudio;
  }

  @action
  setShowInstructionsOnPlay(showInstructionsOnPlay) {
    this.showInstructionsOnPlay = showInstructionsOnPlay;
  }
}

const preferencesStore = new PreferencesStore();
storageAutosync("tower-of-cards-preferences-store", preferencesStore);

export default preferencesStore;
