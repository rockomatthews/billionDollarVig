import { getBoardData } from "@/lib/board/data";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const isAuthorized = Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="pixel-panel max-w-lg rounded-3xl p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-red-200">
            Admin locked
          </p>
          <h1 className="mt-2 text-3xl font-black text-amber-50">Token required</h1>
          <p className="mt-3 text-amber-100/70">
            Pass `?token=ADMIN_TOKEN` for the MVP moderation dashboard.
            Replace this with real auth before production operations.
          </p>
        </section>
      </main>
    );
  }

  const { blocks, stats } = await getBoardData();

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="pixel-panel rounded-3xl p-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-green-200">
            Moderation
          </p>
          <h1 className="mt-2 text-4xl font-black text-amber-50">Billion Dollar Vig admin</h1>
          <p className="mt-3 text-amber-100/70">
            {stats.soldUnits.toLocaleString()} sold units across {blocks.length} visible blocks.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="font-mono uppercase tracking-[0.15em] text-amber-200/70">
                <tr>
                  <th className="border-b border-amber-200/20 p-3">Buyer</th>
                  <th className="border-b border-amber-200/20 p-3">Plot</th>
                  <th className="border-b border-amber-200/20 p-3">Status</th>
                  <th className="border-b border-amber-200/20 p-3">URL</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr className="text-amber-50" key={block.id}>
                    <td className="border-b border-amber-200/10 p-3">{block.buyerLabel}</td>
                    <td className="border-b border-amber-200/10 p-3 font-mono">
                      {block.x},{block.y} / {block.width}x{block.height}
                    </td>
                    <td className="border-b border-amber-200/10 p-3">{block.status}</td>
                    <td className="border-b border-amber-200/10 p-3">
                      <a className="text-green-200 underline" href={block.targetUrl}>
                        {block.targetUrl}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
