import { getState, setState } from './game-state.js';
import {
  updateGameUI,
  setHoveredHex,
  drawDebugInfo,
  setCurrentPath
} from './ui.js';
import { calculatePath } from './pathfinding.js';
import { isTileBlocked } from './terrain.js';
import { pushStateToSupabase } from '../lib/supabase.js';

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
    pushStateToSupabase();
    updateGameUI();
  }
}

function endTurn() {
  const state = getState();
  state.currentTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';
  state.units.forEach(unit => {
    if (unit.owner === state.currentTurn) {
      unit.mp = 10;
      unit.ap = 1;
    }
  });
  state.selectedHex = null;
  setCurrentPath([]);
  setState(state);
  pushStateToSupabase();
  updateGameUI();
}

function getHexAtMouse(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const size = 16;
  const SQRT3 = Math.sqrt(3);
  const offsetX = canvas.width / 2 - ((25 * size * SQRT3) / 2);
  const offsetY = canvas.height / 2 - ((25 * size * 1.5) / 2);
  const adjustedX = x - offsetX;
  const adjustedY = y - offsetY;

  const row = Math.round(adjustedY / (size * 1.5));
  const col = Math.round((adjustedX / (size * SQRT3)) - 0.5 * (row % 2));

  return { col, row };
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  canvas.addEventListener('click', (e) => {
    const { col, row } = getHexAtMouse(e, canvas);
    const state = getState();
    if (!state.map?.[row]?.[col]) return;

    const selectedUnit = state.units.find(u => u.id === state.selectedUnitId);
    if (selectedUnit && state.currentTurn === state.playerId) {
      state.selectedHex = { col, row };
      console.log(`✅ Hex selected at (${col}, ${row})`);
      setHoveredHex(null);
      setState(state);

      const path = calculatePath(selectedUnit.x, selectedUnit.y, col, row, state.map);
      setCurrentPath(path || []);
      updateGameUI();
    } else {
      const clickedUnit = state.units.find(u => u.x === col && u.y === row && u.owner === state.playerId);
      if (clickedUnit) {
        setState({ ...state, selectedUnitId: clickedUnit.id });
        updateGameUI();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const { col, row } = getHexAtMouse(e, canvas);
    const state = getState();
    if (!state.map?.[row]?.[col]) return;

    if (!state.selectedHex) {
      setHoveredHex(col, row);
    }

    if (state.debugEnabled) {
      drawDebugInfo(col, row);
    }
  });

  document.getElementById('selectUnitBtn')?.addEventListener('click', () => {
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

  document.getElementById('moveToHexBtn')?.addEventListener('click', () => {
    const state = getState();
    const target = state.selectedHex;
    if (!target) {
      console.warn('❌ No hex selected.');
      return;
    }

    const unit = state.units.find(u => u.id === state.selectedUnitId && u.owner === state.playerId);
    if (!unit) {
      console.warn('❌ No selected unit.');
      return;
    }

    const path = calculatePath(unit.x, unit.y, target.col, target.row, state.map);
    if (!path || path.length < 2) {
      console.warn('⚠️ No path or already at destination.');
      return;
    }

    const nextStep = path[1];
    console.log(`➡️ Moving unit one step to (${nextStep.x},${nextStep.y})`);

    unit.x = nextStep.x;
    unit.y = nextStep.y;
    setCurrentPath([]); // Clear path after move
    setState(state);
    pushStateToSupabase();
    updateGameUI();
  });
});

export { performAction, endTurn };
