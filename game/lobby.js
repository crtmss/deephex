import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { generateMap } from '../js/map.js';
import { setState } from '../js/game-state.js';

const supabase = createClient(
  'https://pcdveqprfopaofcjkady.supabase.co',
  'your-public-anon-key-here' // Replace with your Supabase anon key
);

const createBtn = document.getElementById('create-lobby');
const joinBtn = document.getElementById('join-lobby');
const codeInput = document.getElementById('room-code');

createBtn.addEventListener('click', async () => {
  const room_code = Math.random().toString(36).substring(2, 7).toUpperCase();
  const mapSeed = room_code; // Use room code as seed
  const initialMap = generateMap(25, 25, mapSeed);

  const initialUnits = [
    { id: 1, x: 2, y: 2, color: "blue", hp: 5, mp: 8, ap: 1 },
    { id: 2, x: 22, y: 22, color: "red", hp: 5, mp: 8, ap: 1 }
  ];

  const { data, error } = await supabase
    .from('lobbies')
    .insert([
      {
        room_code: room_code,
        player_1: true,
        player_2: false,
        seed: mapSeed,
        state: {
          turn: 'player1',
          units: initialUnits
        }
      }
    ])
    .select('id, room_code')
    .single();

  if (error) {
    console.error("Lobby creation error:", error);
    alert("Error creating lobby.");
    return;
  }

  window.location.href = `game.html?room=${data.room_code}&player=1`;
});

joinBtn.addEventListener('click', async () => {
  const room_code = codeInput.value.trim().toUpperCase();

  const { data, error } = await supabase
    .from('lobbies')
    .select('*')
    .eq('room_code', room_code)
    .single();

  if (error || !data) {
    alert("Lobby not found!");
    return;
  }

  if (data.player_2) {
    alert("Lobby is full.");
    return;
  }

  const { error: updateError } = await supabase
    .from('lobbies')
    .update({ player_2: true })
    .eq('id', data.id);

  if (updateError) {
    console.error(updateError);
    alert("Could not join lobby.");
    return;
  }

  const mapSeed = data.seed || room_code;
  const map = generateMap(25, 25, mapSeed);

  const state = data.state;

  setState({
    playerId: 2,
    roomId: data.id,
    map: map,
    currentTurn: state.turn,
    units: state.units
  });

  window.location.href = `game.html?room=${room_code}&player=2`;
});

