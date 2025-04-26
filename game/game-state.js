// File: game/game-state.js

import { drawMap } from './ui.js';

let state = {
  units: [],
  currentTurn: null,
  map: [],
  playerId: null,
  roomId: null,
  hasRendered: false,
  player2Seen: false,
  selectedUnitId: null // ✅ Keep selected unit local only
};

export function setState(newState) {
  const wasMapEmpty = state.map.length === 0;
  
  // Update everything except selectedUnitId unless explicitly changed
  state = {
    ...state,
    ...newState,
    selectedUnitId: newState.selectedUnitId !== undefined ? newState.selectedUnitId : state.selectedUnitId
  };

  if (wasMapEmpty && state.map.length > 0 && !state.hasRendered) {
    renderIfMapExists();
    state.hasRendered = true;
  }

  const canvas = document.getElementById('gameCanvas');
  if (canvas && state.map.length > 0) {
    drawMap();
  }
}

export function updateState(newState) {
  setState(newState);
}

export function getState() {
  return state;
}

function renderIfMapExists() {
  const canvas = document.getElementById('gameCanvas');
  if (canvas && state.map.length > 0) {
    canvas.style.display = 'block';
    drawMap();
  }
}
