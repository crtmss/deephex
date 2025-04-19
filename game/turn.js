let currentTurn = 'player_1';

export function endTurn() {
  currentTurn = currentTurn === 'player_1' ? 'player_2' : 'player_1';
  document.getElementById('turnInfo').textContent = `Turn: ${currentTurn}`;
}

