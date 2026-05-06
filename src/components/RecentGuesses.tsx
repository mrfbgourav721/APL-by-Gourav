import { motion } from "motion/react";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";

interface Guess {
  id: string;
  name: string;
  isCorrect: boolean;
  avatar: string; // Used colors or image source
}

export default function RecentGuesses() {
  // Mock data for recent guesses matching screenshot closely
  const guesses: Guess[] = [
    { id: "1", name: "Virat Kohli", isCorrect: true, avatar: "bg-orange-500" },
    { id: "2", name: "MS Dhoni", isCorrect: true, avatar: "bg-yellow-500" },
    { id: "3", name: "Rohit Sharma", isCorrect: false, avatar: "bg-blue-500" },
    { id: "4", name: "Jasprit Bumrah", isCorrect: true, avatar: "bg-blue-600" },
    { id: "5", name: "Hardik Pandya", isCorrect: false, avatar: "bg-indigo-600" },
  ];

  return (
    <div className="hidden xl:flex w-72 flex-col p-4 glass-panel rounded-2xl shrink-0 self-start mt-8 shrink-0">
      <div className="mb-4 text-center pb-2 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-wider uppercase">
          RECENT GUESSES
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {guesses.map((guess, i) => (
          <motion.div 
            key={guess.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-[#0d2a7a]/50 to-[#04163e]/50 border border-white/5"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/20 shadow-inner ${guess.avatar} overflow-hidden`}>
              <span className="text-white font-bold text-sm">
                🧔🏻‍♂️
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white truncate">
                {guess.name}
              </p>
            </div>
            
            <div className="shrink-0 drop-shadow-md">
              {guess.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-[#10b981] fill-[#10b981] stroke-white" />
              ) : (
                <XCircle className="w-6 h-6 text-[#ef4444] fill-[#ef4444] stroke-white" />
              )}
            </div>
          </motion.div>
        ))}
        
        <button className="mt-2 flex items-center justify-center w-full py-2 bg-[#062161] hover:bg-[#0a318f] transition-colors rounded-xl border border-white/10 text-white font-bold text-sm group">
          View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
