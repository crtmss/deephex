import { getState, updateState } from './game-state.js';

export async function endTurn() {
  const state = getState();

  // Toggle the turn between player_1 and player_2
  state.turn = state.turn === 'player_1' ? 'player_2' : 'player_1';

  await updateState(state);
}
