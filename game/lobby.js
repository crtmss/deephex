// game/lobby.js
import { supabase, playerId } from '../lib/supabase.js';
import { loadState, setState, getState, updateState } from './game-state.js';

export let roomId = null;

export async function initLobby() {
  const status = document.getElementById('status');
  try {
    const { data, error } = await supabase.from('lobbies').select('*').limit(1);
    status.textContent = error ? '❌ Not connected' : '✅ Connected';
  } catch {
    status.textContent = '❌ Connection failed';
  }
}

export async function createLobby() {
  const roomCode = Math.floor(Math.random() * 100000).toString().padStart(5, '0');

  const { data, error } = await supabase.from('lobbies')
    .insert([{ room_code: roomCode, player_1: playerId, state: {} }])
    .select('id, room_code, player_1, player_2, state'); // ✅ Explicit column list

  if (error) {
    console.error('Lobby creation error:', error.message);
    document.getElementById('status').textContent = `Error: ${error.message}`;
    return;
  }

  if (data) {
    roomId = data[0].id;
    document.getElementById('status').textContent = `Created room: ${roomCode}`;
    subscribeToRoom(roomId);
  }
}

export async function joinLobby() {
  const roomCode = document.getElementById('roomCode').value;
  const { data: lobbies } = await supabase.from('lobbies')
    .select('*')
    .eq('room_code', roomCode)
    .limit(1);

  if (lobbies.length === 1) {
    const lobby = lobbies[0];
    roomId = lobby.id;

    if (!lobby.player_2) {
      await supabase.from('lobbies').update({ player_2: playerId }).eq('id', roomId);
    }

    document.getElementById('status').textContent = `Joined room: ${roomCode}`;
    subscribeToRoom(roomId);
  } else {
    document.getElementById('status').textContent = `Room not found`;
  }
}

function subscribeToRoom(roomId) {
  supabase.channel('room-' + roomId)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'lobbies',
      filter: `id=eq.${roomId}`
    }, payload => {
      const newState = payload.new.state;
      setState(newState);
    })
    .subscribe();

  loadInitialState(roomId);
}

async function loadInitialState(roomId) {
  const { data } = await supabase.from('lobbies')
    .select('state, player_1, player_2')
    .eq('id', roomId)
    .single();

  if (!data.state.units) {
    const newState = {
      turn: 'player_1',
      units: [
        { id: 1, x: 2, y: 2, hp: 5, owner: 'player_1' },
        { id: 2, x: 22, y: 22, hp: 5, owner: 'player_2' }
      ]
    };
    await supabase.from('lobbies').update({ state: newState }).eq('id', roomId);
    setState(newState);
  } else {
    setState(data.state);
  }
}
