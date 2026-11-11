"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Power,
  Zap,
  ZapOff,
  FolderOpen,
  Save,
  Image as ImageIcon,
  Palette,
  Eraser,
  Trash2,
  HardDrive,
  Cpu,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Bot,
  Volume2,
  Sun,
  Home,
  Check,
  X,
  Star,
  Trophy,
  Smile,
  Heart,
  Cloud,
  HelpCircle,
  Play,
  Sparkle,
} from "lucide-react";
import { GradeOneScaffold, StepItem } from "@/components/grade1/GradeOneScaffold";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";

interface SavedFile {
  id: string;
  name: string;
  type: "house" | "sun" | "star" | "flower" | "car" | "puppy" | "custom";
  dataUrl?: string;
  savedAt: string;
}

export default function ChalkboardRamLab() {
  const { speakInstructions, playPop, playSuccess } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  // Hardware Power State
  const [powerConnected, setPowerConnected] = useState(true);
  const [pcPoweredOn, setPcPoweredOn] = useState(false);
  const [booting, setBooting] = useState(false);

  // Simulated RAM State (Volatile - wipes on power cut)
  const [ramDrawingType, setRamDrawingType] = useState<"house" | "sun" | "star" | "flower" | "car" | "puppy" | "custom" | null>(null);
  const [ramDrawingStrokes, setRamDrawingStrokes] = useState<number>(0);

  // Simulated Hard Drive State (Non-Volatile - survives power loss)
  const [hardDriveFiles, setHardDriveFiles] = useState<SavedFile[]>([]);

  // Desktop OS Windows State
  const [activeApp, setActiveApp] = useState<"none" | "paint" | "pictures" | "save-dialog" | "hardware">("none");
  const [viewingFile, setViewingFile] = useState<SavedFile | null>(null);

  // Educational Stage Progression
  const [hasDrawnHouse, setHasDrawnHouse] = useState(false);
  const [hasSavedHouse, setHasSavedHouse] = useState(false);
  const [hasDrawnSun, setHasDrawnSun] = useState(false);
  const [hasPulledPower, setHasPulledPower] = useState(false);
  const [hasRestartedAfterCut, setHasRestartedAfterCut] = useState(false);
  const [hasDiscoveredAha, setHasDiscoveredAha] = useState(false);
  const [hardwareInspected, setHardwareInspected] = useState(false);

  // Paint Drawing Controls
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [currentColor, setCurrentColor] = useState("#ff2a5f"); // bright vibrant candy color
  const [selectedTool, setSelectedTool] = useState<"brush" | "eraser">("brush");
  const [fileNameInput, setFileNameInput] = useState("My_House.png");

  // Milo Dialogue Prompts - Ultra-Simple, enthusiastic, toddler-friendly!
  const [miloSpeech, setMiloSpeech] = useState<string>(
    "Hi baby! Press the BIG GREEN BUTTON to wake up the computer! 🟢✨"
  );

  const triggerMilo = useCallback(
    (text: string) => {
      setMiloSpeech(text);
      speakInstructions(text);
    },
    [speakInstructions]
  );

  // Power Button click
  const handleTogglePowerBtn = () => {
    playPop();
    if (!powerConnected) {
      triggerMilo("Oh no! The cord is unplugged! Plug it back in! 🔌⚡");
      return;
    }

    if (!pcPoweredOn) {
      setBooting(true);
      triggerMilo("YAY! Waking up! Rainbow computer is starting! 🚀🌈");
      setTimeout(() => {
        setBooting(false);
        setPcPoweredOn(true);
        if (hasPulledPower) {
          setHasRestartedAfterCut(true);
          triggerMilo("Computer is back on! Check your pictures! 🎈👀");
        } else {
          triggerMilo("Yay! Tap the colorful Paint Easel 🎨 to draw!");
        }
      }, 1100);
    } else {
      setPcPoweredOn(false);
      setActiveApp("none");
      triggerMilo("Goodnight computer! Tap green button to wake up! 😴💤");
    }
  };

  // Physical Power Cable Pull / Reconnect
  const handleTogglePowerPlug = () => {
    if (powerConnected) {
      playPop();
      setPowerConnected(false);
      setPcPoweredOn(false);
      setBooting(false);
      setActiveApp("none");
      setHasPulledPower(true);

      // RAM loses power instantly!
      setRamDrawingType(null);
      setRamDrawingStrokes(0);

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      triggerMilo("ZAP! ⚡ Lights out! Quick memory popped like a bubble! 🫧 Plug it back in! 🔌");
    } else {
      playPop();
      setPowerConnected(true);
      triggerMilo("Yay! Electricity is back! ⚡ Now press the GREEN BUTTON! 🟢");
    }
  };

  // Canvas Drawing Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = selectedTool === "eraser" ? "#ffffff" : currentColor;
    ctx.lineWidth = selectedTool === "eraser" ? 36 : 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setRamDrawingType("custom");
    setRamDrawingStrokes((prev) => prev + 1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const handleClearCanvas = () => {
    playPop();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setRamDrawingType(null);
    setRamDrawingStrokes(0);
  };

  // Colorful House Draw
  const handleDrawHouse = () => {
    playPop();
    setRamDrawingType("house");
    setRamDrawingStrokes(20);
    setHasDrawnHouse(true);
    setFileNameInput("My_House.png");

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Roof - Hot Pink
        ctx.fillStyle = "#ff2a5f";
        ctx.beginPath();
        ctx.moveTo(140, 180);
        ctx.lineTo(270, 65);
        ctx.lineTo(400, 180);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#be123c";
        ctx.stroke();

        // Chimney with heart smoke
        ctx.fillStyle = "#fb923c";
        ctx.fillRect(330, 80, 35, 50);
        ctx.strokeRect(330, 80, 35, 50);

        // House Body - Bright Buttercup Yellow
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(170, 180, 200, 140);
        ctx.strokeStyle = "#ca8a04";
        ctx.strokeRect(170, 180, 200, 140);

        // Windows - Bright Sky Blue
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(195, 200, 45, 45);
        ctx.strokeRect(195, 200, 45, 45);
        ctx.fillRect(300, 200, 45, 45);
        ctx.strokeRect(300, 200, 45, 45);

        // Door - Turquoise
        ctx.fillStyle = "#06b6d4";
        ctx.fillRect(245, 230, 50, 90);
        ctx.strokeStyle = "#0891b2";
        ctx.strokeRect(245, 230, 50, 90);

        // Knob - Gold
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(285, 280, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    triggerMilo("Look at the colorful House! 🏠 Tap the GREEN SAVE BUTTON to put it in the toy box!");
  };

  // Colorful Sun Draw
  const handleDrawSun = () => {
    playPop();
    setRamDrawingType("sun");
    setRamDrawingStrokes(25);
    setHasDrawnSun(true);
    setFileNameInput("My_Sun.png");

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Multi-colored rainbow rays
        const rainbowColors = ["#ff2a5f", "#ff7a00", "#ffd000", "#10e060", "#00d4ff", "#3b5bff", "#a83aff", "#ff52b8"];
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x1 = 270 + Math.cos(angle) * 75;
          const y1 = 175 + Math.sin(angle) * 75;
          const x2 = 270 + Math.cos(angle) * 115;
          const y2 = 175 + Math.sin(angle) * 115;
          ctx.strokeStyle = rainbowColors[i];
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Center circle - Golden sunshine
        ctx.fillStyle = "#ffd000";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(270, 175, 68, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rosy pink cheeks
        ctx.fillStyle = "#fb7185";
        ctx.beginPath();
        ctx.arc(235, 185, 12, 0, Math.PI * 2);
        ctx.arc(305, 185, 12, 0, Math.PI * 2);
        ctx.fill();

        // Big happy eyes
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(248, 165, 8, 0, Math.PI * 2);
        ctx.arc(292, 165, 8, 0, Math.PI * 2);
        ctx.fill();

        // White eye sparkles
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(246, 162, 3, 0, Math.PI * 2);
        ctx.arc(290, 162, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cute open smile
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(270, 178, 22, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
    }

    triggerMilo("Smiling Sunshine! ☀️ DO NOT SAVE IT! Keep it in Quick Memory (RAM) to test the power!");
  };

  // Save As Dialog Confirm
  const handleConfirmSave = () => {
    playSuccess();
    const newFile: SavedFile = {
      id: `file-${Date.now()}`,
      name: fileNameInput.trim() || "My_Picture.png",
      type: ramDrawingType || "custom",
      savedAt: "Just now",
    };

    setHardDriveFiles((prev) => [...prev, newFile]);
    setHasSavedHouse(true);
    setActiveApp("paint");

    triggerMilo("YAY! 🎁 House is locked in the Toy Box! Now tap Draw Sun ☀️!");
  };

  const handleOpenFile = (f: SavedFile) => {
    playPop();
    setViewingFile(f);
  };

  const handleCheckDiscovery = () => {
    setHasDiscoveredAha(true);
    playSuccess();
    triggerMilo("YOU WON! 🎉 House is safe in the Toy Box! The Sun vanished from Quick Memory! ⭐⭐⭐");
  };

  const handleInspectHardware = () => {
    playPop();
    setActiveApp("hardware");
    setHardwareInspected(true);
    playSuccess();
    reportComplete({ points: 100 });
  };

  const handleReset = () => {
    setPowerConnected(true);
    setPcPoweredOn(false);
    setBooting(false);
    setRamDrawingType(null);
    setRamDrawingStrokes(0);
    setHardDriveFiles([]);
    setActiveApp("none");
    setViewingFile(null);
    setHasDrawnHouse(false);
    setHasSavedHouse(false);
    setHasDrawnSun(false);
    setHasPulledPower(false);
    setHasRestartedAfterCut(false);
    setHasDiscoveredAha(false);
    setHardwareInspected(false);
    triggerMilo("Game reset! Tap the BIG GREEN BUTTON to play! 🟢🎈");
  };

  const starsEarned = (pcPoweredOn ? 1 : 0) + (hasSavedHouse ? 1 : 0) + (hasDiscoveredAha ? 1 : 0);

  const steps: StepItem[] = [
    {
      label: "1. Press Green 🟢",
      status: pcPoweredOn ? "done" : "active",
    },
    {
      label: "2. Save House 🏠",
      status: hasSavedHouse ? "done" : pcPoweredOn ? "active" : "pending",
    },
    {
      label: "3. Draw Sun ☀️",
      status: hasDrawnSun ? "done" : hasSavedHouse ? "active" : "pending",
    },
    {
      label: "4. Pull Plug 🔌",
      status: hasPulledPower ? "done" : hasDrawnSun ? "active" : "pending",
    },
    {
      label: "5. Find Secret ⭐",
      status: hasDiscoveredAha ? "done" : hasPulledPower ? "active" : "pending",
    },
  ];

  const isComplete = hasDiscoveredAha && hardwareInspected;

  // 8 Vibrant Candy Colors for Kids
  const candyColors = [
    { color: "#ff2a5f", name: "Berry Pink", emoji: "🍓" },
    { color: "#ff7a00", name: "Orange", emoji: "🍊" },
    { color: "#ffd000", name: "Yellow", emoji: "⭐" },
    { color: "#10e060", name: "Lime Green", emoji: "🍏" },
    { color: "#00d4ff", name: "Cyan", emoji: "🐬" },
    { color: "#3b5bff", name: "Blue", emoji: "🚙" },
    { color: "#a83aff", name: "Purple", emoji: "🍇" },
    { color: "#ff52b8", name: "Bubblegum", emoji: "🌸" },
  ];

  return (
    <GradeOneScaffold
      labId="chalkboard-ram"
      title="Milo's Rainbow Toy Computer! 🌈🎮"
      instruction={
        !pcPoweredOn && !hasPulledPower
          ? "Step 1: Press the BIG GREEN BUTTON 🟢 to turn on the rainbow computer!"
          : activeApp === "none" && !hasSavedHouse
          ? "Step 2: Tap the Paint Easel 🎨 on screen to make art!"
          : activeApp === "paint" && !hasSavedHouse
          ? "Tap Draw House 🏠, then tap the GREEN SAVE BUTTON 💾!"
          : hasSavedHouse && !hasDrawnSun
          ? "Step 3: Now tap Draw Sun ☀️! Leave it loose in Quick Memory (RAM)!"
          : hasDrawnSun && !hasPulledPower
          ? "Step 4: PULL THE PLUG 🔌⚡ to cut the power!"
          : hasPulledPower && !powerConnected
          ? "ZAP! ⚡ Screen went dark! Plug the cable back in 🔌!"
          : hasPulledPower && powerConnected && !pcPoweredOn
          ? "Press the BIG GREEN BUTTON 🟢 to restart!"
          : hasRestartedAfterCut && !hasDiscoveredAha
          ? "Step 5: Open Paint 🎨 and Pictures 📁 to see what stayed safe!"
          : "YAY! Tap the Secret Card 🧠 to collect your Golden Star! 🏆"
      }
      steps={steps}
      theme="playful"
      hasDualMode={false}
      complete={isComplete}
      completionTitle="SUPER RAINBOW HERO! 🏆🌈✨"
      completionText="You solved it! RAM is like writing on a bubble 🫧 (it pops when power goes off). The Toy Box 🎁 keeps your drawings safe forever! 🌟"
      onReset={handleReset}
      nextHref="/labs/firmware-bios"
      scene={
        <div className="w-full h-full flex flex-col justify-between select-none overflow-hidden bg-gradient-to-br from-pink-200 via-purple-100 via-sky-200 to-amber-100 text-slate-800 relative">
          
          {/* Floating background decorative playful shapes */}
          <div className="absolute top-2 left-6 text-pink-400/40 pointer-events-none text-4xl">🎈</div>
          <div className="absolute top-10 right-10 text-amber-400/50 pointer-events-none text-5xl animate-spin-slow">⭐</div>
          <div className="absolute bottom-16 left-12 text-purple-400/40 pointer-events-none text-4xl">🍭</div>
          <div className="absolute bottom-20 right-8 text-sky-400/40 pointer-events-none text-4xl">🚀</div>

          {/* ── TOP RAINBOW BANNER & MASCOT ── */}
          <div className="w-full px-3 py-2 bg-gradient-to-r from-pink-400 via-purple-400 via-sky-400 to-emerald-400 p-[3px] shadow-md z-20">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              
              {/* Cute Mascot with bouncing animations */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 border-3 border-yellow-300 flex items-center justify-center text-white shadow-lg transform hover:rotate-12 transition cursor-pointer text-2xl">
                  🤖
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-wide bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      Milo Robot 🤖
                    </span>
                    <button
                      onClick={() => speakInstructions(miloSpeech)}
                      className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white flex items-center justify-center shadow-md cursor-pointer active:scale-90 transition text-sm"
                      title="Read Aloud"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm sm:text-base font-black text-purple-950 truncate mt-0.5 drop-shadow-2xs">
                    {miloSpeech}
                  </p>
                </div>
              </div>

              {/* Colorful Stars & Status HUD */}
              <div className="flex items-center gap-2 shrink-0">
                {/* 3 Big Glowing Stars */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-yellow-300 to-amber-400 border-2 border-yellow-500 shadow-sm">
                  <span className="text-xs font-black text-amber-950 mr-0.5">Stars:</span>
                  {[1, 2, 3].map((starIdx) => (
                    <span
                      key={starIdx}
                      className={`text-xl transition-transform ${
                        starsEarned >= starIdx ? "scale-125 drop-shadow-md animate-bounce" : "opacity-40 grayscale"
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Quick Memory RAM Bubble Pill */}
                <div
                  className={`px-3 py-1.5 rounded-2xl border-2 flex items-center gap-1.5 transition shadow-xs ${
                    !pcPoweredOn || !powerConnected
                      ? "bg-slate-100 border-slate-300 text-slate-400"
                      : ramDrawingType
                      ? "bg-gradient-to-r from-pink-100 to-rose-200 border-pink-500 text-pink-900 animate-pulse font-black"
                      : "bg-pink-50 border-pink-300 text-pink-700 font-bold"
                  }`}
                >
                  <span className="text-base">🫧</span>
                  <div className="flex flex-col text-[10px] leading-tight font-black">
                    <span className="text-pink-600 uppercase text-[8px]">Quick Brain (RAM)</span>
                    <span>
                      {!powerConnected || !pcPoweredOn
                        ? "Empty 🫧"
                        : ramDrawingType
                        ? `${ramDrawingType === "house" ? "🏠 House" : "☀️ Sun"} (Unsaved!)`
                        : "Ready 🎨"}
                    </span>
                  </div>
                </div>

                {/* Toy Safe (Hard Drive) Pill */}
                <div
                  className={`px-3 py-1.5 rounded-2xl border-2 flex items-center gap-1.5 transition shadow-xs ${
                    hardDriveFiles.length > 0
                      ? "bg-gradient-to-r from-emerald-100 to-teal-200 border-emerald-500 text-emerald-900 font-black shadow-emerald-200"
                      : "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold"
                  }`}
                >
                  <span className="text-base">🎁</span>
                  <div className="flex flex-col text-[10px] leading-tight font-black">
                    <span className="text-emerald-700 uppercase text-[8px]">Toy Box (Hard Drive)</span>
                    <span>
                      {hardDriveFiles.length > 0 ? `${hardDriveFiles.length} Saved 🔒` : "Empty 📦"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CENTRAL PLAYGROUND (MONITOR + TOWER) ── */}
          <div className="flex-1 w-full min-h-0 relative flex flex-col justify-end overflow-hidden p-2 sm:p-4">
            
            <div className="relative z-10 w-full flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8 pb-2">
              
              {/* ── 1. TURQUOISE & PINK CARTOON MONITOR ── */}
              <div className="relative flex-1 max-w-4xl h-full min-h-[350px] max-h-[580px] flex flex-col justify-between">
                
                {/* Thick Playful Bezel with Colorful Stickers */}
                <div className="w-full flex-1 rounded-3xl border-8 border-cyan-400 bg-cyan-200 shadow-2xl flex flex-col justify-between overflow-hidden relative ring-4 ring-pink-300">
                  
                  {/* Cute Colorful Stickers on top frame */}
                  <div className="absolute top-1 left-3 flex items-center gap-2 z-30 text-sm">
                    <span className="hover:scale-125 transition-transform cursor-pointer">🦄</span>
                    <span className="hover:scale-125 transition-transform cursor-pointer">🌈</span>
                    <span className="hover:scale-125 transition-transform cursor-pointer">🎈</span>
                  </div>
                  <div className="absolute top-1 right-3 flex items-center gap-2 z-30 text-sm">
                    <span className="hover:scale-125 transition-transform cursor-pointer">🍭</span>
                    <span className="hover:scale-125 transition-transform cursor-pointer">🐶</span>
                    <span className="hover:scale-125 transition-transform cursor-pointer">⭐</span>
                  </div>

                  {/* Camera */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
                    <div className="w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-xs" />
                    {powerConnected && pcPoweredOn && <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />}
                  </div>

                  {/* ── Screen Display Area ── */}
                  {!powerConnected || !pcPoweredOn ? (
                    /* Monitor Turned Off - Adorable Sleeping Cartoon Face */
                    <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center text-center p-6 select-none relative overflow-hidden text-slate-200">
                      
                      {/* Big Bouncing Sleepy Mascot */}
                      <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-md border-4 border-purple-400/50 flex flex-col items-center justify-center mb-3 shadow-2xl animate-pulse">
                        <span className="text-5xl">💤</span>
                        <span className="text-xl mt-1">🐱 ( ˘ ³˘)♥</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-yellow-300 tracking-wide drop-shadow-md">
                        {!powerConnected ? "⚡ CORD IS UNPLUGGED! 🔌" : "😴 COMPUTER IS SLEEPING!"}
                      </h3>

                      <p className="text-sm sm:text-base font-black text-white mt-2 max-w-md bg-white/20 px-5 py-2.5 rounded-2xl border-2 border-white/30 backdrop-blur-sm shadow-lg">
                        {!powerConnected
                          ? "👉 Click the bouncy PLUG button below! 🔌⚡"
                          : "👉 Tap the BIG GREEN BUTTON on the tower! 🟢✨"}
                      </p>
                    </div>
                  ) : booting ? (
                    /* Boot Screen Sequence - Super Colorful Rainbow Rocket */
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 via-sky-400 to-amber-300 flex flex-col items-center justify-center text-center p-6 text-white select-none">
                      <div className="text-6xl animate-bounce mb-3">🚀🌈</div>
                      <span className="text-3xl font-black tracking-wider drop-shadow-lg">Waking Up Milo's Computer!</span>
                      <span className="text-base font-black bg-white/30 px-5 py-1.5 rounded-full mt-3 animate-pulse border-2 border-white/50">
                        Loading colors and music... ✨🎶
                      </span>
                    </div>
                  ) : (
                    /* ── LIVE VIBRANT RAINBOW DESKTOP ── */
                    <div className="w-full h-full relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-cyan-200 via-lime-200 to-emerald-400 p-3 text-slate-800">
                      
                      {/* Big Bright Rainbow in Wallpaper */}
                      <div className="absolute top-0 inset-x-0 h-32 opacity-80 pointer-events-none flex items-center justify-center">
                        <div className="w-[500px] h-[250px] border-[24px] border-b-0 border-t-pink-500 border-x-transparent rounded-t-full opacity-60"></div>
                      </div>
                      <div className="absolute top-2 right-4 text-5xl pointer-events-none animate-spin-slow">
                        ☀️
                      </div>
                      <div className="absolute top-6 left-8 text-4xl pointer-events-none">
                        ☁️
                      </div>
                      <div className="absolute top-12 left-1/3 text-4xl pointer-events-none">
                        🎈
                      </div>

                      {/* Desktop Icons */}
                      <div className="flex flex-row sm:flex-col gap-3 items-start z-10">
                        {/* Paint Shortcut - Vibrant Magenta */}
                        <button
                          onClick={() => {
                            playPop();
                            setActiveApp("paint");
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:scale-110 active:scale-95 transition cursor-pointer group text-center"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 border-4 border-yellow-300 shadow-xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                            🎨
                          </div>
                          <span className="text-xs font-black text-rose-950 bg-white/95 px-3 py-1 rounded-full shadow-md border-2 border-pink-400">
                            Paint 🎨
                          </span>
                        </button>

                        {/* Pictures Folder / Toy Safe - Vibrant Sapphire Blue & Gold */}
                        <button
                          onClick={() => {
                            playPop();
                            setActiveApp("pictures");
                            if (hasRestartedAfterCut) {
                              handleCheckDiscovery();
                            }
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:scale-110 active:scale-95 transition cursor-pointer group text-center"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 border-4 border-yellow-300 shadow-xl flex items-center justify-center text-3xl group-hover:-rotate-12 transition-transform relative">
                            🎁
                            {hardDriveFiles.length > 0 && (
                              <span className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 text-white rounded-full text-xs font-black flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                                {hardDriveFiles.length}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-black text-blue-950 bg-white/95 px-3 py-1 rounded-full shadow-md border-2 border-blue-400">
                            Toy Box 🎁
                          </span>
                        </button>

                        {/* Secret Card / Hardware - Vibrant Royal Purple */}
                        <button
                          onClick={() => {
                            playPop();
                            setActiveApp("hardware");
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:scale-110 active:scale-95 transition cursor-pointer group text-center"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-yellow-300 shadow-xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                            🧠
                          </div>
                          <span className="text-xs font-black text-purple-950 bg-white/95 px-3 py-1 rounded-full shadow-md border-2 border-purple-400">
                            Secret Card ⭐
                          </span>
                        </button>
                      </div>

                      {/* ── WINDOW 1: COLORFUL PAINT APPLICATION ── */}
                      {activeApp === "paint" && (
                        <div className="absolute inset-1 sm:inset-2 z-20 bg-white rounded-3xl shadow-2xl border-4 border-pink-500 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          {/* Title Bar */}
                          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-3 py-2 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🎨</span>
                              <span className="text-sm font-black tracking-wide">
                                Rainbow Paint Studio — {ramDrawingType ? `[In Quick Memory 🫧 (RAM)]` : "[Tap Stencils or Finger Draw!]"}
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveApp("none")}
                              className="w-8 h-8 rounded-full bg-white/30 hover:bg-white text-white hover:text-rose-600 flex items-center justify-center text-sm font-black transition cursor-pointer shadow-md active:scale-90"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          {/* Paint Toolbar with Big Chunky Stampers */}
                          <div className="bg-gradient-to-r from-amber-50 via-pink-50 to-sky-50 px-3 py-2 border-b-2 border-pink-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                            {/* Stencil Stamp Presets */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleDrawHouse}
                                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 border-3 transition cursor-pointer shadow-md active:translate-y-0.5 ${
                                  ramDrawingType === "house"
                                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-blue-600 scale-105"
                                    : "bg-white text-blue-900 border-blue-300 hover:bg-blue-50"
                                }`}
                              >
                                <span className="text-xl">🏠</span>
                                <span>Draw House</span>
                              </button>

                              <button
                                onClick={handleDrawSun}
                                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 border-3 transition cursor-pointer shadow-md active:translate-y-0.5 ${
                                  ramDrawingType === "sun"
                                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-orange-600 scale-105"
                                    : "bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
                                }`}
                              >
                                <span className="text-xl">☀️</span>
                                <span>Draw Sun</span>
                              </button>

                              <button
                                onClick={handleClearCanvas}
                                className="px-3 py-2 rounded-2xl text-xs font-black bg-rose-100 text-rose-700 border-2 border-rose-300 hover:bg-rose-200 flex items-center gap-1 transition cursor-pointer"
                                title="Clear"
                              >
                                <Trash2 size={16} />
                                <span>Clear</span>
                              </button>
                            </div>

                            {/* 8 Big Juicy Candy Color Swatches */}
                            <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-2xl border-2 border-pink-300 shadow-inner">
                              {candyColors.map((c) => (
                                <button
                                  key={c.color}
                                  onClick={() => {
                                    setSelectedTool("brush");
                                    setCurrentColor(c.color);
                                  }}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center text-xs shadow-sm ${
                                    currentColor === c.color && selectedTool === "brush"
                                      ? "ring-4 ring-purple-600 scale-125 shadow-md z-10"
                                      : "hover:scale-110"
                                  }`}
                                  style={{ backgroundColor: c.color }}
                                  title={c.name}
                                />
                              ))}
                              <div className="h-6 w-0.5 bg-slate-200 mx-1" />
                              <button
                                onClick={() => setSelectedTool("eraser")}
                                className={`px-2.5 py-1 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 ${
                                  selectedTool === "eraser"
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                                title="Eraser"
                              >
                                <Eraser size={16} />
                                <span>Eraser</span>
                              </button>
                            </div>

                            {/* Big Save Button */}
                            <button
                              onClick={() => {
                                playPop();
                                setActiveApp("save-dialog");
                              }}
                              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-600 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer animate-pulse"
                            >
                              <Save size={18} />
                              <span>PUT IN TOY BOX! 🎁💾</span>
                            </button>
                          </div>

                          {/* Canvas Workspace */}
                          <div className="flex-1 w-full bg-gradient-to-b from-purple-100 to-pink-100 p-2 sm:p-3 flex items-center justify-center relative overflow-hidden">
                            <div className="relative w-full h-full max-w-xl max-h-72 bg-white rounded-2xl shadow-lg border-4 border-pink-300 flex items-center justify-center overflow-hidden">
                              <canvas
                                ref={canvasRef}
                                width={540}
                                height={260}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                className="w-full h-full cursor-crosshair touch-none"
                              />

                              {!ramDrawingType && (
                                <div className="absolute pointer-events-none text-center p-4">
                                  <span className="text-sm sm:text-base font-black text-purple-900 bg-white/90 px-5 py-2.5 rounded-2xl border-2 border-dashed border-purple-400 shadow-md">
                                    👆 Tap "Draw House 🏠" or draw with finger!
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── WINDOW 2: SAVE DIALOG (TOY BOX CONFIRMATION) ── */}
                      {activeApp === "save-dialog" && (
                        <div className="absolute inset-0 z-30 bg-purple-950/50 backdrop-blur-xs flex items-center justify-center p-4">
                          <div className="w-full max-w-sm bg-gradient-to-b from-white to-emerald-50 rounded-3xl shadow-2xl border-4 border-emerald-400 p-5 flex flex-col gap-4 text-slate-800 animate-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b-2 border-emerald-200 pb-2">
                              <span className="text-base font-black flex items-center gap-2 text-emerald-800">
                                <span>🎁 Put Inside Toy Box!</span>
                              </span>
                              <button onClick={() => setActiveApp("paint")} className="text-slate-400 hover:text-slate-600">
                                <X size={22} />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div className="p-3 bg-emerald-100 rounded-2xl border-2 border-emerald-300 flex items-center gap-3">
                                <div className="text-4xl">🏠</div>
                                <div>
                                  <p className="text-sm font-black text-emerald-950">Locking Picture in Safe!</p>
                                  <p className="text-xs font-bold text-emerald-800">Keeps it forever in the Hard Drive!</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-emerald-200">
                              <button
                                onClick={() => setActiveApp("paint")}
                                className="px-4 py-2 rounded-2xl text-xs font-extrabold text-slate-500 hover:bg-slate-100 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleConfirmSave}
                                className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-lg flex items-center gap-2 transition cursor-pointer"
                              >
                                <Check size={18} />
                                <span>YES, LOCK IT IN! 🔒</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── WINDOW 3: TOY BOX / PICTURES FOLDER ── */}
                      {activeApp === "pictures" && (
                        <div className="absolute inset-1 sm:inset-2 z-20 bg-white rounded-3xl shadow-2xl border-4 border-sky-400 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-2 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🎁</span>
                              <span className="text-sm font-black">
                                Toy Box (Hard Drive) — Safe Forever! 🔒
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveApp("none")}
                              className="w-8 h-8 rounded-full bg-white/30 hover:bg-white text-white hover:text-rose-600 flex items-center justify-center text-sm font-black transition cursor-pointer shadow-md active:scale-90"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <div className="flex-1 p-4 bg-gradient-to-b from-sky-50 to-blue-50 flex items-start gap-4 overflow-y-auto">
                            {hardDriveFiles.length === 0 ? (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                                <span className="text-5xl mb-2">📦</span>
                                <span className="text-base font-black text-slate-700">The Toy Box is empty right now!</span>
                                <span className="text-xs font-bold text-slate-500 mt-1">
                                  Go to Paint 🎨 and tap SAVE 💾 to keep your house here forever!
                                </span>
                              </div>
                            ) : (
                              hardDriveFiles.map((file) => (
                                <button
                                  key={file.id}
                                  onClick={() => handleOpenFile(file)}
                                  className="flex flex-col items-center gap-2 p-3 rounded-3xl bg-white border-3 border-sky-300 shadow-lg hover:scale-110 transition cursor-pointer group w-32 text-center"
                                >
                                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-100 to-blue-100 border-2 border-sky-300 flex items-center justify-center text-sky-600 shadow-inner text-4xl">
                                    {file.type === "house" ? "🏠" : file.type === "sun" ? "☀️" : "🎨"}
                                  </div>
                                  <span className="text-xs font-black text-slate-800 truncate w-full">{file.name}</span>
                                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    SAVED FOREVER 🛡️
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── WINDOW 4: SECRET CARD / HARDWARE ── */}
                      {activeApp === "hardware" && (
                        <div className="absolute inset-1 sm:inset-2 z-20 bg-white text-slate-800 rounded-3xl shadow-2xl border-4 border-purple-500 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-2 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🧠</span>
                              <span className="text-sm font-black">
                                The Big Memory Secret: Bubble vs. Toy Box!
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveApp("none")}
                              className="w-8 h-8 rounded-full bg-white/30 hover:bg-white text-white hover:text-rose-600 flex items-center justify-center text-sm font-black transition cursor-pointer shadow-md active:scale-90"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto bg-gradient-to-b from-purple-50 to-pink-50">
                            {/* RAM Card */}
                            <div className="bg-pink-50 border-3 border-pink-400 rounded-3xl p-4 flex flex-col justify-between shadow-md">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-base font-black text-pink-900 flex items-center gap-1.5">
                                    <span>🫧 Quick Memory (RAM)</span>
                                  </span>
                                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-200 text-pink-800">
                                    Bubble
                                  </span>
                                </div>
                                
                                <div className="h-20 bg-pink-100 rounded-2xl p-2 flex items-center justify-center border-2 border-pink-300 mb-3 text-center text-4xl animate-bounce">
                                  🫧💥
                                </div>

                                <p className="text-xs font-bold text-pink-950 leading-relaxed">
                                  RAM is like writing on a <strong>soap bubble</strong>! It's super fast, but when the power plug is pulled, <strong>the bubble pops and it is gone!</strong>
                                </p>
                              </div>

                              <div className="mt-3 bg-pink-200/80 p-2 rounded-2xl text-[11px] font-black text-pink-900 flex items-center gap-1.5">
                                <AlertTriangle size={15} className="text-pink-600" />
                                <span>Unsaved art pops when power stops!</span>
                              </div>
                            </div>

                            {/* Hard Drive Card */}
                            <div className="bg-emerald-50 border-3 border-emerald-400 rounded-3xl p-4 flex flex-col justify-between shadow-md">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-base font-black text-emerald-900 flex items-center gap-1.5">
                                    <span>🎁 Toy Box (Hard Drive)</span>
                                  </span>
                                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                                    Safe Forever
                                  </span>
                                </div>

                                <div className="h-20 bg-emerald-100 rounded-2xl p-2 flex items-center justify-center border-2 border-emerald-300 mb-3 text-center text-4xl">
                                  📦🔒✨
                                </div>

                                <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                                  The Hard Drive is like a <strong>locked toy chest</strong>! When you tap SAVE, your drawings stay safe forever, even in the dark with <strong>ZERO electricity!</strong>
                                </p>
                              </div>

                              <div className="mt-3 bg-emerald-200/80 p-2 rounded-2xl text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle2 size={15} className="text-emerald-700" />
                                <span>Saved art stays safe forever!</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Desktop OS Taskbar */}
                      <div className="h-10 bg-white/95 backdrop-blur-md rounded-2xl px-3 flex items-center justify-between z-10 border-2 border-cyan-400 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs shadow-xs">
                            <span>🤖 MiloOS</span>
                          </div>
                          {activeApp !== "none" && (
                            <span className="text-xs font-black text-slate-700 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
                              {activeApp === "paint" ? "🎨 Paint" : activeApp === "pictures" ? "🎁 Toy Box" : "🧠 Secret Card"}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-purple-700">🌈 Rainbow Toddler Mode</span>
                      </div>
                    </div>
                  )}

                  {/* Monitor Chin */}
                  <div className="h-5 bg-cyan-400 px-4 flex items-center justify-between border-t-2 border-cyan-300">
                    <span className="text-[9px] font-black tracking-widest text-white flex items-center gap-1">
                      <span>✨ MILO RAINBOW VISION</span>
                    </span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        powerConnected && pcPoweredOn ? "bg-lime-300 animate-pulse shadow-md" : "bg-cyan-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Monitor Stand */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-6 bg-cyan-300 border-x-2 border-cyan-400" />
                  <div className="w-52 h-4 rounded-full bg-gradient-to-r from-pink-400 via-yellow-300 via-cyan-300 to-purple-400 shadow-lg border-2 border-cyan-400" />
                </div>
              </div>

              {/* ── 2. CARTOON TOY COMPUTER TOWER (PASTEL PURPLE & ORANGE) ── */}
              <div className="w-full md:w-64 h-full min-h-[350px] max-h-[580px] rounded-3xl bg-gradient-to-b from-purple-50 to-pink-50 border-4 border-purple-400 p-4 shadow-2xl flex flex-col justify-between relative ring-2 ring-pink-200">
                {/* Tower Top Details */}
                <div>
                  <div className="flex items-center justify-between border-b-2 border-purple-200 pb-2 mb-3">
                    <span className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1">
                      <span>⚡ Toy Box CPU</span>
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full ${
                        powerConnected && pcPoweredOn ? "bg-lime-400 animate-ping shadow-lg" : "bg-slate-300"
                      }`}
                    />
                  </div>

                  {/* Disc Slot */}
                  <div className="h-7 bg-white rounded-xl border-2 border-purple-200 flex items-center justify-between px-2.5 mb-3 shadow-inner">
                    <span className="text-[10px] font-black text-purple-700">💿 Game Disc</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  </div>

                  {/* GIANT ARCADE POWER BUTTON FOR TODDLERS */}
                  <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-white to-purple-100 rounded-3xl border-3 border-purple-300 mb-3 shadow-inner">
                    <button
                      onClick={handleTogglePowerBtn}
                      className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-90 ${
                        pcPoweredOn && powerConnected
                          ? "border-yellow-300 bg-gradient-to-tr from-lime-400 via-emerald-500 to-teal-400 text-white shadow-lime-300/80 animate-pulse ring-4 ring-lime-200"
                          : "border-slate-300 bg-white text-slate-400 hover:border-lime-400 hover:text-lime-500"
                      }`}
                      title="Press Power Button"
                    >
                      <Power size={42} strokeWidth={3.5} />
                    </button>
                    <span className="text-xs font-black text-purple-950 mt-2 tracking-wide flex items-center gap-1">
                      {pcPoweredOn && powerConnected ? "🟢 RUNNING!" : "PRESS ME! 🟢"}
                    </span>
                  </div>
                </div>

                {/* Spinning Multi-Color Rainbow Pinwheel Fan */}
                <div className="h-16 bg-gradient-to-r from-pink-100 via-purple-100 to-sky-100 rounded-2xl border-2 border-purple-200 flex items-center justify-center p-2 relative overflow-hidden">
                  <div
                    className={`w-12 h-12 rounded-full border-2 border-purple-300 flex items-center justify-center ${
                      powerConnected && pcPoweredOn ? "animate-spin-slow text-yellow-500 text-2xl" : "text-slate-300 text-2xl"
                    }`}
                  >
                    🎡
                  </div>
                  <span className="absolute bottom-1 text-[9px] font-black text-purple-900 uppercase tracking-wider">
                    {powerConnected && pcPoweredOn ? "RAINBOW FAN ON 🌈" : "FAN RESTING 💤"}
                  </span>
                </div>

                {/* ── 3. CHUNKY INTERACTIVE POWER CABLE ── */}
                <div className="pt-2 border-t-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-800">Electric Cord</span>
                    <span
                      className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                        powerConnected
                          ? "bg-lime-100 text-lime-800 border border-lime-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300 animate-bounce"
                      }`}
                    >
                      {powerConnected ? "PLUGGED IN ⚡" : "UNPLUGGED! 💥"}
                    </span>
                  </div>

                  {/* Big Chunky Plug Pull Button */}
                  <button
                    onClick={handleTogglePowerPlug}
                    className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:translate-y-1 ${
                      powerConnected
                        ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white border-b-4 border-red-800 active:border-b-0"
                        : "bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 text-white border-b-4 border-emerald-800 active:border-b-0 animate-bounce"
                    }`}
                  >
                    {powerConnected ? <ZapOff size={20} /> : <Zap size={20} />}
                    <span>{powerConnected ? "PULL POWER PLUG! ⚡" : "PLUG CABLE IN! 🔌"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── RAINBOW KEYBOARD & TOY MOUSE DESK ── */}
            <div className="w-full h-12 bg-gradient-to-r from-rose-400 via-amber-300 via-emerald-300 via-sky-300 to-purple-400 rounded-t-3xl border-t-4 border-white/60 shadow-2xl flex items-center justify-between px-6 z-10 shrink-0">
              {/* Colorful rainbow keyboard keys */}
              <div className="h-7 w-80 bg-white/95 rounded-xl border-2 border-white flex items-center justify-center gap-1 px-2 shadow-sm">
                {["#ff2a5f", "#ff7a00", "#ffd000", "#10e060", "#00d4ff", "#3b5bff", "#a83aff"].map((col, i) => (
                  <div key={i} className="flex-1 h-4 rounded-xs shadow-xs" style={{ backgroundColor: col }} />
                ))}
              </div>

              {/* Chunky smiling toy mouse */}
              <div className="w-9 h-9 rounded-full bg-white border-2 border-purple-300 flex flex-col items-center justify-start pt-1 shadow-md">
                <div className="w-2 h-3 rounded-full bg-pink-500" />
              </div>
            </div>
          </div>
        </div>
      }
      tray={
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!pcPoweredOn && (
            <button
              onClick={handleTogglePowerBtn}
              className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Power size={22} />
              <span>Press Big Green Button 🟢</span>
            </button>
          )}

          {pcPoweredOn && !hasSavedHouse && activeApp !== "paint" && (
            <button
              onClick={() => {
                playPop();
                setActiveApp("paint");
              }}
              className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Palette size={22} />
              <span>Open Paint Easel 🎨</span>
            </button>
          )}

          {activeApp === "paint" && !hasSavedHouse && (
            <button
              onClick={handleDrawHouse}
              className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Home size={22} />
              <span>Draw House 🏠</span>
            </button>
          )}

          {hasSavedHouse && !hasDrawnSun && (
            <button
              onClick={() => {
                setActiveApp("paint");
                handleDrawSun();
              }}
              className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Sun size={22} />
              <span>Draw Sun (Unsaved!) ☀️</span>
            </button>
          )}

          {hasDrawnSun && !hasPulledPower && (
            <button
              onClick={handleTogglePowerPlug}
              className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer animate-pulse"
            >
              <ZapOff size={22} />
              <span>PULL POWER PLUG! ⚡</span>
            </button>
          )}

          {hasPulledPower && !powerConnected && (
            <button
              onClick={handleTogglePowerPlug}
              className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer animate-bounce"
            >
              <Zap size={22} />
              <span>Plug Cable Back In 🔌</span>
            </button>
          )}

          {hasRestartedAfterCut && (
            <button
              onClick={handleInspectHardware}
              className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 shadow-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Cpu size={22} />
              <span>Reveal Secret Card! 🧠⭐</span>
            </button>
          )}
        </div>
      }
    />
  );
}
