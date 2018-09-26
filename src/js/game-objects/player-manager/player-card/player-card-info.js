const PLAYER_CARD_INFO = {
  ATTACK_ONE: {
    key: "cards/card-contents-attack-1",
    title: "Single Attack",
    description: "Attack a single enemy.",
    energy: 0,
    cost: 0,
    cells: [{ x: 0, y: 0 }]
  },
  ATTACK_THREE_HORIZONTAL: {
    key: "cards/card-contents-attack-3-horizontal",
    title: "Horizontal Attack",
    description: "Attack up to 3 enemies in any row.",
    energy: 1,
    cost: 1,
    cells: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
  },
  ATTACK_THREE_VERTICAL: {
    key: "cards/card-contents-attack-3-vertical",
    title: "Vertical Attack",
    description: "Attack up to 3 enemies in any column.",
    energy: 1,
    cost: 1,
    cells: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }]
  },
  ATTACK_GRID: {
    key: "cards/card-contents-attack-9",
    title: "Grid Attack",
    description: "Attack up to 9 enemies in a grid.",
    energy: 3,
    cost: 3,
    cells: [
      { x: 0, y: -1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 }
    ]
  },
  BLOCK: {
    key: "cards/card-contents-block",
    title: "Block",
    description:
      "Block an enemy from moving for 1 turn. Any enemies behind the block will also be unable to move.",
    energy: 0,
    cost: 0,
    cells: [{ x: 0, y: 0 }]
  },
  DRAW_THREE: {
    key: "cards/card-contents-draw",
    title: "Draw 3",
    description: "Add 3 additional cards to your hand.",
    energy: 0,
    cost: 0
  },
  ENERGY: {
    key: "cards/card-contents-energy",
    title: "Energy",
    description: "Add 1 to your energy pool.",
    energy: 1,
    cost: 0
  },
  SHIFT_LEFT: {
    key: "cards/card-contents-shift-left",
    title: "Shift Left",
    description:
      "Shift the selected row to the left by 1 position. Enemies that are moved off the board will be destroyed!",
    energy: 0,
    cost: 0,
    cells: [
      // TODO(rex): Not sure how to represent this.
      { x: -3, y: 0 },
      { x: -2, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ]
  },
  SHIFT_RIGHT: {
    key: "cards/card-contents-shift-right",
    title: "Shift Right",
    description:
      "Shift the selected row to the right by 1 position. Enemies that are moved off the board will be destroyed!",
    energy: 0,
    cost: 0,
    cells: [
      // TODO(rex): Not sure how to represent this.
      { x: -3, y: 0 },
      { x: -2, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ]
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
