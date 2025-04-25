import { getState, setState } from './game-state.js';
import { supabase } from '../lib/supabase.js';

export async function endTurn() {
  const state = getState();
  if (state.currentTurn !== state.playerId) return;

  const nextTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';

  const updatedUnits = state.units.map(unit => {
    if (unit.owner === nextTurn) {
      return { ...unit, mp: 8, ap: 1 };
    }
    return unit;
  });

  const newState = {
    ...state,
    currentTurn: nextTurn,
    units: updatedUnits
  };

  const { error } = await supabase
    .from('lobbies')
    .update({ state: {
      map: newState.map,
      turn: newState.currentTurn,
      units: newState.units
    }})
    .eq('id', newState.roomId);

  if (!error) {
    setState(newState);
  } else {
    console.error('Failed to sync turn with Supabase:', error.message);
  }
}
