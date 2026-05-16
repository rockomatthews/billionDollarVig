import Link from "next/link";
import type { ReactNode } from "react";

const marketingLinks = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/million-dollar-homepage-crypto", label: "MDH crypto" },
  { href: "/advertise-with-crypto", label: "Advertise" },
  { href: "/faq", label: "FAQ" },
];

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function MarketingPage({ eyebrow, title, description, children }: MarketingPageProps) {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-[#f8edc7] md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#d7a83f]/35 pb-4">
          <Link className="text-xl font-black text-[#f5d37c]" href="/">
            Billion Dollar Vig
          </Link>
          <div className="flex flex-wrap gap-4 text-sm text-[#f8edc7]/75">
            {marketingLinks.map((link) => (
              <Link className="transition hover:text-[#f5d37c]" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <header className="mb-10 rounded-3xl border border-[#d7a83f]/45 bg-[#050505] p-6 shadow-[0_0_80px_rgba(215,168,63,0.16)] md:p-10">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-[#d7a83f]">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-[#fff7dc] md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#f8edc7]/75">{description}</p>
          <Link
            className="mt-6 inline-flex rounded-2xl border-2 border-[#f5d37c] bg-[#f0b83f] px-5 py-3 font-black text-black shadow-[2px_2px_0_#5a3b00]"
            href="/"
          >
            View the board
          </Link>
        </header>

        <div className="space-y-8">{children}</div>
      </div>
    </main>
  );
}

export function MarketingSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#d7a83f]/30 bg-[#090909] p-6 md:p-8">
      <h2 className="mb-4 text-2xl font-black text-[#fff7dc]">{title}</h2>
      <div className="space-y-4 leading-7 text-[#f8edc7]/75">{children}</div>
    </section>
  );
}
