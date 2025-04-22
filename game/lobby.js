// game/lobby.js

import { supabase } from '../lib/supabase.js';
import { setState } from './game-state.js';
import { generateMap } from './map.js';

let roomId = null;
let playerId = null;

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createLobby() {
  const room_code = generateRoomCode();
  const initialMap = generateMap(25, 25, room_code);

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

  // ✅ Redirect to game screen
  window.location.href = `game.html?room=${room_code}`;
}

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

  // ✅ Redirect to game screen
  window.location.href = `game.html?room=${room_code}`;
}

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

function initLobby() {
  const createBtn = document.getElementById('create-room');
  const joinBtn = document.getElementById('join-room');
  const codeInput = document.getElementById('room-code');

  if (createBtn && joinBtn && codeInput) {
    createBtn.addEventListener('click', () => {
      createLobby();
    });

    joinBtn.addEventListener('click', () => {
      const code = codeInput.value.trim();
      if (code) {
        joinLobby(code);
      }
    });
  } else {
    console.warn('Lobby UI elements not found. This is expected if not on index.html.');
  }
} // ✅ ← MISSING BRACE FIXED HERE

export {
  createLobby,
  joinLobby,
  initLobby,
  roomId,
  playerId
};


