INSERT INTO movies (title, duration_minutes, rating, status) VALUES
  ('Avengers: Endgame', 181, 'T13', 'NOW_SHOWING'),
  ('Interstellar',      169, 'T13', 'COMING_SOON');

INSERT INTO showtimes (movie_id, theater_name, room_name, start_time, price) VALUES
  (1, 'CGV Vincom',     'Room 05', '2026-04-18 09:30:00', 95000),
  (1, 'Lotte NowZone',  'Hall 02', '2026-04-18 13:30:00', 110000),
  (2, 'CGV Landmark',   'Room 08', '2026-04-19 10:30:00', 120000);
