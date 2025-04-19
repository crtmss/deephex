import { saveGameState } from './game-state.js';

let currentTurn = 'player_1';

export function endTurn() {
  const state = getState();
  state.turn = state.turn === 'player_1' ? 'player_2' : 'player_1';
  await updateState(state)
}
