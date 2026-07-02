import { BottomNav } from "./BottomNav";

export function LeaderboardScreen() {
  return (
      <>

    <div className="flex-1 bg-gray-50 flex flex-col pt-14 pb-20 px-4 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-black">Campus Leaderboard</h1>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Top students, streak rankings, and world ranks will show here!</p>
      </div>
    </div>
          <BottomNav />

          </>

  );
}