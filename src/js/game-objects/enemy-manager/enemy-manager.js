export default class EnemyManager {
  constructor() {}

  update() {
    this.moveEnemies();
    this.spawnEnemies();
  }

  moveEnemies() {
    // Loop over all enemies from bottom left to top right
    //  If enemy is not blocked
    //    Ask enemy where it wants to move
    //    Confirm with game board that the location is free
    //    Tell enemy to move
    //    Wait for animation to finish before moving next enemy
  }

  spawnEnemies() {
    // If no cards remaining OR no open locations in game board
    //  Skip
    // Else
    //  Loop over open locations from game board
    //  Draw a card ID from enemy deck
    //  Contruct an EnemyCard from the card ID
    //  Register the card with the game board
    //  Tell the EnemyCard where to animate to
    //  Wait for last animation to finish before game advances
  }
}
