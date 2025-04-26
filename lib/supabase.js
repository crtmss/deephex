// File: lib/supabase.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getState } from '../game/game-state.js'; // ✅ MISSING IMPORT

export const supabase = createClient(
  'https://pcdveqprfopaofcjkady.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZHZlcXByZm9wYW9mY2prYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDMyMDksImV4cCI6MjA2MDYxOTIwOX0.YYffphzHl9CtG6L9XpEBLgFE9WfYSq_F-RT3cg10d_k'
);

export async function pushStateToSupabase() {
  const { roomId, map, units, currentTurn } = getState();
  if (!roomId) return;

  const { error } = await supabase
    .from('lobbies')
    .update({ state: { map, units, turn: currentTurn } })
    .eq('id', roomId);

  if (error) {
    console.error('Failed to push state to Supabase:', error.message);
  } else {
    console.log('[Supabase Sync] State pushed successfully.');
  }
}
