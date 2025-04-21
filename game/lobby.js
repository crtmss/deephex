// game/lobby.js

import { supabase } from '../lib/supabase.js';
import { setState, getState } from './game-state.js';
import { generateMap } from './map.js';

export let roomId = null;
export let playerId = null;

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric room code
}

// Create a new lobby and host player
async function createLobby() {
  const room_code = generateRoomCode();
  const initialMap = generateMap();

  const { data, error } = await supabase
    .from('lobbies')
    .insert([
      {
        room_code,
        player_1: true,
        player_2: false,
        state: {
          map: initialMap,
          turn: 'player1',
          units: [
            { id: 'p1unit', owner: 'player1', x: 2, y: 2, hp: 5, mp: 8, ap: 1 }
          ]
        }
      }
    ])
    .select('id, room_code');

  if (error) {
    console.error('Lobby creation error:', error.message);
    alert('Failed to create lobby');
    return;
  }

  roomId = data[0].id;
  playerId = 'player1';

  setState({
    playerId,
    roomId,
    map: initialMap,
    currentTurn: 'player1',
    units: [
      { id: 'p1unit', owner: 'player1', x: 2, y: 2, hp: 5, mp: 8, ap: 1 }
    ]
  });

  listenToLobby(roomId);
  console.log(`Created room ${room_code}`);
}

// Join an existing lobby as player 2
async function joinLobby(room_code) {
  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('room_code', room_code)
    .single();

  if (error || !data) {
    console.error('Lobby join error:', error.message);
    alert('Failed to join lobby');
    return;
  }

  // Update player_2 to true
  await supabase
    .from('lobbies')
    .update({ player_2: true })
    .eq('id', data.id);

  roomId = data.id;
  playerId = 'player2';

  const state = data.state;
  state.units.push({
    id: 'p2unit',
    owner: 'player2',
    x: 22,
    y: 22,
    hp: 5,
    mp: 8,
    ap: 1
  });

  await supabase
    .from('lobbies')
    .update({ state })
    .eq('id', data.id);

  setState({
    playerId,
    roomId: data.id,
    map: state.map,
    currentTurn: state.turn,
    units: state.units
  });

  listenToLobby(data.id);
  console.log(`Joined room ${room_code}`);
}

// Realtime lobby updates
function listenToLobby(roomId) {
  supabase
    .channel(`lobby-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'lobbies',
        filter: `id=eq.${roomId}`
      },
      (payload) => {
        const newState = payload.new.state;
        setState({
          map: newState.map,
          currentTurn: newState.turn,
          units: newState.units
        });
      }
    )
    .subscribe();
}

// Initializes event listeners on the lobby UI
export function initLobby() {
  const createBtn = document.getElementById('create-room');
  const joinBtn = document.getElementById('join-room');
  const codeInput = document.getElementById('room-code');

  createBtn.addEventListener('click', () => {
    createLobby();
  });

  joinBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code) {
      joinLobby(code);
    }
  });
}

// ✅ Export everything needed
export {
  createLobby,
  joinLobby,
  roomId,
  playerId
};
