import { ArrowDown, BadgeDollarSign, Smartphone, TimerReset } from "lucide-react";
import type { ReactNode } from "react";
import { BoardExperience } from "@/components/board/board-experience";
import { TOTAL_UNITS } from "@/lib/board/constants";
import { getBoardData } from "@/lib/board/data";
import { formatUsd, quoteUnits } from "@/lib/board/pricing";

export default async function Home() {
  const { blocks, stats } = await getBoardData();
  const nextQuote = quoteUnits(stats.soldUnits + stats.reservedUnits, 100);
  const soldPercent = ((stats.soldUnits / TOTAL_UNITS) * 100).toFixed(3);

  return (
    <main className="min-h-screen px-4 py-5 md:px-8 md:py-8">
      <section className="mx-auto mb-6 max-w-7xl">
        <div className="pixel-panel overflow-hidden rounded-[2rem] p-5 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-green-200/30 bg-green-200/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-green-200">
                billiondollarvig.com
              </p>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.9] text-amber-50 md:text-7xl">
                The 2005 pixel billboard, rebuilt for crypto and phones.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-amber-100/75">
                Buy contiguous squares, upload tiny internet art, pay with hundreds
                of cryptocurrencies, and get early-buyer boost effects while the
                board climbs toward a one-billion-dollar sellout.
              </p>
              <a
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-black text-black transition hover:scale-[1.02]"
                href="#board"
              >
                Pick a plot <ArrowDown size={18} />
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard
                icon={<BadgeDollarSign />}
                label="Next 10 x 10 plot"
                value={formatUsd(nextQuote.subtotalCents)}
              />
              <StatCard
                icon={<TimerReset />}
                label="Sold"
                value={`${stats.soldUnits.toLocaleString()} units (${soldPercent}%)`}
              />
              <StatCard
                icon={<Smartphone />}
                label="Mobile upgrade"
                value="Pinch, pan, zoom, buy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl" id="board">
        <BoardExperience blocks={blocks} stats={stats} />
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200/20 bg-black/30 p-4">
      <div className="mb-3 text-green-200">{icon}</div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-100/55">{label}</p>
      <p className="mt-1 text-xl font-black text-amber-50">{value}</p>
    </div>
  );
}
