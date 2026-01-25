type Props = {
  title: string;
  description: string;
};

export function PlaceholderCard({ title, description }: Props) {
  return (
    <section className="bg-white/5 rounded-xl p-6 text-center text-white/70">
      <div className="text-lg font-semibold mb-2">{title}</div>
      <div className="text-sm">{description}</div>
    </section>
  );
}
