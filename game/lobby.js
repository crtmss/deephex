// game/lobby.js

import { supabase } from '../lib/supabase.js';
import { setState, getState } from './game-state.js';
import { generateMap } from './map.js';

export let roomId = null;
export let playerId = null;

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// Create a new lobby
async function createLobby() {
  const room_code = generateRoomCode();
  const { data, error } = await supabase
    .from('lobbies')
    .insert([{ room_code, player_1: true, state: {} }])
    .select('id, room_code');

  if (error) {
    console.error('Lobby creation error:', error.message);
    alert('Failed to create lobby');
    return;
  }

  roomId = data[0].id;
  playerId = 'player1';

  // Generate and save map for both players
  const generatedMap = generateMap();
  await supabase
    .from('lobbies')
    .update({ state: { map: generatedMap, turn: 'player1' } })
    .eq('id', roomId);

  setState({
    map: generatedMap,
    playerId,
    currentTurn: 'player1',
  });

  listenToLobby(roomId);
  console.log(`Created room: ${room_code}`);
}

// Join an existing lobby
async function joinLobby(room_code) {
  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('room_code', room_code)
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Join error:', error.message);
    alert('Failed to join lobby');
    return;
  }

  roomId = data.id;
  playerId = 'player2';

  setState({
    map: data.state.map,
    playerId,
    currentTurn: data.state.turn,
  });

  listenToLobby(roomId);
  console.log(`Joined room: ${room_code}`);
}

// Listen to real-time lobby updates
function listenToLobby(roomId) {
  supabase
    .channel(`lobby-${roomId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${roomId}` },
      payload => {
        const updatedState = payload.new.state;
        setState({
          map: updatedState.map,
          currentTurn: updatedState.turn,
          units: updatedState.units || [],
        });
      }
    )
    .subscribe();
}

// Initial lobby setup
export function initLobby() {
  const createBtn = document.getElementById('create-room');
  const joinBtn = document.getElementById('join-room');
  const codeInput = document.getElementById('room-code');

  createBtn.addEventListener('click', () => createLobby());
  joinBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code) joinLobby(code);
  });
}
