import { BoardExperience } from "@/components/board/board-experience";
import { getBoardData } from "@/lib/board/data";

export default async function Home() {
  const { blocks, stats, checkoutConfigured } = await getBoardData();

  return (
    <main className="h-screen overflow-hidden bg-black text-black">
      <BoardExperience blocks={blocks} checkoutConfigured={checkoutConfigured} stats={stats} />
    </main>
  );
}
