// File: game/units.js

import { getState, setState } from './game-state.js';
import { updateGameUI, showPathCost, drawMap } from './ui.js';
import { calculatePath, calculateMovementCost } from './pathfinding.js';
import { pushStateToSupabase } from '../lib/supabase.js';

let movementLock = false;

function performAction(unitId, targetX, targetY) {
  // Attack logic (unchanged)
}

function endTurn() {
  const state = getState();
  state.currentTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';
  state.units.forEach((unit) => {
    if (unit.owner === state.currentTurn) {
      unit.mp = 8;
      unit.ap = 1;
    }
  });
  setState(state);
  pushStateToSupabase();
  updateGameUI();
}

function animateMovement(unit, path, callback) {
  if (path.length === 0) {
    callback();
    return;
  }
  movementLock = true;
  const [nextStep, ...rest] = path;
  unit.x = nextStep.x;
  unit.y = nextStep.y;
  setState(getState());
  updateGameUI();
  setTimeout(() => animateMovement(unit, rest, callback), 100); // 100ms
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  canvas.addEventListener('click', async (e) => {
    if (movementLock) return; // prevent clicks while animating

    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / canvas.width) * 25);
    const row = Math.floor(((e.clientY - rect.top) / canvas.height) * 25);

    const state = getState();
    const selectedUnitId = state.selectedUnitId;
    const selectedUnit = state.units.find(u => u.id === selectedUnitId);

    if (selectedUnit && state.currentTurn === state.playerId) {
      const path = calculatePath(selectedUnit.x, selectedUnit.y, col, row, state.map);
      const cost = calculateMovementCost(path, state.map);

      if (path.length > 1 && selectedUnit.mp >= cost) {
        selectedUnit.mp -= cost;
        animateMovement(selectedUnit, path.slice(1), async () => {
          await pushStateToSupabase();
          movementLock = false;
          updateGameUI();
        });
      } else {
        console.warn('Not enough MP to move or invalid path.');
      }
    } else {
      const clickedUnit = state.units.find((u) => u.x === col && u.y === row && u.owner === state.playerId);
      if (clickedUnit) {
        setState({
          ...state,
          selectedUnitId: clickedUnit.id
        });
        updateGameUI();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / canvas.width) * 25);
    const row = Math.floor(((e.clientY - rect.top) / canvas.height) * 25);

    const state = getState();
    const unit = state.units.find((u) => u.id === state.selectedUnitId);
    if (!unit || state.currentTurn !== state.playerId || movementLock) return;

    const path = calculatePath(unit.x, unit.y, col, row, state.map);
    if (path.length > 1) {
      const cost = calculateMovementCost(path, state.map);
      showPathCost(path, cost);
    } else {
      drawMap();
    }
  });

  const selectBtn = document.getElementById('selectUnitBtn');
  if (selectBtn) {
    selectBtn.addEventListener('click', () => {
      const state = getState();
      if (state.currentTurn === state.playerId) {
        const unit = state.units.find((u) => u.owner === state.playerId);
        if (unit) {
          setState({
            ...state,
            selectedUnitId: unit.id
          });
          updateGameUI();
        }
      } else {
        alert('It is not your turn.');
      }
    });
  }
});

export { performAction, endTurn };

