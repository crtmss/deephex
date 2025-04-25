// game/units.js

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
  }
}

function endTurn() {
  const state = getState();
  if (state.currentTurn !== state.playerId) return;
  state.currentTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';
  state.units.forEach((unit) => {
    if (unit.owner === state.currentTurn) {
      unit.mp = 8;
      unit.ap = 1;
    }
  });
  setState(state);
}

function animateMovement(unit, path, callback) {
  if (path.length === 0) {
    callback();
    return;
  }
  const [nextStep, ...rest] = path;
  unit.x = nextStep.x;
  unit.y = nextStep.y;
  setState(getState());
  setTimeout(() => animateMovement(unit, rest, callback), 150);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / canvas.width) * 25);
    const row = Math.floor(((e.clientY - rect.top) / canvas.height) * 25);

    const state = getState();
    const clickedUnit = state.units.find((u) => u.x === col && u.y === row && u.owner === state.playerId);
    if (clickedUnit) {
      setState({ ...state, selectedUnitId: clickedUnit.id });
    } else if (state.selectedUnitId) {
      const unit = state.units.find((u) => u.id === state.selectedUnitId);
      const path = calculatePath(unit.x, unit.y, col, row, state.map);
      const cost = calculateMovementCost(path, state.map);
      if (unit.mp >= cost) {
        unit.mp -= cost;
        animateMovement(unit, path, () => {
          setState(state);
        });
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / canvas.width) * 25);
    const row = Math.floor(((e.clientY - rect.top) / canvas.height) * 25);

    const state = getState();
    const unit = state.units.find((u) => u.id === state.selectedUnitId);
    if (!unit || state.currentTurn !== state.playerId) return;

    const path = calculatePath(unit.x, unit.y, col, row, state.map);
    if (path) {
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
          setState({ ...state, selectedUnitId: unit.id });
        }
      } else {
        alert('It is not your turn.');
      }
    });
  }
});


