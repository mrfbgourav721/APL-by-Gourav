import { Home, Trophy, Calendar, Star, HelpCircle } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Trophy, label: "Leaderboard" },
    { icon: Calendar, label: "Daily Challenge" },
    { icon: Star, label: "Achievements" },
    { icon: HelpCircle, label: "How to Play" },
  ];

  return (
    <div className="hidden lg:flex w-64 flex-col gap-2 p-4 glass-panel rounded-2xl shrink-0 self-start mt-8">
      <div className="mb-4 text-center pb-2 border-b border-white/10">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          IPL ZONE
        </h2>
      </div>
      
      <div className="flex flex-col gap-1">
        {menuItems.map((item, i) => (
          <button 
            key={i}
            className={clsx(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group font-bold tracking-wide",
              item.active 
                ? "bg-white text-[#0a1e5e]" 
                : "text-white hover:bg-white/10"
            )}
          >
            <item.icon className={clsx(
              "w-5 h-5 transition-colors",
              item.active ? "text-[#0a1e5e]" : "text-yellow-400 group-hover:text-yellow-300"
            )} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
