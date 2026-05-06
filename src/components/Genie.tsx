import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function Genie({ isThinking }: { isThinking: boolean }) {
  return (
    <div className="relative flex justify-center items-center h-80 sm:h-96 w-full -z-10 mt-10">
      {/* Neon circular halo behind genie */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-[4px] border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.8)] flex items-center justify-center bg-blue-600/20"
      />
      
      {/* Genie Character Placeholder */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="relative z-10 flex flex-col items-center justify-center"
      >
        <div className="text-[10rem] sm:text-[12rem] leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
           🧞‍♂️
        </div>
        {isThinking && (
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-2 text-[#ffb800] font-black uppercase tracking-widest text-lg drop-shadow-[0_0_8px_currentColor]"
          >
            Thinking...
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
