import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { generateMap } from '../game/map.js';
import { setState } from '../game/game-state.js';

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

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-button");
  const hostBtn = document.getElementById("host-button");
  const joinBtn = document.getElementById("join-button");

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.style.opacity = 0.5;
    startBtn.title = "Coming soon!";
  }

  if (hostBtn) {
    hostBtn.addEventListener("click", async () => {
      const roomCode = generateRoomCode();
      const seed = Math.floor(Math.random() * 1000000);
      const { data, error } = await supabase
        .from("lobbies")
        .insert([
          {
            room_code: roomCode,
            player_1: "host",
            seed,
            state: "waiting"
          }
        ])
        .select("id, room_code");

      if (error) {
        console.error("Lobby creation error:", error.message);
        alert("Failed to create lobby. Check console.");
        return;
      }

      window.location.href = `game.html?room=${roomCode}&player=1`;
    });
  }

  if (joinBtn) {
    joinBtn.addEventListener("click", () => {
      const roomCode = prompt("Enter room code:");
      if (!roomCode) return;

      window.location.href = `game.html?room=${roomCode}&player=2`;
    });
  }

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
});
