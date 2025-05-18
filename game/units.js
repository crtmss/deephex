// File: game/units.js

import { getState, setState } from './game-state.js';
import {
  updateGameUI,
  setHoveredHex,
  drawDebugInfo
} from './ui.js';
import { calculatePath } from './pathfinding.js';
import { isTileBlocked } from './terrain.js';
import { pushStateToSupabase } from '../lib/supabase.js';

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

  const r = Math.round(adjustedY / (size * 1.5));
  const q = Math.round((adjustedX / (SQRT3 * size)) - 0.5 * (r % 2));

  return { q, r };
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  canvas.addEventListener('click', (e) => {
    const { q, r } = getHexAtMouse(e, canvas);
    const state = getState();
    if (!state.map?.[r]?.[q]) return;

    const selectedUnit = state.units.find(u => u.id === state.selectedUnitId);

    if (selectedUnit && state.currentTurn === state.playerId) {
      const path = calculatePath(selectedUnit.q, selectedUnit.r, q, r, state.map);
      console.log('📡 Calculated path:', path);
      setHoveredHex(null);
      setState({
        ...state,
        selectedHex: { q, r },
        currentPath: path || []
      });
      updateGameUI();
    } else {
      const clickedUnit = state.units.find(u => u.q === q && u.r === r && u.owner === state.playerId);
      if (clickedUnit) {
        setState({ ...state, selectedUnitId: clickedUnit.id });
        updateGameUI();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const { q, r } = getHexAtMouse(e, canvas);
    const state = getState();
    if (!state.map?.[r]?.[q]) return;

    if (!state.selectedHex) {
      setHoveredHex(q, r);
    }

    if (state.debugEnabled) drawDebugInfo(q, r);
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
    if (!target) return;

    const unit = state.units.find(u => u.id === state.selectedUnitId && u.owner === state.playerId);
    if (!unit) return;

    const path = calculatePath(unit.q, unit.r, target.q, target.r, state.map);
    if (!path || path.length < 2) return;

    const next = path[1];
    unit.q = next.q;
    unit.r = next.r;

    setState({
      ...state,
      currentPath: []
    });
    pushStateToSupabase();
    updateGameUI();
  });
});

export function performAction(unitId, targetQ, targetR) {
  const state = getState();
  const unit = state.units.find(u => u.id === unitId && u.owner === state.playerId);
  if (!unit || state.currentTurn !== state.playerId || unit.ap < 1) return;

  const dq = targetQ - unit.q;
  const dr = targetR - unit.r;
  const dz = -dq - dr;
  const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dz));

  if (distance <= 3 && !isTileBlocked(targetQ, targetR, state.map)) {
    unit.ap -= 1;
    const targetUnit = state.units.find(u => u.q === targetQ && u.r === targetR);
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

export function endTurn() {
  const state = getState();
  state.currentTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';
  state.units.forEach(unit => {
    if (unit.owner === state.currentTurn) {
      unit.mp = 10;
      unit.ap = 1;
    }
  });
  setState({
    ...state,
    selectedHex: null,
    currentPath: []
  });
  pushStateToSupabase();
  updateGameUI();
}
