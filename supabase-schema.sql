create table public.lobbies (
  id uuid primary key default gen_random_uuid(),
  room_code text not null,
  player_1 text,
  player_2 text,
  state jsonb
);

-- Allow full access for dev (you can tighten later)
alter table lobbies enable row level security;

create policy "Allow all" on lobbies
  for all
  using (true);
