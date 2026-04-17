import { Badge, EmptyState, SectionCard } from "../components";

const MOVIE_EMOJIS = {
  1: '🦸',
  2: '🚀',
  3: '🎭',
  4: '👻',
  5: '🌊',
};

export default function MovieListPage({ movies, selectedMovieId, onReload, onSelectMovie }) {
  return (
    <SectionCard
      badge="Bước 1"
      title="Chọn phim"
      subtitle="Chọn một bộ phim bạn muốn xem."
      right={
        <button className="reload-btn" onClick={onReload}>
          ↻ Tải lại
        </button>
      }
    >
      {movies.length === 0 ? (
        <EmptyState icon="🎬" text="Chưa có phim nào. Nhấn Tải lại để thử." />
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <button
              key={movie.id}
              className={`movie-card ${selectedMovieId === movie.id ? 'selected' : ''}`}
              onClick={() => onSelectMovie(movie.id)}
            >
              {selectedMovieId === movie.id && (
                <div className="selected-check">✓</div>
              )}
              <div className="movie-poster-placeholder">
                {MOVIE_EMOJIS[movie.id] || '🎬'}
              </div>
              <div className="movie-title">{movie.title}</div>
              <div className="movie-meta">
                <span>⏱ {movie.durationMinutes ?? movie.duration_minutes} phút</span>
                <span>🔞 {movie.rating}</span>
              </div>
              <Badge tone={movie.status === 'NOW_SHOWING' ? 'green' : 'yellow'}>
                {movie.status === 'NOW_SHOWING' ? '● Đang chiếu' : '◷ Sắp chiếu'}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
