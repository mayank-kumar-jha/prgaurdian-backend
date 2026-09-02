"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import { motion, useScroll, useTransform } from "framer-motion";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic"], weight: ["700"] });
import {
  ShieldCheck,
  GitPullRequest,
  Zap,
  Sparkles,
  Database,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Target,
  Radio,
  Code2,
  ArrowRight,
  ExternalLink,
  Terminal,
  Cpu,
  Lock,
  GitCommit,
  Layers,
  ChevronRight,
  Search,
  ScanLine
} from "lucide-react";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#020403] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden font-sans relative">
      {/* --- ELITE AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#062314_0%,#020403_70%)]" />
        
        {/* Dynamic Interactive Glow tracking mouse loosely */}
        <motion.div
          className="absolute w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] mix-blend-screen"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{ type: "spring", damping: 40, stiffness: 20, mass: 2 }}
        />

        {/* Diagonal Tech Lines (Linear Style) */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: `repeating-linear-gradient(45deg, #10b981 0, #10b981 1px, transparent 1px, transparent 50px)`
             }}
        />
        
        {/* Subtle grid fade out */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020403]/80 to-[#020403]" />
      </div>

      {/* --- TOP HEADER --- */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 border-b border-emerald-900/20 bg-[#020403]/60 backdrop-blur-2xl"
      >
        <div className="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_25px_-3px_rgba(16,185,129,0.6)] transition-all duration-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={2} />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
              PR GUARDIAN
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-widest">
                System Active
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="relative overflow-hidden group flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="w-4 h-4 fill-zinc-300 group-hover:fill-emerald-400 transition-colors relative z-10" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-xs font-bold text-zinc-300 group-hover:text-emerald-400 transition-colors relative z-10">Sign in</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-[90rem] mx-auto min-h-[90vh] flex flex-col xl:flex-row items-center justify-between gap-16">
        
        {/* Left Typography & CTA */}
        <motion.div 
          className="flex-1 flex flex-col items-start text-left max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
              The Next Evolution of Code Review
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`text-5xl sm:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter leading-[0.95] ${spaceGrotesk.className}`}
          >
            Review Code <br />
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 blur-2xl opacity-50 mix-blend-screen" />
              <span className={`relative bg-gradient-to-br from-emerald-300 via-teal-300 to-emerald-600 bg-clip-text text-transparent whitespace-nowrap ${playfair.className} tracking-normal pr-2`}>
                {"Autonomously.".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, display: "none" }}
                    animate={{ opacity: 1, display: "inline" }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0 }}
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2, end)" }}
                  className="inline-block w-1 md:w-2 h-[0.8em] bg-emerald-400 align-baseline ml-2"
                />
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed font-light"
          >
            PR Guardian acts as your senior principal engineer. Powered by <strong className="text-zinc-200 font-medium">Gemini 1.5 Pro</strong> and <strong className="text-zinc-200 font-medium">Pinecone RAG</strong>, it analyzes ASTs, detects security flaws, and posts verdicts instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-5"
          >
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="relative group px-8 py-4 rounded-xl font-bold text-sm bg-white text-black overflow-hidden cursor-pointer w-full sm:w-auto"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Deploy Guardian
              </span>
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
              Secured by GitHub OAuth
            </div>
          </motion.div>
        </motion.div>

        {/* Right HUD / Terminal Visual */}
        <motion.div 
          style={{ y: y2 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full max-w-2xl relative perspective-1000"
        >
          {/* Abstract geometric framing */}
          <div className="absolute -inset-4 border border-emerald-500/10 rounded-[2rem] bg-emerald-900/5 transform rotate-3" />
          <div className="absolute -inset-2 border border-teal-500/20 rounded-[2rem] bg-teal-900/5 transform -rotate-2 backdrop-blur-sm" />
          
          <div className="relative bg-[#050907]/90 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden backdrop-blur-2xl">
            {/* HUD Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-900/40 bg-[#020403]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              </div>
              <div className="text-[10px] font-mono text-emerald-400/70 tracking-widest uppercase flex items-center gap-2">
                <ScanLine className="w-3 h-3" />
                Analysis Engine Live
              </div>
            </div>

            {/* Simulated Code Area */}
            <div className="p-4 font-mono text-[11px] sm:text-xs leading-relaxed text-zinc-400 relative">
              {/* Animated scanline */}
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none z-20 border-b border-emerald-500/20"
              />

              <div className="flex text-zinc-600 mb-2">
                <span className="w-8"></span>
                <span className="text-emerald-500/50">{'// src/auth/session.ts'}</span>
              </div>
              
              <div className="flex gap-4">
                <span className="w-4 text-right text-zinc-600">42</span>
                <span>{'export async function validateToken(token: string) {'}</span>
              </div>
              <div className="flex gap-4">
                <span className="w-4 text-right text-zinc-600">43</span>
                <span className="pl-4">{'const decoded = jwt.decode(token);'}</span>
              </div>
              <div className="flex gap-4 bg-red-950/20 text-red-300 border-l border-red-500 -ml-4 pl-4 py-0.5 relative z-10">
                <span className="w-4 text-right text-red-500 font-bold">44</span>
                <span className="pl-4 text-red-200">{'- const user = await db.users.find({ id: decoded.sub });'}</span>
              </div>
              <div className="flex gap-4 bg-emerald-950/20 text-emerald-300 border-l border-emerald-500 -ml-4 pl-4 py-0.5 relative z-10">
                <span className="w-4 text-right text-emerald-500 font-bold">45</span>
                <span className="pl-4 text-emerald-200">{'+ const user = await db.users.findUnique({ where: { id: decoded.sub } });'}</span>
              </div>

              {/* Floating Finding HUD Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="mt-6 ml-8 bg-[#0a110e] border border-amber-500/30 rounded-xl p-4 shadow-xl relative z-30"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl" />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white">AI Finding</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    PERFORMANCE · MEDIUM
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Using <code className="text-amber-200 bg-amber-950/50 px-1 rounded">findUnique</code> on an indexed ID field prevents full table scans. Excellent optimization. However, ensure <code className="text-amber-200 bg-amber-950/50 px-1 rounded">jwt.verify</code> is called prior to decoding to prevent malicious payload parsing.
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500 font-sans border-t border-zinc-800 pt-2">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3 text-emerald-500" /> Confidence: 98%</span>
                  <span>Autonomous Review</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- ELITE BENTO BOX FEATURES --- */}
      <section id="features" className="py-32 px-6 max-w-[90rem] mx-auto relative z-10">
        <div className="max-w-2xl mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4">
            Intelligence,<br/>
            <span className="text-zinc-500">Built for Scale.</span>
          </h2>
          <p className="text-zinc-400 text-lg font-light leading-relaxed">
            Move beyond static linters. PR Guardian understands your architecture, enforcing complex invariants autonomously.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px]">
          
          {/* Card 1: Large Span */}
          <div className="md:col-span-2 lg:col-span-2 row-span-2 relative group rounded-3xl bg-[#060c09] border border-emerald-900/30 hover:border-emerald-500/40 transition-colors duration-500 overflow-hidden flex flex-col p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-500" />
            <div className="flex-1">
              <Database className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">RAG Contextual Retrieval</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                Diffs don't tell the whole story. By embedding your repository ASTs into Pinecone, PR Guardian retrieves downstream callers, interfaces, and shared utilities to evaluate changes against the full system topology.
              </p>
            </div>
            {/* Decorative element */}
            <div className="h-32 mt-8 border border-emerald-500/20 rounded-xl bg-[#020403] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.2),transparent_70%)]" />
              <div className="flex items-center gap-4 text-xs font-mono text-emerald-400/50">
                <div className="px-3 py-1 border border-emerald-900/50 rounded-md">Vector DB</div>
                <ArrowRight className="w-4 h-4" />
                <div className="px-3 py-1 border border-emerald-500/30 bg-emerald-900/20 rounded-md text-emerald-300">Similarity Match</div>
                <ArrowRight className="w-4 h-4" />
                <div className="px-3 py-1 border border-emerald-900/50 rounded-md">LLM Prompt</div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl bg-[#060c09] border border-zinc-800/60 hover:border-teal-500/40 transition-colors duration-500 p-6 flex flex-col justify-between group">
            <Zap className="w-6 h-6 text-teal-400 mb-4" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Analysis</h3>
              <p className="text-xs text-zinc-400">Triggered by webhooks, completing deep scans in sub-minute intervals.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl bg-[#060c09] border border-zinc-800/60 hover:border-cyan-500/40 transition-colors duration-500 p-6 flex flex-col justify-between group">
            <ShieldAlert className="w-6 h-6 text-cyan-400 mb-4" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Severity Scoring</h3>
              <p className="text-xs text-zinc-400">Issues categorized automatically with High, Medium, or Low impact pills.</p>
            </div>
          </div>

          {/* Card 4: Tall Span */}
          <div className="md:col-span-1 lg:col-span-1 row-span-2 rounded-3xl bg-[#060c09] border border-zinc-800/60 hover:border-emerald-500/40 transition-colors duration-500 p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-900/20 to-transparent" />
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Autonomous Verdicts</h3>
            <p className="text-xs text-zinc-400 mb-8">Posts official Approve, Comment, or Request Changes states directly to GitHub.</p>
            
            {/* Timeline Graphic */}
            <div className="flex-1 border-l-2 border-zinc-800 ml-3 pl-4 space-y-4 relative z-10">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#060c09]" />
                <p className="text-[10px] text-zinc-500 uppercase">Step 1</p>
                <p className="text-xs text-zinc-300">Logic Validated</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#060c09]" />
                <p className="text-[10px] text-zinc-500 uppercase">Step 2</p>
                <p className="text-xs text-zinc-300">Security Passed</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] text-emerald-500 font-bold uppercase">Final</p>
                <p className="text-xs text-white font-bold">Approved</p>
              </div>
            </div>
          </div>

          {/* Card 5: Wide Span */}
          <div className="md:col-span-2 lg:col-span-2 row-span-1 rounded-3xl bg-[#060c09] border border-zinc-800/60 hover:border-purple-500/40 transition-colors duration-500 p-6 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-purple-900/10 to-transparent pointer-events-none" />
            <div>
              <Sliders className="w-6 h-6 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Granular Rule Injection</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Pass raw natural language instructions directly to the prompt. "Forbid 'any' types", "Require JSDoc", or "Check index limits".
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl bg-[#060c09] border border-zinc-800/60 hover:border-amber-500/40 transition-colors duration-500 p-6 flex flex-col justify-between group">
            <Sparkles className="w-6 h-6 text-amber-400 mb-4" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Trivial Auto-Approve</h3>
              <p className="text-xs text-zinc-400">Confidence-aware guardrails automatically pass docs and formatting tweaks.</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* --- PIPELINE/WORKFLOW SECTION --- */}
      <section className="py-24 border-y border-zinc-900 bg-[#010202] relative z-10">
        <div className="max-w-[90rem] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">Autonomous Pipeline</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A seamless, zero-touch operational flow. From the moment code is pushed to the final verdict, PR Guardian handles the cognitive load of routine review.
              </p>
            </div>
            
            <div className="md:w-2/3 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 w-full relative">
              {/* Connecting line */}
              <div className="hidden sm:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-zinc-800 via-emerald-500/50 to-zinc-800 -translate-y-1/2 z-0" />
              
              {[
                { label: "Webhook", icon: GitPullRequest },
                { label: "RAG Sync", icon: Database },
                { label: "Gemini", icon: Cpu },
                { label: "Verdict", icon: CheckCircle2 }
              ].map((step, i) => (
                <div key={step.label} className="flex-1 flex flex-col items-center relative z-10 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#060c09] border border-zinc-800 group-hover:border-emerald-500 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center transition-all duration-300 mb-3">
                    <step.icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-emerald-300 transition-colors">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
          Elevate Your Code Quality.
        </h2>
        <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
          Join the next generation of autonomous engineering teams. Secure your codebase and accelerate velocity today.
        </p>
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-transform duration-200 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          Start Building
        </button>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-zinc-900 bg-[#020403] py-8 px-6 relative z-10">
        <div className="max-w-[90rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-600" />
            <span className="font-bold text-xs text-zinc-500 tracking-tight">PR GUARDIAN</span>
          </div>
          
          <div className="text-[11px] text-zinc-600 font-medium">
            Designed & Engineered by <a href="https://github.com/mayank-kumar-jha" className="text-zinc-400 hover:text-emerald-400 transition-colors">Mayank Kumar Jha</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
