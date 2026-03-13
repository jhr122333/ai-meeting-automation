"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ArrowRight, ChevronRight, PenTool, FileText } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [animState, setAnimState] = useState<'recording' | 'writing'>('recording');
  const waveformBars = [28, 44, 64, 52, 72, 48, 60, 36];
  const reportLines = ["w-full", "w-4/5", "w-[92%]", "w-2/3"];
  const reportVariants = [
    {
      label: "실무진용",
      title: "액션 중심 상세 보고서",
      accent: "teal",
      description: "해야 할 일, 일정, 담당자를 빠르게 공유할 수 있는 문서 구조",
      items: ["Action item 자동 정리", "담당자 및 마감일 표기", "회의 맥락까지 함께 보존"],
    },
    {
      label: "경영진용",
      title: "결정 중심 1페이지 요약",
      accent: "emerald",
      description: "핵심 결론과 리스크만 압축해 보고하기 좋은 고밀도 포맷",
      items: ["의사결정 포인트 압축", "리스크 및 리소스 요약", "바로 공유 가능한 간결한 톤"],
    },
  ];
  const processSteps = [
    { step: "01", title: "오디오 업로드", detail: "회의 파일을 넣으면 즉시 처리 대기열에 등록" },
    { step: "02", title: "음성 분석", detail: "발화 흐름과 핵심 문장을 빠르게 추출" },
    { step: "03", title: "AI 요약", detail: "실무진용과 경영진용 포맷을 동시에 생성" },
    { step: "04", title: "즉시 공유", detail: "PDF 내보내기와 보고용 복사까지 한 번에" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimState(prev => prev === 'recording' ? 'writing' : 'recording');
    }, 3000); // 3초 마다 모드 전환
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-200 selection:text-teal-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-teal-500 to-emerald-500 p-2 rounded-lg text-white shadow-sm">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Audio Report AI</span>
          </div>
          <Link 
            href="/meeting"
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-full transition-colors flex items-center gap-1"
          >
            대시보드 로그인 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-64 -right-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]"
          >
            회의록 정리는 AI에게 맡기고,<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
              핵심 업무에 집중하세요
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            오디오 파일만 업로드하면, 우리 부서 실무진과 경영진에 맞춘 2가지 형태의 스마트한 보고서가 30초 만에 자동으로 완성됩니다.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <Link 
              href="/meeting"
              className="px-12 py-5 md:px-16 md:py-6 bg-slate-900 border border-transparent hover:bg-slate-800 text-white rounded-[1.75rem] font-black text-xl md:text-2xl shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-1 transition-all inline-flex items-center gap-4 justify-center min-w-[18rem]"
            >
              시작하기 <ArrowRight className="w-7 h-7" />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Presentation visual / mock UI representation */}
      <section className="px-6 pb-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
          >
             <div className="bg-slate-800 rounded-[1.5rem] border border-slate-100 h-[22rem] md:h-[30rem] w-full flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.22),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.12),_transparent_30%),linear-gradient(135deg,_rgba(31,41,55,0.94),_rgba(55,65,81,0.92))]"></div>
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                  transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "64px 64px",
                  }}
                />

                <div className="z-10 w-full max-w-4xl px-6 md:px-10">
                  <AnimatePresence mode="wait">
                    {animState === 'recording' ? (
                      <motion.div
                        key="recording"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -24, scale: 0.96 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]"
                      >
                        <div className="text-left">
                          <motion.div
                            className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-[0.24em] text-teal-200 backdrop-blur-md"
                            animate={{ boxShadow: ["0 0 0 rgba(45,212,191,0.0)", "0 0 24px rgba(45,212,191,0.22)", "0 0 0 rgba(45,212,191,0.0)"] }}
                            transition={{ duration: 2.4, repeat: Infinity }}
                          >
                            LIVE CAPTURE
                          </motion.div>
                          <h3 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                            음성을 실시간으로 감지하고
                            <br />
                            흐름까지 시각화합니다
                          </h3>
                          <p className="mt-4 max-w-lg text-sm md:text-base leading-7 text-slate-300">
                            회의 현장의 속도감을 살린 파형, 캡처 카드, 라이브 인디케이터로 현재 녹음 중이라는 인상을 더 선명하게 전달합니다.
                          </p>
                        </div>

                        <div className="relative flex items-center justify-center">
                          <motion.div
                            className="absolute h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
                            animate={{ scale: [0.9, 1.12, 0.94], opacity: [0.35, 0.6, 0.3] }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
                            animate={{ y: [0, -8, 0], rotate: [0, -1.5, 0] }}
                            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-200">
                                  <motion.div
                                    className="absolute inset-0 rounded-2xl border border-teal-300/40"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
                                    transition={{ duration: 1.8, repeat: Infinity }}
                                  />
                                  <Mic className="relative z-10 h-6 w-6" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">음성 녹음중</p>
                                  <p className="text-xs text-slate-300">4개의 채널을 안정적으로 수집</p>
                                </div>
                              </div>
                              <div className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-200">
                                REC
                              </div>
                            </div>

                            <div className="mt-8 flex h-32 items-end justify-between gap-2">
                              {waveformBars.map((height, index) => (
                                <motion.div
                                  key={index}
                                  className="flex-1 rounded-full bg-gradient-to-t from-teal-500 via-emerald-300 to-white/90 shadow-[0_0_24px_rgba(45,212,191,0.22)]"
                                  initial={{ height }}
                                  animate={{
                                    height: [height, height + 36, Math.max(18, height - 12), height + 18, height],
                                    opacity: [0.55, 1, 0.7, 0.95, 0.55],
                                  }}
                                  transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    delay: index * 0.08,
                                    ease: "easeInOut",
                                  }}
                                />
                              ))}
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                              {["핵심 발언 포착", "문맥 자동 정렬"].map((label, index) => (
                                <motion.div
                                  key={label}
                                  className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-200"
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 2.6, delay: index * 0.2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  {label}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="writing"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -24, scale: 0.96 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr]"
                      >
                        <div className="relative order-2 md:order-1">
                          <motion.div
                            className="absolute -left-4 top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"
                            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.25, 0.55, 0.25] }}
                            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="relative mx-auto max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
                            animate={{ y: [0, -10, 0], rotate: [0, 1.2, 0] }}
                            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                                  <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">보고서 작성중</p>
                                  <p className="text-xs text-slate-300">직원용, 경영진용 포맷 동시 생성</p>
                                </div>
                              </div>
                              <motion.div
                                className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100"
                                animate={{ opacity: [0.55, 1, 0.55] }}
                                transition={{ duration: 1.6, repeat: Infinity }}
                              >
                                AI DRAFT
                              </motion.div>
                            </div>

                            <div className="mt-6 rounded-[1.5rem] bg-white/90 p-5 shadow-inner shadow-emerald-100/30">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-bold text-slate-900">주간 회의 요약</p>
                                  <p className="text-xs text-slate-500">03.13 auto-generated</p>
                                </div>
                                <motion.div
                                  className="rounded-xl bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
                                  animate={{ y: [0, -2, 0] }}
                                  transition={{ duration: 1.8, repeat: Infinity }}
                                >
                                  92%
                                </motion.div>
                              </div>

                              <div className="mt-5 space-y-3">
                                {reportLines.map((lineClass, index) => (
                                  <motion.div
                                    key={lineClass}
                                    className={`h-2.5 rounded-full bg-slate-200 ${lineClass}`}
                                    animate={{ scaleX: [0.3, 1], opacity: [0.35, 1, 0.75] }}
                                    transition={{
                                      duration: 1.2,
                                      delay: index * 0.18,
                                      repeat: Infinity,
                                      repeatDelay: 0.6,
                                      ease: "easeOut",
                                    }}
                                    style={{ originX: 0 }}
                                  />
                                ))}
                              </div>

                              <motion.div
                                className="absolute bottom-9 right-9 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg"
                                animate={{
                                  x: [0, -14, 6, 0],
                                  y: [0, 8, -6, 0],
                                  rotate: [0, -10, 6, 0],
                                }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <PenTool className="h-5 w-5 text-slate-700" />
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="order-1 text-left md:order-2">
                          <motion.div
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-[0.24em] text-emerald-200 backdrop-blur-md"
                            animate={{ boxShadow: ["0 0 0 rgba(16,185,129,0.0)", "0 0 24px rgba(16,185,129,0.22)", "0 0 0 rgba(16,185,129,0.0)"] }}
                            transition={{ duration: 2.4, repeat: Infinity }}
                          >
                            SMART COMPOSE
                          </motion.div>
                          <h3 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                            녹음이 끝나면 곧바로
                            <br />
                            보고서 초안이 살아납니다
                          </h3>
                          <p className="mt-4 max-w-lg text-sm md:text-base leading-7 text-slate-300">
                            AI가 문장 밀도와 요약 진행률을 동시에 보여줘서, 단순한 로딩이 아니라 실제로 문서를 만들어내는 경험처럼 느껴지게 구성했습니다.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-4">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-500">
                OUTPUT FLOW
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                보고는 더 빠르게, 전달은 더 정확하게
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 pb-6 text-slate-700">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Time Saved</span>
              <p className="text-lg font-bold md:text-2xl">
                2시간 걸리던 회의록 작업을 <span className="text-teal-600">30초 초안</span>으로 줄입니다.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-8 rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_rgba(236,253,250,0.9),_rgba(241,245,249,0.96))] p-6 text-slate-900 shadow-lg shadow-slate-200/50"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-500">PROCESS TIMELINE</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">업로드 후 바로 보고까지</h3>
              </div>
              <p className="text-sm text-slate-600 md:text-base">
                평균 완료 시간 <span className="font-bold text-emerald-600">약 30초</span>
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {processSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/75 p-5 shadow-sm shadow-slate-200/70 backdrop-blur-sm"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, delay: index * 0.15, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300" />
                  <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">{item.step}</p>
                  <p className="mt-4 text-xl font-bold text-slate-900">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reportVariants.map((variant, index) => (
              <motion.div
                key={variant.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={`rounded-[1.75rem] border p-6 ${
                  variant.accent === "teal"
                    ? "border-teal-100 bg-gradient-to-br from-teal-50 to-white"
                    : "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      variant.accent === "teal"
                        ? "bg-teal-500 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {variant.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">AUTO FORMAT</span>
                </div>
                <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900">{variant.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{variant.description}</p>
                <div className="mt-6 space-y-3">
                  {variant.items.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          variant.accent === "teal" ? "bg-teal-500" : "bg-emerald-500"
                        }`}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-8 pt-0 border-t border-slate-200 text-center text-slate-500 text-sm bg-slate-50">
        © 2026 AX Education Team. All Rights Reserved.
      </div>
    </div>
  );
}
