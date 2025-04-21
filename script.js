import { supabase } from './lib/supabase.js';
import { initLobby, createLobby, joinLobby } from './game/lobby.js';
import { endTurn } from './game/turn.js';
import { performAction } from './game/units.js';

// Attach functions to window for inline HTML event handlers
window.createLobby = createLobby;
window.joinLobby = joinLobby;
window.endTurn = endTurn;
window.performAction = performAction;

// Call initLobby after the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  initLobby();
});
