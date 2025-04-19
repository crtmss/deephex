import { supabase } from '../lib/supabase.js';

export let playerId = crypto.randomUUID();

export async function initLobby() {
  const status = document.getElementById('status');
  try {
    const { data, error } = await supabase.from('lobbies').select('*').limit(1);
    status.textContent = error ? '❌ Not connected' : '✅ Connected';
  } catch (err) {
    status.textContent = '❌ Connection failed';
  }
}

export async function createLobby() {
  const roomCode = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  await supabase.from('lobbies').insert([{ room_code: roomCode, player_1: playerId }]);
  document.getElementById('status').textContent = `Created room: ${roomCode}`;
}

export async function joinLobby() {
  const roomCode = document.getElementById('roomCode').value;
  const { data: lobbies } = await supabase.from('lobbies').select('*').eq('room_code', roomCode);
  if (lobbies.length === 1) {
    const lobby = lobbies[0];
    await supabase.from('lobbies').update({ player_2: playerId }).eq('id', lobby.id);
    document.getElementById('status').textContent = `Joined room: ${roomCode}`;
  }
}

