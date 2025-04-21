// game/game-state.js

import { render } from './map.js';

let state = {
  units: [],          // Array of all unit objects on the map
  currentTurn: null,  // 'player1' or 'player2'
  map: [],            // The 2D array map of terrain tiles
  playerId: null,     // This client's assigned playerId
  roomId: null,       // ID of the connected room
};

// Merges newState into existing state and triggers render if needed
export function setState(newState) {
  state = { ...state, ...newState };
  renderIfMapExists();
}

// Similar to setState — semantic alias
export function updateState(newState) {
  setState(newState);
}

// Access current game state
export function getState() {
  return state;
}

// Internal helper to re-render canvas map
function renderIfMapExists() {
  const canvas = document.getElementById('game-canvas');
  if (canvas && state.map.length > 0) {
    render(canvas, state.map);
  }
}
