import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  meta: ReactNode;
  tone?: "warm" | "violet" | "neutral";
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  tone = "warm",
}: Props) {
  return (
    <header className={`page-header page-header-${tone}`}>
      <div className="relative z-10 min-w-0">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-current/65 sm:text-base">
          {description}
        </p>
      </div>
      <div className="page-header-meta relative z-10 shrink-0">{meta}</div>
      <div className="page-header-orbit page-header-orbit-one" aria-hidden />
      <div className="page-header-orbit page-header-orbit-two" aria-hidden />
    </header>
  );
}
