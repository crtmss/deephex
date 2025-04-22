// game/units.js

import { getState, setState } from './game-state.js';
import { render } from './map.js';

function endTurn() {
  const state = getState();
  const newTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';

  setState({
    ...state,
    currentTurn: newTurn,
    units: state.units.map(unit =>
      unit.owner === newTurn
        ? { ...unit, mp: 8, ap: 1 }
        : unit
    )
  });

  console.log(`Turn ended. It's now ${newTurn}'s turn.`);
  render(document.getElementById('gameCanvas'), getState().map);
}

function performAction() {
  const state = getState();
  const activeUnit = state.units.find(u => u.owner === state.playerId);
  if (!activeUnit || activeUnit.ap < 1) return;

  // Dummy action: reduce 1 HP from first enemy unit in range
  const enemy = state.units.find(u => u.owner !== state.playerId);
  if (enemy) {
    enemy.hp -= 1;
    activeUnit.ap -= 1;

    // Remove if dead
    const remainingUnits = state.units.filter(u => u.hp > 0);
    setState({ ...state, units: remainingUnits });

    console.log(`${activeUnit.id} attacked ${enemy.id}!`);
    render(document.getElementById('gameCanvas'), getState().map);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const endTurnBtn = document.getElementById('end-turn');
  if (!endTurnBtn) {
    console.warn('End Turn button not found');
    return;
  }

  endTurnBtn.addEventListener('click', () => {
    endTurn();
  });

  const actionBtn = document.getElementById('action-btn');
  if (!actionBtn) {
    console.warn('Action button not found');
    return;
  }

  actionBtn.addEventListener('click', () => {
    performAction();
  });
});

export { endTurn, performAction };
