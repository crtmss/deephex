// lib/supabase.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getState } from '../game/game-state.js';

export const supabase = createClient(
  'https://pcdveqprfopaofcjkady.supabase.co',
  'YOUR-ANON-KEY-HERE'  // 🔵 Replace with real key
);

// Push only UNITS to Supabase
export async function pushUnitsUpdate() {
  const { roomId, units } = getState();
  if (!roomId) return;
  await supabase
    .from('lobbies')
    .update({ units })
    .eq('id', roomId);
}

// Push only TURN to Supabase
export async function pushTurnUpdate() {
  const { roomId, currentTurn } = getState();
  if (!roomId) return;
  await supabase
    .from('lobbies')
    .update({ turn: currentTurn })
    .eq('id', roomId);
}

// Push full MAP (optional, rarely needed)
export async function pushMapUpdate() {
  const { roomId, map } = getState();
  if (!roomId) return;
  await supabase
    .from('lobbies')
    .update({ map })
    .eq('id', roomId);
}
