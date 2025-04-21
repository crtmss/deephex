// game/lobby.js

import { generateMap } from './map.js';
import { supabase } from './supabase.js';
import { setState } from './game-state.js';

export let playerId = null;
export let roomCode = null;

export async function createLobby(code) {
  roomCode = code;
  playerId = 1;

  // Generate a consistent map using the room code as a seed
  const map = generateMap(25, 25, roomCode);

  const { data, error } = await supabase.from('lobbies').insert([
    {
      room_code: roomCode,
      player_1: true,
      state: JSON.stringify({ map }),
    },
  ]);

  if (error) {
    console.error('Lobby creation error:', error.message);
    return;
  }

  console.log('Lobby created:', data);
  await loadInitialState();
}

export async function joinLobby(code) {
  roomCode = code;
  playerId = 2;

  const { data: lobbies, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('room_code', roomCode);

  if (error || !lobbies || lobbies.length === 0) {
    console.error('Join lobby error:', error?.message || 'Room not found');
    return;
  }

  const lobby = lobbies[0];

  if (lobby.player_2) {
    console.warn('Room already has two players.');
    return;
  }

  const { error: updateError } = await supabase
    .from('lobbies')
    .update({ player_2: true })
    .eq('room_code', roomCode);

  if (updateError) {
    console.error('Player 2 join error:', updateError.message);
    return;
  }

  console.log('Joined lobby as Player 2');
  await loadInitialState();
}

export async function loadInitialState() {
  const { data: lobbies, error } = await supabase
    .from('lobbies')
    .select('state')
    .eq('room_code', roomCode);

  if (error || !lobbies || lobbies.length === 0) {
    console.error('State load error:', error?.message || 'Room not found');
    return;
  }

  const lobby = lobbies[0];
  const state = JSON.parse(lobby.state);

  setState(state);
}
