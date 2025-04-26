// lib/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://pcdveqprfopaofcjkady.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZHZlcXByZm9wYW9mY2prYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDMyMDksImV4cCI6MjA2MDYxOTIwOX0.YYffphzHl9CtG6L9XpEBLgFE9WfYSq_F-RT3cg10d_k'
);

export async function pushStateToSupabase() {
  const { roomId, map, units, currentTurn } = getState();
  if (!roomId) return;

  await supabase
    .from('lobbies')
    .update({ state: { map, units, turn: currentTurn } })
    .eq('id', roomId);
}
