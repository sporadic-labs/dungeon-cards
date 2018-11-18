// Positions and angles are mapped out in instruction-locations-mock.ai on the drive.

const illustratorToPhaserAngle = illustratorDegrees => -1 * illustratorDegrees;

const instructions = [
  {
    title: "Your Hand",
    text:
      "These are your cards - your actions and attacks that you can play during your turn. You draw a new one at the start of your turn. The number in the top right of each card is the energy you need to play that card.",
    modalPosition: { x: 400, y: 400 },
    arrowPosition: { x: 400, y: 600 },
    arrowAngle: illustratorToPhaserAngle(270)
  },
  {
    title: "Your Energy",
    text:
      "This is how much energy you currently have. You can play cards during your turn to gain energy. Your energy resets to zero at the end of your turn.",
    modalPosition: { x: 315, y: 500 },
    arrowPosition: { x: 100, y: 693 },
    arrowAngle: illustratorToPhaserAngle(225)
  },
  {
    title: "Gaining Energy",
    text:
      "This area is where you can play cards to gain energy. You can either play energy cards, or discard certain attack cards to reclaim them as energy.",
    modalPosition: { x: 400, y: 400 },
    arrowPosition: { x: 288, y: 603 },
    arrowAngle: illustratorToPhaserAngle(0)
  },
  {
    title: "Advancing Enemies",
    text:
      "These enemy cards will start at the top of the grid and advance towards you on their turn. If any reach the last row, you’ll lose.",
    modalPosition: { x: 400, y: 287 },
    arrowPosition: { x: 167, y: 67 },
    arrowAngle: illustratorToPhaserAngle(0)
  },
  {
    title: "Clearing the Dungeon",
    text:
      "This deck contains all the cards in this dungeon. When you defeat all the enemies and there are no cards left in this deck, you’ve cleared this dungeon and won the game.",
    modalPosition: { x: 487, y: 356 },
    arrowPosition: { x: 660, y: 159 },
    arrowAngle: illustratorToPhaserAngle(45)
  }
];

export default instructions;
