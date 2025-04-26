// File: lib/supabase.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getState } from '../game/game-state.js';

// ✅ Supabase project setup
export const supabase = createClient(
  'https://pcdveqprfopaofcjkady.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZHZlcXByZm9wYW9mY2prYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDMyMDksImV4cCI6MjA2MDYxOTIwOX0.YYffphzHl9CtG6L9XpEBLgFE9WfYSq_F-RT3cg10d_k'
);

// ✅ Push full local game state to Supabase
export async function pushStateToSupabase() {
  const { roomId, map, units, currentTurn } = getState();
  
  if (!roomId) {
    console.warn('[Supabase] No room ID, skipping push.');
    return;
  }

  try {
    const { error } = await supabase
      .from('lobbies')
      .update({
        map,
        units,
        turn: currentTurn
      })
      .eq('id', roomId);

    if (error) {
      console.error('[Supabase] Error pushing state:', error.message);
    } else {
      console.log('[Supabase] Game state successfully pushed.');
    }
  } catch (err) {
    console.error('[Supabase] Exception pushing state:', err.message);
  }
}
