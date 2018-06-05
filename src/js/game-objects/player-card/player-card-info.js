const PLAYER_CARD_INFO = {
  ATTACK_ONE: { key: "player-attack-one" },
  ATTACK_THREE_HORIZONTAL: { key: "player-attack-three-horizontal" },
  ATTACK_THREE_VERTICAL: { key: "player-attack-three-vertical" },
  ATTACK_GRID: { key: "player-attack-grid" },
  BLOCK: { key: "player-block" },
  DRAW_THREE: { key: "player-draw" },
  ENERGY: { key: "player-energy" },
  SHIFT_LEFT: { key: "player-shift-left" },
  SHIFT_RIGHT: { key: "player-shift-right" }
};

// Create "enum" from keys above so there's no chance of typos
const PLAYER_CARD_TYPES = {};
Object.keys(PLAYER_CARD_INFO).forEach(key => (PLAYER_CARD_TYPES[key] = key));

export { PLAYER_CARD_INFO, PLAYER_CARD_TYPES };
