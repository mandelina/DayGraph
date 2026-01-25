type Props = {
  title: string;
  description: string;
};

export function PlaceholderCard({ title, description }: Props) {
  return (
    <section className="bg-card rounded-xl p-6 text-center text-muted">
      <div className="text-lg font-semibold text-foreground mb-2">{title}</div>
      <div className="text-sm">{description}</div>
    </section>
  );
}
