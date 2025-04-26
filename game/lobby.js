// File: game/lobby.js

import { supabase } from '../lib/supabase.js';
import { setState, getState } from './game-state.js';
import { generateMap } from './map.js';
import { updateGameUI } from './ui.js';

let roomId = null;
let playerId = null;

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createLobby() {
  const room_code = generateRoomCode();
  const initialMap = generateMap(25, 25, room_code);

  const initialUnits = [
    { id: 'p1unit', owner: 'player1', x: 2, y: 2, hp: 5, mp: 8, ap: 1 }
  ];

  const { data, error } = await supabase
    .from('lobbies')
    .insert([{
      room_code,
      player_1: true,
      player_2: false,
      state: {
        map: initialMap,
        units: initialUnits,
        turn: 'player1'
      }
    }])
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
    units: initialUnits,
    currentTurn: 'player1',
    player2Seen: false
  });

  listenToLobby(roomId);
  console.log(`Lobby created with code: ${room_code}`);
  const codeDisplay = document.getElementById('lobby-code');
  if (codeDisplay) codeDisplay.textContent = `Room Code: ${room_code}`;

  window.location.href = `https://crtmss.github.io/deephex/game.html?room=${room_code}&player=1`;
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

  const state = {
    map: data.state.map,       // ✅ FIXED (use data.state)
    units: data.state.units,
    turn: data.state.turn
  };

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
    .update({ state: { map: state.map, units: state.units, turn: state.turn } })
    .eq('id', data.id);

  setState({
    playerId,
    roomId: data.id,
    map: state.map,
    units: state.units,
    currentTurn: state.turn,
    player2Seen: true
  });

  listenToLobby(data.id);
  console.log(`Joined lobby with code: ${room_code}`);
  window.location.href = `game.html?room=${room_code}&player=2`;
}

function listenToLobby(roomId) {
  const channel = supabase.channel(`lobby-${roomId}`);

  channel.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'lobbies',
    filter: `id=eq.${roomId}`
  }, (payload) => {
    const current = getState();
    const newState = payload.new.state;

    let updated = false;

    // 🔵 Units sync
    if (newState.units && JSON.stringify(current.units) !== JSON.stringify(newState.units)) {
      console.log('[Realtime] Units updated.');
      setState({ ...current, units: newState.units });
      updated = true;
    }

    // 🟠 Turn sync
    if (newState.turn && current.currentTurn !== newState.turn) {
      console.log('[Realtime] Turn changed.');
      setState({ ...getState(), currentTurn: newState.turn });
      updated = true;
    }

    if (updated) {
      updateGameUI();
    }
  });

  channel.subscribe();
}

function initLobby() {
  const createBtn = document.getElementById('create-room');
  const joinBtn = document.getElementById('join-room');
  const codeInput = document.getElementById('room-code');

  if (createBtn && joinBtn && codeInput) {
    createBtn.addEventListener('click', () => createLobby());
    joinBtn.addEventListener('click', () => {
      const code = codeInput.value.trim();
      if (code) joinLobby(code);
    });
  }
}

export {
  createLobby,
  joinLobby,
  initLobby,
  roomId,
  playerId
};















