const ENEMY_CARD_INFO = {
  WEAK_ENEMY: {
    key: "cards/card-contents-enemy-small",
    description:
      "This small enemy can move up to 1 square at a time. It is weak, having only 1 health.",
    health: 1
  },
  STRONG_ENEMY: {
    key: "cards/card-contents-enemy-big",
    description:
      "This larger enemy can move up to 1 square at a time. It is more dangerous, having 2 health.",
    health: 2
  },
  BLANK: {
    key: null,
    description: "This blank card can do no harm.  Awesome!",
    health: null
  }
};

/**
 * @enum {ENEMY_CARD_TYPES}
 * @readonly
 * @export
 */
const ENEMY_CARD_TYPES = {};
Object.keys(ENEMY_CARD_INFO).forEach(key => (ENEMY_CARD_TYPES[key] = key));

export { ENEMY_CARD_INFO, ENEMY_CARD_TYPES };
