/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Volume2, Globe, Users, MessageSquareQuote, Crown, Star } from "lucide-react";
import Genie from "./components/Genie";
import Sidebar from "./components/Sidebar";
import QuestionCard from "./components/QuestionCard";
import RecentGuesses from "./components/RecentGuesses";

export default function App() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "guessing" | "result">("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [finalGuess, setFinalGuess] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startGame = async () => {
    setIsLoading(true);
    setGameState("playing");
    setQuestionCount(1);
    try {
      const res = await fetch("/api/start");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start game");
      }
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
    } catch (err: any) {
      console.error("Failed to start game", err);
      setCurrentQuestion(err.message || "An error occurred connecting to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answer: "yes" | "no" | "unknown") => {
    if (!sessionId) return;
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answer })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit answer");
      }

      if (data.guess) {
        setFinalGuess(data.guess);
        setConfidence(data.confidence);
        setGameState("guessing");
        setTimeout(() => setGameState("result"), 2000);
      } else if (data.question) {
        setQuestionCount(prev => prev + 1);
        setCurrentQuestion(data.question);
      }
    } catch (err: any) {
      console.error("Error submitting answer", err);
      setCurrentQuestion(err.message || "An error occurred connecting to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const playAgain = () => {
    setGameState("idle");
    setSessionId(null);
    setQuestionCount(0);
    setCurrentQuestion("");
    setFinalGuess("");
  };

  return (
    <div className="min-h-screen font-sans text-white overflow-hidden relative flex flex-col bg-[#110029]">
      {/* Stadium Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b004d] via-[#2d0075] to-[#0f0026]"></div>
        
        {/* Spotlights */}
        <div className="absolute top-[-10%] left-[20%] w-[100px] h-[120%] bg-white/10 rotate-[25deg] transform origin-top blur-3xl rounded-[100%]"></div>
        <div className="absolute top-[-10%] right-[20%] w-[100px] h-[120%] bg-white/10 -rotate-[25deg] transform origin-top blur-3xl rounded-[100%]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full"></div>
        
        {/* Pitch/Grass at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[25vh] bg-gradient-to-t from-[#0a2312] to-[#3a7536] border-t border-[#4caf50]/30 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] opacity-90"></div>
        
        {/* Floating Confetti (Static representation) */}
        <div className="absolute top-[15%] left-[10%] w-3 h-5 bg-yellow-400 rotate-12 shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
        <div className="absolute top-[25%] left-[30%] w-3 h-3 bg-red-500 rotate-45 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
        <div className="absolute top-[18%] right-[20%] w-2 h-6 bg-blue-400 -rotate-12 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
        <div className="absolute top-[35%] right-[10%] w-4 h-4 bg-green-400 rotate-12 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
      </div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        {/* Left: Trophy logo */}
        <div className="flex flex-col items-center">
           <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] mb-1" />
           <div className="bg-[#0b2466] border border-blue-500/50 rounded-lg px-2 py-0.5">
             <span className="text-[10px] sm:text-xs font-black uppercase text-white tracking-widest text-glow">IPL EDITION</span>
           </div>
        </div>

        {/* Center: Title */}
        <div className="flex flex-col items-center justify-center -mt-2">
           <div className="flex items-center gap-2">
             <div className="w-12 h-14 bg-white rounded-full flex items-center justify-center shadow-lg -rotate-12 relative flex-shrink-0">
               <span className="text-3xl absolute text-[#020e2e]">🏏</span>
             </div>
             <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
               IPL <span className="text-white text-glow">AKINAATOR</span>
             </h1>
           </div>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-yellow-400 text-xs text-glow">✦</span>
             <p className="text-sm font-semibold text-white tracking-wider">
               Think of an IPL Player, I will guess it!
             </p>
             <span className="text-yellow-400 text-xs text-glow">✦</span>
           </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-[#071b4a]/80 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest">SOUND</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-[#071b4a]/80 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest">ENGLISH ▾</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1400px] w-full mx-auto px-4 gap-6">
        <Sidebar />

        {/* CENTER SECTION */}
        <div className="flex-1 flex flex-col justify-between items-center relative mt-4 overflow-y-auto w-full max-w-2xl mx-auto h-full pb-8 pt-4">
          
          {/* Genie in background filling space */}
          <div className="flex-1 w-full flex items-center justify-center -mb-8">
            <Genie isThinking={isLoading || gameState === "guessing"} />
          </div>

          <AnimatePresence mode="wait">
            {(gameState === "idle" || gameState === "result") && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full flex justify-center mb-6 z-30"
              >
                <div className="flex flex-col w-full items-center">
                  
                  {gameState === "result" && (
                    <div className="bg-[#001033]/90 border border-y-yellow-400/50 p-6 rounded-3xl w-full max-w-sm text-center mb-6 shadow-2xl backdrop-blur-sm">
                      <h3 className="text-yellow-400 font-bold uppercase mb-2">My Guess Is...</h3>
                      <h2 className="text-4xl font-black text-white mb-4">{finalGuess}</h2>
                      <div className="text-sm font-semibold opacity-80 mb-6">Confidence: {confidence}%</div>
                      <div className="flex gap-2">
                        <button onClick={playAgain} className="flex-1 bg-green-500 hover:bg-green-600 p-3 rounded-xl font-bold transition-all shadow-md">
                          Yes!
                        </button>
                        <button onClick={playAgain} className="flex-1 bg-red-500 hover:bg-red-600 p-3 rounded-xl font-bold transition-all shadow-md">
                          No :(
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feature Box Container exactly like screenshot */}
                  {gameState === "idle" && (
                    <>
                    <div className="w-full max-w-3xl glass-panel rounded-2xl flex flex-col sm:flex-row items-center justify-between p-4 px-6 shadow-2xl border-t border-b border-blue-400/30 gap-4 mt-12 bg-gradient-to-r from-[#030b20]/90 via-[#061947]/90 to-[#030b20]/90">
                      <Feature icon={Users} title="THINK" subtitle="OF ANY IPL PLAYER" />
                      <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
                      <Feature icon={MessageSquareQuote} title="ANSWER" subtitle="SIMPLE QUESTIONS" />
                      <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
                      <Feature icon={Crown} title="AKINAATOR" subtitle="WILL GUESS YOUR PLAYER" />
                      <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
                      <Feature icon={Star} title="UNLOCK" subtitle="ACHIEVEMENTS & CLIMB" color="text-yellow-400" />
                    </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full flex justify-center z-30 relative"
              >
                <QuestionCard 
                  questionNumber={questionCount} 
                  question={currentQuestion} 
                  onAnswer={handleAnswer} 
                  isLoading={isLoading} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button at the very bottom center */}
          {gameState === "idle" && (
            <motion.div 
              className="z-30 relative mt-4 mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button 
                onClick={startGame}
                className="relative px-16 py-4 rounded-full bg-gradient-to-b from-[#ffed4a] via-[#f59e0b] to-[#d97706] text-[#451a03] font-black text-2xl uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.6)] border-b-[6px] border-[#92400e] active:border-b-0 active:translate-y-[6px]"
              >
                Let's Play!
                
                {/* Gold wing decorations on button ends */}
                <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-10 h-8 flex items-center justify-end">
                  <div className="w-6 h-2 bg-yellow-400 rotate-12 rounded-full shadow-sm"></div>
                  <div className="w-4 h-2 bg-yellow-400 -rotate-12 rounded-full absolute bottom-1 shadow-sm"></div>
                </div>
                <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-10 h-8 flex items-center justify-start">
                  <div className="w-6 h-2 bg-yellow-400 -rotate-12 rounded-full shadow-sm"></div>
                  <div className="w-4 h-2 bg-yellow-400 rotate-12 rounded-full absolute bottom-1 shadow-sm"></div>
                </div>
              </button>
            </motion.div>
          )}

        </div>

        <RecentGuesses />
      </main>

      {/* Decorative IPL Trophy on Bottom Left */}
      <div className="fixed bottom-0 left-8 z-10 hidden xl:flex flex-col items-center pointer-events-none">
        <div className="w-32 h-40 bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 rounded-t-3xl shadow-[0_0_30px_rgba(234,179,8,0.5)] transform relative flex justify-center pt-2">
            <Trophy className="w-24 h-24 text-yellow-100" />
            <div className="absolute bottom-2 left-0 w-full text-center">
              <span className="text-white text-xs font-black uppercase shadow-lg">IPL 2026</span>
            </div>
        </div>
        <div className="w-40 h-24 bg-gradient-to-b from-blue-700 to-blue-900 rounded-t-xl border-t border-blue-400 shadow-[0_-5px_20px_rgba(37,99,235,0.5)] flex items-center justify-center -mt-2">
           <span className="text-white font-black blur-[0.5px]">TATA IPL</span>
        </div>
      </div>
      
      {/* Decorative Cricket Gear on Bottom Right */}
      <div className="fixed bottom-2 right-8 z-10 hidden xl:flex items-end gap-2 pointer-events-none drop-shadow-2xl opacity-90">
         <div className="w-24 h-24 rounded-[40%] bg-[#081a4a] border border-white/20 shadow-[-10px_10px_20px_rgba(0,0,0,0.8)] relative overflow-hidden flex items-center justify-center">
             <span className="text-white/50 text-xs font-bold absolute bottom-2">HELMET</span>
         </div>
         <div className="w-16 h-80 bg-gradient-to-b from-[#e1dac8] to-[#b1a080] border-2 border-[#806f52] shadow-[-10px_10px_20px_rgba(0,0,0,0.8)] rounded-t-full rounded-b flex flex-col items-center pt-10 transform origin-bottom rotate-6 relative">
            <span className="text-[#806f52] font-black text-xl -rotate-90 block mt-16 scale-y-150 tracking-widest pl-4">IPL</span>
         </div>
         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#dc2626] to-[#7f1d1d] shadow-[-10px_10px_15px_rgba(0,0,0,0.8)] absolute bottom-4 -right-2 border border-red-500/50"></div>
      </div>

    </div>
  );
}

function Feature({ icon: Icon, title, subtitle, color = "text-cyan-400" }: { icon: any, title: string, subtitle: string, color?: string }) {
  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <div className="w-10 h-10 flex items-center justify-center shrink-0">
        <Icon className={`w-8 h-8 ${color} filter drop-shadow-[0_0_8px_currentColor]`} />
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold text-white text-sm tracking-wide">{title}</span>
        <span className="font-semibold text-blue-200/80 text-[10px] tracking-wider leading-tight">{subtitle}</span>
      </div>
    </div>
  );
}

