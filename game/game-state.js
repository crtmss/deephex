// game/game-state.js

import { drawMap } from './ui.js';

let state = {
  units: [],
  currentTurn: null,
  map: [],
  playerId: null,
  roomId: null,
};

export function setState(newState) {
  state = { ...state, ...newState };
  renderIfMapExists();
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
    drawMap();
  }
}

