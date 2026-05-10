import { BoardExperience } from "@/components/board/board-experience";
import { getBoardData } from "@/lib/board/data";

export default async function Home() {
  const { blocks, stats } = await getBoardData();

  return (
    <main className="h-screen overflow-hidden bg-[#f7e7b1] text-black">
      <BoardExperience blocks={blocks} stats={stats} />
    </main>
  );
}
