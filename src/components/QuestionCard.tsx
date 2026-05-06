import { ReactNode } from "react";
import { motion } from "motion/react";
import clsx from "clsx";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  onAnswer: (answer: "yes" | "no" | "unknown") => void;
  isLoading: boolean;
}

export default function QuestionCard({ questionNumber, question, onAnswer, isLoading }: QuestionCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[400px] mx-auto bg-white rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-b-[8px] border-[#d1d5db] relative z-20 mt-4"
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-1 bg-gradient-to-r from-transparent to-[#1a365d]"></div>
          <h3 className="text-[#1a365d] font-black uppercase tracking-widest text-sm">
            QUESTION {questionNumber}/8
          </h3>
          <div className="w-8 h-1 bg-gradient-to-l from-transparent to-[#1a365d]"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-[#1a365d] mb-6 leading-snug min-h-[4rem] flex justify-center items-center">
          {question}
        </h2>

        <div className="flex flex-col gap-2 w-full">
          <AnswerButton label="Yes" onClick={() => onAnswer("yes")} disabled={isLoading} />
          <AnswerButton label="No" onClick={() => onAnswer("no")} disabled={isLoading} />
          <AnswerButton label="Don't know" onClick={() => onAnswer("unknown")} disabled={isLoading} />
        </div>
      </div>
    </motion.div>
  );
}

function AnswerButton({ label, onClick, disabled }: { label: string, onClick: () => void, disabled: boolean }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-full py-3.5 px-6 rounded-2xl text-white font-bold text-lg transition-all duration-300 ipl-blue-btn",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {label}
    </motion.button>
  );
}
