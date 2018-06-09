const PLAYER_CARD_INFO = {
  ATTACK_ONE: {
    key: "player-attack-one",
    energy: 0
  },
  ATTACK_THREE_HORIZONTAL: {
    key: "player-attack-three-horizontal",
    energy: 1
  },
  ATTACK_THREE_VERTICAL: {
    key: "player-attack-three-vertical",
    energy: 1
  },
  ATTACK_GRID: {
    key: "player-attack-grid",
    energy: 3
  },
  BLOCK: {
    key: "player-block",
    energy: 0
  },
  DRAW_THREE: {
    key: "player-draw",
    energy: 0
  },
  ENERGY: {
    key: "player-energy",
    energy: 1
  },
  SHIFT_LEFT: {
    key: "player-shift-left",
    energy: 1
  },
  SHIFT_RIGHT: {
    key: "player-shift-right",
    energy: 1
  }
};

/**
 * Enum for types of player cards. Created dynamically from PLAYER_CARD_INFO so there's no chance of
 * typos.
 * @typedef PLAYER_CARD_TYPES
 * @property {string} ATTACK_ONE
 * @property {string} ATTACK_THREE_HORIZONTAL
 * @property {string} ATTACK_THREE_VERTICAL
 * @property {string} ATTACK_GRID
 * @property {string} BLOCK
 * @property {string} DRAW_THREE
 * @property {string} ENERGY
 * @property {string} SHIFT_LEFT
 * @property {string} SHIFT_RIGHT
 */

/**
 * @enum {PLAYER_CARD_TYPES}
 * @readonly
 * @export
 */
const PLAYER_CARD_TYPES = {};
Object.keys(PLAYER_CARD_INFO).forEach(key => (PLAYER_CARD_TYPES[key] = key));

export { PLAYER_CARD_INFO, PLAYER_CARD_TYPES };
