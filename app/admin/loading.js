// Shown instantly while an admin page loads its data (placeholder shapes)
export default function Loading() {
  return (
    <div className="adm-skeleton" role="status" aria-label="Loading">
      <div className="sk sk-title" />
      <div className="sk-grid">
        <div className="sk sk-card" />
        <div className="sk sk-card" />
        <div className="sk sk-card" />
      </div>
      <div className="sk sk-row" />
      <div className="sk sk-row" />
      <div className="sk sk-row" />
    </div>
  );
}
