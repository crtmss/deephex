// script.js
import { initLobby, createLobby, joinLobby } from './game/lobby.js';
import { endTurn } from './game/turn.js';
import { performAction } from './game/units.js';
import { supabase } from './lib/supabase.js';
import { updateTurnDisplay } from './game/ui.js';

window.createLobby = createLobby;
window.joinLobby = joinLobby;
window.endTurn = endTurn;
window.performAction = performAction;

document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');

  try {
    const { error } = await supabase.from('lobbies').select().limit(1);
    if (error) {
      console.error('Supabase connection failed:', error.message);
      if (status) {
        status.textContent = '❌ Failed to connect to Supabase.';
        status.className = 'status-disconnected';
      }
    } else {
      if (status) {
        status.textContent = '✅ Connected to Supabase.';
        status.className = 'status-connected';
      }
    }
  } catch (err) {
    if (status) {
      status.textContent = '❌ Connection error.';
      status.className = 'status-disconnected';
    }
    console.error('Connection test failed:', err);
  }

  initLobby(); // Initialize buttons
});

