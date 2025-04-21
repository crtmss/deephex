// game/game-state.js

import { render } from './map.js';

let state = {
  units: [],          // Array of units on the map
  currentTurn: null,  // Player ID whose turn it is
  map: [],            // Full hex map (25x25)
  playerId: null,     // This client's assigned playerId
};

// Allows other modules to update game state
export function setState(newState) {
  state = { ...state, ...newState };

  // Trigger render when the map is updated
  const canvas = document.getElementById('game-canvas');
  if (canvas && state.map.length > 0) {
    render(canvas, state.map);
  }
}

// Allows reading the current game state
export function getState() {
  return state;
}
