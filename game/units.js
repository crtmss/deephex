import { getState, setState } from './game-state.js';
import { updateGameUI, showPathCost, drawMap } from './ui.js';
import { calculatePath, calculateMovementCost } from './pathfinding.js';
import { pushStateToSupabase } from '../lib/supabase.js';

function performAction(unitId, targetX, targetY) {
  // Same as before
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
  const [nextStep, ...rest] = path;
  unit.x = nextStep.x;
  unit.y = nextStep.y;
  setState(getState());
  updateGameUI();
  setTimeout(() => animateMovement(unit, rest, callback), 120);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  canvas.addEventListener('click', (e) => {
    const { x, y } = getMouseHex(e, canvas);

    const state = getState();
    const selectedUnitId = state.selectedUnitId;
    const selectedUnit = state.units.find(u => u.id === selectedUnitId);

    if (selectedUnit && state.currentTurn === state.playerId) {
      const path = calculatePath(selectedUnit.x, selectedUnit.y, x, y, state.map);
      const cost = calculateMovementCost(path, state.map);

      if (path.length > 0 && selectedUnit.mp >= cost) {
        selectedUnit.mp -= cost;
        animateMovement(selectedUnit, path, async () => {
          await pushStateToSupabase();
          updateGameUI();
        });
      }
    } else {
      const clickedUnit = state.units.find((u) => u.x === x && u.y === y && u.owner === state.playerId);
      if (clickedUnit) {
        setState({ ...state, selectedUnitId: clickedUnit.id });
        updateGameUI();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getMouseHex(e, canvas);
    const state = getState();
    const unit = state.units.find(u => u.id === state.selectedUnitId);
    if (!unit || state.currentTurn !== state.playerId) return;

    const path = calculatePath(unit.x, unit.y, x, y, state.map);
    if (path && path.length > 0) {
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
        const unit = state.units.find(u => u.owner === state.playerId);
        if (unit) {
          setState({ ...state, selectedUnitId: unit.id });
          updateGameUI();
        }
      } else {
        alert('It is not your turn.');
      }
    });
  }
});

function getMouseHex(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = canvas.width;
  const height = canvas.height;
  const size = 16;
  const SQRT3 = Math.sqrt(3);

  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  const offsetX = width / 2 - ((25 * size * SQRT3) / 2);
  const offsetY = height / 2 - ((25 * size * 1.5) / 2);

  const x = (px - offsetX) / (SQRT3 * size);
  const y = (py - offsetY) / (1.5 * size);

  const col = Math.round(x - 0.5 * (Math.round(y) & 1));
  const row = Math.round(y);

  return { x: col, y: row };
}

export { performAction, endTurn };


