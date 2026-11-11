"use client";

import React from "react";
import { Sparkles, RotateCcw, Award } from "lucide-react";

export interface StepItem {
  label: string;
  status: "pending" | "active" | "done";
}

interface GradeOneScaffoldProps {
  labId: string;
  title: string;
  instruction: string;
  steps: StepItem[];
  theme?: string;
  hasDualMode?: boolean;
  complete: boolean;
  completionTitle: string;
  completionText: string;
  onReset: () => void;
  nextHref?: string;
  scene: React.ReactNode;
  tray?: React.ReactNode;
}

export function GradeOneScaffold({
  title,
  instruction,
  steps,
  complete,
  completionTitle,
  completionText,
  onReset,
  scene,
  tray,
}: GradeOneScaffoldProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 via-amber-50 to-pink-50 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white/95 border-b-4 border-amber-300 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-500">
            🎮
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-wide">{title}</h1>
            <p className="text-xs font-bold text-slate-500">Fun Kids Learning Game • 1st & 2nd Grade</p>
          </div>
        </div>

        {/* Steps Progress Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {steps.map((st, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 transition ${
                st.status === "done"
                  ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-400"
                  : st.status === "active"
                  ? "bg-amber-100 text-amber-900 border-2 border-amber-400 animate-pulse"
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <span>{st.status === "done" ? "✓" : i + 1}.</span>
              <span>{st.label}</span>
            </div>
          ))}
          <button
            onClick={onReset}
            className="ml-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black flex items-center gap-1 transition cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Scene Canvas */}
      <main className="flex-1 w-full min-h-[500px] flex flex-col relative overflow-hidden">
        {scene}

        {/* Completion Modal Celebration */}
        {complete && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-400 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-400 text-amber-500 flex items-center justify-center text-4xl shadow-lg mb-3 animate-bounce">
                🏆
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-wide">{completionTitle}</h2>
              <p className="text-sm font-bold text-slate-600 mt-2 leading-relaxed">{completionText}</p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={onReset}
                  className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 shadow-md transition cursor-pointer"
                >
                  Play Again! 🔄
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Tray */}
      {tray && (
        <footer className="w-full px-4 py-3 bg-white/95 border-t-4 border-amber-300 shadow-lg flex items-center justify-center shrink-0 z-20">
          {tray}
        </footer>
      )}
    </div>
  );
}
