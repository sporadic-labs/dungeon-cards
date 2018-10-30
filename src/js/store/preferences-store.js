import { action, observable, computed } from "mobx";
import storageAutosync from "./sync-to-storage";

class PreferencesStore {
  @observable
  skipMenu = true;

  @observable
  noAudio = false;

  @action
  setSkipMenu(skipMenu) {
    this.skipMenu = skipMenu;
  }

  @action
  setAudio(noAudio) {
    this.noAudio = noAudio;
  }
}

const preferencesStore = new PreferencesStore();
storageAutosync("tower-of-cards-preferences-store", preferencesStore);

export default preferencesStore;
