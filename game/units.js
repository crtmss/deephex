import { getState, setState } from './game-state.js';
import {
  updateGameUI,
  drawMap,
  showPathCost,
  updateTurnDisplay
} from './ui.js';
import { calculatePath, calculateMovementCost } from './pathfinding.js';
import { isTileBlocked } from './terrain.js';

let selectedUnitId = null;

function selectUnit(unit) {
  selectedUnitId = unit.id;
}

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
  if (state.playerId !== state.currentTurn) return; // ✅ Prevent ending out of turn

  state.currentTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';
  state.units.forEach((unit) => {
    if (unit.owner === state.currentTurn) {
      unit.mp = 8;
      unit.ap = 1;
    }
  });
  setState(state);
  updateGameUI();
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
  updateGameUI();
  setTimeout(() => animateMovement(unit, rest, callback), 150);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / canvas.width) * 25);
    const row = Math.floor(((e.clientY - rect.top) / canvas.height) * 25) - 1; // Shift grid down

    const state = getState();
    if (!state.map?.length || state.currentTurn !== state.playerId) return;

    const unit = state.units.find((u) => u.id === selectedUnitId);
    if (!unit) return;

    const path = calculatePath(unit.x, unit.y, col, row, state.map);
    const cost = calculateMovementCost(path, state.map);
    if (unit.mp >= cost) {
      unit.mp -= cost;
      animateMovement(unit, path, () => {
        setState(state);
        updateGameUI();
      });
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / canvas.width) * 25);
    const row = Math.floor(((e.clientY - rect.top) / canvas.height) * 25) - 1;

    const state = getState();
    const unit = state.units.find((u) => u.id === selectedUnitId);
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
          selectedUnitId = unit.id;
          updateGameUI();
        }
      } else {
        alert('It is not your turn.');
      }
    });
  }
});

export function getSelectedUnitId() {
  return selectedUnitId;
}

export { performAction, endTurn };


