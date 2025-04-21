// game/lobby.js

import { supabase } from '../lib/supabase.js';
import { setState, getState } from './game-state.js';
import { generateMap } from './map.js';

let roomId = null;
let playerId = null;

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric code
}

// Create a new lobby and set player 1
async function createLobby() {
  const room_code = generateRoomCode();
  const initialMap = generateMap();

  const initialUnits = [
    {
      id: 'p1unit',
      owner: 'player1',
      x: 2,
      y: 2,
      hp: 5,
      mp: 8,
      ap: 1
    }
  ];

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
          units: initialUnits
        }
      }
    ])
    .select('id, room_code');

  if (error) {
    console.error('Lobby creation error:', error.message);
    alert('Failed to create lobby.');
    return;
  }

  roomId = data[0].id;
  playerId = 'player1';

  setState({
    playerId,
    roomId,
    map: initialMap,
    currentTurn: 'player1',
    units: initialUnits
  });

  listenToLobby(roomId);
  console.log(`Lobby created with code: ${room_code}`);
}

// Join an existing lobby and set player 2
async function joinLobby(room_code) {
  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('room_code', room_code)
    .single();

  if (error || !data) {
    console.error('Lobby join error:', error.message);
    alert('Failed to join lobby.');
    return;
  }

  // Add player 2
  await supabase
    .from('lobbies')
    .update({ player_2: true })
    .eq('id', data.id);

  roomId = data.id;
  playerId = 'player2';

  const state = data.state;
  const newUnit = {
    id: 'p2unit',
    owner: 'player2',
    x: 22,
    y: 22,
    hp: 5,
    mp: 8,
    ap: 1
  };

  state.units.push(newUnit);

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
  console.log(`Joined lobby with code: ${room_code}`);
}

// Listen for realtime updates
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

// Setup lobby UI interactions
function initLobby() {
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

export {
  createLobby,
  joinLobby,
  initLobby,
  roomId,
  playerId
};
