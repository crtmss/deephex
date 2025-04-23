// File: game/units.js

import { getState, setState } from './game-state.js';
import {
  updateGameUI,
  drawMap,
  showPathCost,
  updateTurnDisplay
} from './ui.js';
import { calculatePath, calculateMovementCost } from './pathfinding.js';
import { isTileBlocked } from './terrain.js';

function performAction(unitId, targetX, targetY) {
  const state = getState();
  const unit = state.units.find(u => u.id === unitId && u.owner === state.playerId);
  if (!unit || state.currentTurn !== state.playerId || unit.ap < 1) return;

  const dx = targetX - unit.x;
  const dy = targetY - unit.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= 3 && !isTileBlocked(targetX, targetY, state.map)) {
    unit.ap -= 1;
    const targetUnit = state.units.find(u => u.x === targetX && u.y === targetY);
    if (targetUnit) {
      targetUnit.hp -= 1;
      if (targetUnit.hp <= 0) {
        state.units = state.units.filter(u => u.id !== targetUnit.id);
      }
    }
    setState(state);
    updateGameUI();
  }
}

function endTurn() {
  const state = getState();
  state.currentTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';
  state.units.forEach(unit => {
    if (unit.owner === state.currentTurn) {
      unit.mp = 8;
      unit.ap = 1;
    }
  });
  setState(state);
  updateGameUI();
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Build the in-game UI (buttons, turn display)
  createGameUI();

  // 2. Show the current turn immediately
  updateTurnDisplay(getState().currentTurn);

  // 3. Wire up End Turn button
  const endTurnBtn = document.getElementById('endTurnBtn');
  if (endTurnBtn) {
    endTurnBtn.addEventListener('click', endTurn);
  } else {
    console.warn('End Turn button not found');
  }

  // 4. Wire up Action button
  const actionBtn = document.getElementById('actionBtn');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      const state = getState();
      const unit = state.units.find(u => u.owner === state.playerId);
      if (unit) {
        // Example: attack one tile to the right
        performAction(unit.id, unit.x + 1, unit.y);
      }
    });
  } else {
    console.warn('Action button not found');
  }

  // 5. Set up path-cost preview on hover
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('mousemove', e => {
      const state = getState();
      const unit = state.units.find(u => u.owner === state.playerId);
      if (!unit || state.currentTurn !== state.playerId) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / canvas.width) * state.map[0].length);
      const y = Math.floor(((e.clientY - rect.top) / canvas.height) * state.map.length);

      const path = calculatePath(unit.x, unit.y, x, y, state.map);
      if (path) {
        const cost = calculateMovementCost(path, state.map);
        showPathCost(path, cost);
      } else {
        drawMap();
      }
    });
  }
});

export { performAction, endTurn };



