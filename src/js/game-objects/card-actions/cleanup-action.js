export default function cleanupAction(playerManager, card) {
  const { scene } = playerManager;
  scene.input.removeAllListeners("pointerdown");
  scene.input.removeAllListeners("pointerover");
}
