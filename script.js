import { initLobby } from './game/lobby.js';
import { supabase } from './lib/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');

  try {
    const { error } = await supabase.from('lobbies').select().limit(1);
    if (error) {
      console.error('Supabase connection failed:', error.message);
      status.textContent = 'Failed to connect to Supabase.';
    } else {
      status.textContent = 'Connected to Supabase.';
    }
  } catch (err) {
    status.textContent = 'Connection error.';
    console.error('Connection test failed:', err);
  }

  initLobby();
});
