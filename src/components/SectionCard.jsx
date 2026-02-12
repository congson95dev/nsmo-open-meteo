export default function SectionCard({ title, children, actions }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <h3>{title}</h3>
        <div className="section-actions">{actions}</div>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}
