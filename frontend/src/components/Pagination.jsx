export function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const maxButtons = 5;
  const start = Math.max(1, page - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, idx) => start + idx);

  return (
    <div className="pagination">
      <button
        type="button"
        className="ghost"
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={p === page ? "active" : "ghost"}
          onClick={() => onPageChange?.(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="ghost"
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
