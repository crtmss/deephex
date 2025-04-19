export let units = [
  { id: 1, type: 'infantry', x: 2, y: 2, hp: 5, owner: 'player_1' },
  { id: 2, type: 'archer', x: 20, y: 20, hp: 5, owner: 'player_2' }
];

export function performAction() {
  console.log('Action executed');
}

import { getState, updateState } from './game-state.js';
import { playerId } from '../lib/supabase.js';

let selectedUnit = null;

export function performAction() {
  console.log('Not implemented yet');
}

document.getElementById('gameCanvas').addEventListener('click', event => {
  const state = getState();
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / 40);
  const y = Math.floor((event.clientY - rect.top) / 35);

  if (!selectedUnit) {
    selectedUnit = state.units.find(u => u.owner === state.turn && u.x === x && u.y === y);
  } else {
    // Move logic
    if (state.turn === getPlayerRole(state)) {
      selectedUnit.x = x;
      selectedUnit.y = y;
      updateState(state);
      selectedUnit = null;
    }
  }
});

function getPlayerRole(state) {
  return state.player_1 === playerId ? 'player_1' : 'player_2';
}


