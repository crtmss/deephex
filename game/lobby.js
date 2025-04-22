import { supabase } from '../lib/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const hostBtn = document.getElementById('host-btn');
  const connectBtn = document.getElementById('connect-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettings = document.getElementById('close-settings');

  if (!hostBtn || !connectBtn || !settingsBtn || !settingsModal) {
    console.error('Missing UI elements on the page.');
    return;
  }

  hostBtn.addEventListener('click', async () => {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const { data, error } = await supabase
      .from('lobbies')
      .insert([
        {
          room_code: roomCode,
          player_1: 'host',
          state: 'waiting',
          seed: Math.floor(Math.random() * 10000)
        }
      ])
      .select('id');

    if (error) {
      console.error('Lobby creation error:', error.message);
    } else {
      window.location.href = `game.html?room=${roomCode}&player=1`;
    }
  });

  connectBtn.addEventListener('click', () => {
    const room = prompt('Enter room code:');
    if (room) {
      window.location.href = `game.html?room=${room.toUpperCase()}&player=2`;
    }
  });

  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  closeSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });
});
