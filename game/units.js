// File: game/units.js

import { getState, setState } from './game-state.js';
import { updateGameUI, drawMap } from './ui.js';
import { calculatePath, calculateMovementCost } from './pathfinding.js';
import { isTileBlocked } from './terrain.js';

let selectedUnitId = null;

function performAction(unitId, targetX, targetY) {
  const state = getState();
  const unit = state.units.find((u) => u.id === unitId && u.owner === state.playerId);
  if (!unit || state.currentTurn !== state.playerId || unit.ap < 1) return;

  const dx = targetX - unit.x;
  const dy = targetY - unit.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= 3 && !isTileBlocked(targetX, targetY)) {
    unit.ap -= 1;
    const targetUnit = state.units.find((u) => u.x === targetX && u.y === targetY);
    if (targetUnit) {
      targetUnit.hp -= 1;
      if (targetUnit.hp <= 0) {
        state.units = state.units.filter((u) => u.id !== targetUnit.id);
      }
    }
    setState(state);
    updateGameUI();
  }
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
  state.selectedUnit = null;
  setState(state);
  updateGameUI();
}

function moveUnitStepByStep(unit, path, index = 0) {
  if (index >= path.length || unit.mp <= 0) return;

  const next = path[index];
  unit.x = next.x;
  unit.y = next.y;
  unit.mp -= 1;

  setState(getState());
  updateGameUI();

  setTimeout(() => moveUnitStepByStep(unit, path, index + 1), 200);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  canvas.addEventListener('click', (e) => {
    const state = getState();
    if (state.currentTurn !== state.playerId) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / canvas.width) * state.map[0].length);
    const y = Math.floor(((e.clientY - rect.top) / canvas.height) * state.map.length);

    const clickedUnit = state.units.find(u => u.x === x && u.y === y && u.owner === state.playerId);
    if (clickedUnit) {
      selectedUnitId = clickedUnit.id;
      state.selectedUnit = clickedUnit.id;
      setState(state);
      updateGameUI();
    } else if (selectedUnitId) {
      const unit = state.units.find(u => u.id === selectedUnitId);
      const path = calculatePath(unit.x, unit.y, x, y, state.map);
      if (path && calculateMovementCost(path, state.map) <= unit.mp) {
        moveUnitStepByStep(unit, path);
      }
    }
  });

  const endTurnBtn = document.getElementById('endTurnBtn');
  if (endTurnBtn) {
    endTurnBtn.addEventListener('click', endTurn);
  }

  const actionBtn = document.getElementById('actionBtn');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      const state = getState();
      const unit = state.units.find(u => u.id === selectedUnitId);
      if (unit) {
        performAction(unit.id, unit.x + 1, unit.y);
      }
    });
  }
});

export { performAction, endTurn };




