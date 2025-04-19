import { supabase } from '../lib/supabase.js';
import { map } from './map.js';
import { units } from './units.js';
import { playerId } from './lobby.js';

let currentLobbyId = null;

export async function startGameSync(lobbyId) {
  currentLobbyId = lobbyId;

  // Subscribe to changes
  supabase
    .channel(`room-${lobbyId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      (payload) => {
        const newState = payload.new.state;
        if (newState && newState.lastEditedBy !== playerId) {
          loadGameState(newState);
        }
      }
    )
    .subscribe();
}

export function saveGameState() {
  const state = {
    map,
    units,
    lastEditedBy: playerId
  };

  if (!currentLobbyId) return;

  supabase
    .from('lobbies')
    .update({ state })
    .eq('id', currentLobbyId)
    .then(({ error }) => {
      if (error) console.error('Error saving game state:', error.message);
    });
}

function loadGameState(state) {
  // Overwrite current game state
  Object.assign(map, state.map);
  Object.assign(units, state.units);
  // You would re-render the map here as needed
  console.log('✅ Game state synced from server');
}

