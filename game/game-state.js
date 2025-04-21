import { map, render } from './map.js';
import { supabase, playerId } from '../lib/supabase.js';
import { units } from './units.js';

let currentLobbyId = null;

let gameState = {};


export function setState(newState) {
  gameState = newState;
  render(gameState); // ✅ Re-render after state updates
}

export function getState() {
  return gameState;
}

export async function updateState(newState) {
  gameState = newState;
  await supabase.from('lobbies').update({ state: gameState }).eq('id', roomId);
  render(gameState); // ✅ Also re-render after local change
}

export async function loadState() {
  const { data } = await supabase.from('lobbies').select('*').eq('id', roomId).single();
  if (data && data.state) {
    setState(data.state);
  }
}

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

