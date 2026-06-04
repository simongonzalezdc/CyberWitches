/**
 * Audio access seam.
 *
 * Game-logic managers need the AudioSystem at call time, but they are
 * constructed before it exists (gameInit builds audio late, then wires it).
 * Previously each manager reached `uiManager.systems.audioSystem ||
 * window.audioSystem` — a service-locator read through UIManager plus a dead
 * `window.audioSystem` fallback that was never assigned.
 *
 * This accessor concentrates "how to reach the audio system" in one place:
 * gameInit registers the instance once it's built; managers (and tests, with a
 * fake) ask for it via getAudioSystem(). It keeps the necessary late binding
 * without coupling the managers to UIManager's internals.
 */
let currentAudioSystem = null;

/** Register the live AudioSystem (called once from gameInit). */
export function setAudioSystem(audioSystem) {
    currentAudioSystem = audioSystem;
}

/** @returns {object|null} the registered AudioSystem, or null before it is wired */
export function getAudioSystem() {
    return currentAudioSystem;
}
