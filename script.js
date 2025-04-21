import { supabase } from './lib/supabase.js';
import { initLobby, createLobby, joinLobby } from './game/lobby.js';
import { endTurn } from './game/turn.js';
import { performAction } from './game/units.js';

window.createLobby = createLobby;
window.joinLobby = joinLobby;
window.endTurn = endTurn;
window.performAction = performAction;

window.addEventListener('DOMContentLoaded', () => {
  initLobby();
});
