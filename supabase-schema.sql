CREATE TABLE lobbies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  player_1 text,
  player_2 text,
  state jsonb
);

ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access"
  ON lobbies FOR ALL
  USING (true) WITH CHECK (true);

