-- Showtime 1 (id=1 maps to movie_service's showtime_id=1): 20 seats, rows A and B
INSERT INTO seats (showtime_id, seat_row, number, status) VALUES
  (1, 'A', 1,  'AVAILABLE'), (1, 'A', 2,  'AVAILABLE'), (1, 'A', 3,  'AVAILABLE'),
  (1, 'A', 4,  'AVAILABLE'), (1, 'A', 5,  'AVAILABLE'), (1, 'A', 6,  'AVAILABLE'),
  (1, 'A', 7,  'AVAILABLE'), (1, 'A', 8,  'AVAILABLE'), (1, 'A', 9,  'AVAILABLE'),
  (1, 'A', 10, 'AVAILABLE'),
  (1, 'B', 1,  'AVAILABLE'), (1, 'B', 2,  'AVAILABLE'), (1, 'B', 3,  'AVAILABLE'),
  (1, 'B', 4,  'AVAILABLE'), (1, 'B', 5,  'AVAILABLE'), (1, 'B', 6,  'AVAILABLE'),
  (1, 'B', 7,  'AVAILABLE'), (1, 'B', 8,  'AVAILABLE'), (1, 'B', 9,  'AVAILABLE'),
  (1, 'B', 10, 'AVAILABLE');

-- Showtime 2: 10 seats, row A only
INSERT INTO seats (showtime_id, seat_row, number, status) VALUES
  (2, 'A', 1,  'AVAILABLE'), (2, 'A', 2,  'AVAILABLE'), (2, 'A', 3,  'AVAILABLE'),
  (2, 'A', 4,  'AVAILABLE'), (2, 'A', 5,  'AVAILABLE'), (2, 'A', 6,  'AVAILABLE'),
  (2, 'A', 7,  'AVAILABLE'), (2, 'A', 8,  'AVAILABLE'), (2, 'A', 9,  'AVAILABLE'),
  (2, 'A', 10, 'AVAILABLE');

-- Showtime 3 (Interstellar): 10 seats, row A only
INSERT INTO seats (showtime_id, seat_row, number, status) VALUES
  (3, 'A', 1,  'AVAILABLE'), (3, 'A', 2,  'AVAILABLE'), (3, 'A', 3,  'AVAILABLE'),
  (3, 'A', 4,  'AVAILABLE'), (3, 'A', 5,  'AVAILABLE'), (3, 'A', 6,  'AVAILABLE'),
  (3, 'A', 7,  'AVAILABLE'), (3, 'A', 8,  'AVAILABLE'), (3, 'A', 9,  'AVAILABLE'),
  (3, 'A', 10, 'AVAILABLE');
