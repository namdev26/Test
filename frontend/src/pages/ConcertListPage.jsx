import { EmptyState, Pill, SectionCard } from "../components";

export default function ConcertListPage({
  movies,
  selectedMovieId,
  onReload,
  onSelectMovie
}) {
  return (
    <SectionCard
      title="1) Movie List"
      subtitle="Chọn phim để xem lịch chiếu hiện có."
      right={<button onClick={onReload}>Reload</button>}
    >
      <div className="movie-grid">
        {movies.map((movie) => (
          <button
            key={movie.id}
            className={`movie-item ${selectedMovieId === movie.id ? "active" : ""}`}
            onClick={() => onSelectMovie(movie.id)}
          >
            <div className="movie-item-title">{movie.title}</div>
            <Pill tone={movie.status === "NOW_SHOWING" ? "success" : "warning"}>
              {movie.status}
            </Pill>
            <div className="movie-item-meta">
              {movie.duration_minutes} min - {movie.rating}
            </div>
          </button>
        ))}
      </div>
      {movies.length === 0 ? <EmptyState text="Chưa có phim." /> : null}
    </SectionCard>
  );
}
