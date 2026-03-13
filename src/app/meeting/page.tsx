"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Mic, Upload, FileAudio, Loader2, PlayCircle, AlertCircle, FileText, Users, Briefcase, Download, Copy, CheckCircle2, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface HistoryItem {
  id: string;
  date: string;
  filename: string;
  staffReport: string;
  execReport: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildDemoStaffReport = (filename: string) => `## 🎯 회의 세부 안건

업로드된 **${filename}** 기준으로 AI가 데모 분석한 실무진용 보고서입니다. 실제 배포 버전에서는 회의 음성 내용을 기반으로 액션 아이템, 담당자, 마감 일정을 자동 정리합니다.

## ✅ 액션 아이템 테이블 (Action Items)
| 담당자 | 업무 내용 | 마감 기한 | 우선순위 |
|---|---|---|---|
| 김현우 | 회의 내용 바탕으로 1차 실행안 정리 | 03/15 | High |
| 이수민 | 관련 부서 일정 재확인 및 공유 | 03/18 | Medium |
| 박지훈 | 리스크 항목 업데이트 후 팀 슬랙 공유 | 03/19 | High |

## 🛠 세부 논의 및 결정 사항

- 현행 회의록 작성 방식은 사람별 정리 방식이 달라 결과물 편차가 큼
- 보고 대상에 따라 상세본과 요약본을 따로 다시 써야 해서 시간이 이중으로 소요됨
- 데모 버전에서는 업로드 이후 곧바로 비교 가능한 2종 문서를 생성하는 흐름을 보여줌

## 🚀 향후 진행 절차 (Next Steps)

1. 다음 회의부터 음성 파일 업로드를 표준 프로세스로 적용
2. 실무진용 보고서는 담당자/마감일 중심으로 바로 실행
3. 경영진용 요약본은 의사결정 포인트 중심으로 별도 공유`;

const buildDemoExecReport = (filename: string) => `## 📊 경영 목표 및 요약 (Executive Summary)

**${filename}**를 기반으로 생성된 데모용 경영진 보고서입니다. 실제 서비스에서는 회의 목적, 핵심 결론, 리스크와 필요한 리소스를 1페이지 요약 형식으로 자동 정리합니다.

이번 데모의 핵심 메시지는 회의록 작성 시간을 줄이고, 보고 대상별 문서를 동시에 생성해 의사결정 속도를 높일 수 있다는 점입니다.

## ⚠️ 리스크 및 리소스 관리 현황
| 항목 분류 | 세부 내용 | 리소스 (예산/인력/일정) | 심각도 |
|---|---|---|---|
| 운영 | 보고서 포맷이 부서별로 달라 수기 조정 필요 | 운영 리드 1명, 주 2시간 | Medium |
| 일정 | 회의 후 정리와 공유 사이 리드타임 발생 | 즉시 공유 프로세스 도입 필요 | High |
| 실행 | 액션 아이템 누락 가능성 | 자동 추출 로직으로 보완 가능 | Medium |

## 💡 핵심 전략 결정 (Key strategic decisions)

- 회의 결과물은 실무진용과 경영진용을 분리해 동시에 생성한다
- 데모 단계에서는 정적 사이트에서도 흐름을 충분히 보여줄 수 있도록 샘플 생성 방식을 사용한다
- 향후 실제 운영 전환 시에는 실음성 분석 API와 연결해 자동 보고 체계로 확장한다`;

async function streamDemoReport(
  report: string,
  setReport: React.Dispatch<React.SetStateAction<string>>,
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>,
) {
  let cursor = 0;

  while (cursor < report.length) {
    const nextChunk = Math.min(report.length, cursor + 36);
    cursor = nextChunk;
    setReport(report.slice(0, cursor));
    await wait(28);
  }

  setStreaming(false);
}

function StreamingIndicator({
  tone,
}: {
  tone: "blue" | "amber";
}) {
  const toneClasses =
    tone === "blue"
      ? {
          dot: "bg-blue-500",
          text: "text-blue-700",
          line: "from-blue-200 via-slate-200 to-blue-100",
          panel: "border-blue-100 bg-blue-50/60",
        }
      : {
          dot: "bg-amber-500",
          text: "text-amber-700",
          line: "from-amber-200 via-slate-200 to-amber-100",
          panel: "border-amber-100 bg-amber-50/60",
        };

  return (
    <div className={`rounded-3xl border p-6 ${toneClasses.panel}`}>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className={`h-2.5 w-2.5 rounded-full ${toneClasses.dot}`}
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -5, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.16, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`h-3 rounded-full bg-gradient-to-r ${toneClasses.line}`}
            animate={{ opacity: [0.35, 0.9, 0.35], scaleX: [0.55, 1, 0.72] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.14, ease: "easeInOut" }}
            style={{
              width: index === 0 ? "88%" : index === 1 ? "100%" : index === 2 ? "76%" : "92%",
              originX: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MeetingAgentIndex() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStaffStreaming, setIsStaffStreaming] = useState(false);
  const [isExecStreaming, setIsExecStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [staffReport, setStaffReport] = useState<string>("");
  const [execReport, setExecReport] = useState<string>("");
  const [copiedStaff, setCopiedStaff] = useState(false);
  const [copiedExec, setCopiedExec] = useState(false);
  
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const staffRef = useRef<HTMLDivElement>(null);
  const execRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("meetingHistory");
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (filename: string, staffText: string, execText: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString("ko-KR", { 
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' 
      }),
      filename,
      staffReport: staffText,
      execReport: execText
    };
    
    setHistoryList(prev => {
      const updated = [newItem, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem("meetingHistory", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectHistory = (id: string) => {
    const item = historyList.find(i => i.id === id);
    if (item) {
      setSelectedHistoryId(id);
      setStaffReport(item.staffReport);
      setExecReport(item.execReport);
      setFile(null);
      setErrorMsg("");
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistoryList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("meetingHistory", JSON.stringify(updated));
      return updated;
    });

    setSelectedHistoryId((prev) => (prev === id ? null : prev));
    if (selectedHistoryId === id) {
      setFile(null);
      setStaffReport("");
      setExecReport("");
      setIsStaffStreaming(false);
      setIsExecStreaming(false);
      setErrorMsg("");
    }
  };

  const startNewUpload = () => {
    setSelectedHistoryId(null);
    setFile(null);
    setStaffReport("");
    setExecReport("");
    setIsStaffStreaming(false);
    setIsExecStreaming(false);
    setErrorMsg("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupFile(e.dataTransfer.files[0]);
    }
  };

  const setupFile = (selectedFile: File) => {
    setErrorMsg("");
    if (!selectedFile.type.startsWith("audio/")) {
      setErrorMsg("오디오 파일(mp3, wav, m4a 등)만 업로드 가능합니다.");
      return;
    }
    setFile(selectedFile);
    setStaffReport("");
    setExecReport("");
    setIsStaffStreaming(false);
    setIsExecStreaming(false);
  };

  const copyToClipboard = (text: string, type: 'staff' | 'exec') => {
    navigator.clipboard.writeText(text);
    if (type === 'staff') {
      setCopiedStaff(true);
      setTimeout(() => setCopiedStaff(false), 2000);
    } else {
      setCopiedExec(true);
      setTimeout(() => setCopiedExec(false), 2000);
    }
  };

  const downloadPDF = async (elementRef: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!elementRef.current) return;
    try {
      const canvas = await html2canvas(elementRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (error) {
      console.error("PDF 다운로드 실패:", error);
    }
  };

  const analyzeAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setIsStaffStreaming(true);
    setIsExecStreaming(true);
    setErrorMsg("");
    setStaffReport("");
    setExecReport("");

    try {
      const staffDemoReport = buildDemoStaffReport(file.name);
      const execDemoReport = buildDemoExecReport(file.name);

      await Promise.all([
        streamDemoReport(staffDemoReport, setStaffReport, setIsStaffStreaming),
        streamDemoReport(execDemoReport, setExecReport, setIsExecStreaming),
      ]);

      saveToHistory(file.name, staffDemoReport, execDemoReport);
    } catch (error) {
      console.error(error);
      setErrorMsg("데모 보고서 생성 중 오류가 발생했습니다.");
      setIsStaffStreaming(false);
      setIsExecStreaming(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500/10 p-2 rounded-lg text-teal-600">
            <Mic className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-700">
            Audio Report AI
          </span>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full flex gap-8">
        
        {/* Left Sidebar: History List */}
        <aside className="w-80 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[calc(100vh-6rem)] sticky top-24">
          <button 
            onClick={startNewUpload}
            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mb-6
              ${!selectedHistoryId && !staffReport ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Mic className="w-5 h-5" /> 새 회의록 작성
          </button>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">최근 생성 기록</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {historyList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">저장된 회의록이 없습니다.</p>
            ) : (
              historyList.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectHistory(item.id)}
                  className={`group p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-2 border
                    ${selectedHistoryId === item.id 
                      ? 'bg-teal-50 border-teal-200 text-teal-800' 
                      : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-sm truncate">{item.filename}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistory(item.id);
                      }}
                      className={`shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition-all ${
                        selectedHistoryId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                      }`}
                      aria-label={`${item.filename} 기록 삭제`}
                      title="기록 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs opacity-60">{item.date}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 max-w-5xl">
          {!selectedHistoryId ? (
            <>
              {/* Header Area */}
              <div className="mb-10 text-center max-w-2xl mx-auto mt-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">회의 음성 기반 <span className="text-teal-600">듀얼 보고서</span> 자동 생성</h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  회의 녹음 파일을 업로드 하시면 AI가 음성을 직접 분석하여<br/>
                  실무진용 상세 문서와 경영진용 요약 문서를 동시에 작성해 드립니다.
                </p>
              </div>

              {/* Upload Area */}
              <div className="max-w-3xl mx-auto mb-12">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all bg-white relative overflow-hidden shadow-sm
                    ${file ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 hover:border-teal-300 hover:bg-slate-50'}
                    ${isProcessing ? 'pointer-events-none opacity-80' : 'cursor-pointer'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="audio/*" 
                    className="hidden" 
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center z-10 w-full">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-teal-600 border-4 border-white shadow-sm">
                        <FileAudio className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-slate-800 text-lg truncate max-w-xs">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Audio Format"}</p>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); analyzeAudio(); }}
                        disabled={isProcessing}
                        className="mt-6 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 transition-all flex items-center gap-3 z-20 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlayCircle className="w-6 h-6" />}
                        {isProcessing ? "음성 인식 및 보고서 2종 동시 생성 중..." : "AI 회의 분석 시작"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center z-10 opacity-70 py-8">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                        <Upload className="w-10 h-10" />
                      </div>
                      <p className="font-bold text-slate-700 text-xl mb-2">여기로 오디오 파일을 드래그 하세요</p>
                      <p className="text-base text-slate-500">또는 클릭하여 브라우저에서 선택 (mp3, wav 등)</p>
                    </div>
                  )}
                  
                  {/* Background decorative blur */}
                  {file && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-100/20 blur-[80px] rounded-full pointer-events-none" />}
                </div>
                
                {errorMsg && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 text-sm border border-red-100 font-medium">
                    <AlertCircle className="w-5 h-5" /> {errorMsg}
                  </div>
                )}
              </div>
            </>
          ) : null}

          {/* Dual Report View */}
          {(staffReport || execReport || isProcessing) && (
            <div className="grid gap-8 pb-20 xl:grid-cols-2">
              {/* 실무진 패널 */}
            <motion.div 
              initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[700px]"
            >
              <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-0.5">실무진용 (Staff) 보고서</h3>
                    <p className="text-sm text-slate-500">액션 아이템, 담당자, 세부 논의 사항 중심</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isStaffStreaming && (
                    <div className="rounded-full bg-blue-50 px-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                  {staffReport && !isProcessing && (
                    <>
                      <button onClick={() => copyToClipboard(staffReport, 'staff')} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="마크다운 복사">
                        {copiedStaff ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button onClick={() => downloadPDF(staffRef, 'staff_report.pdf')} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="PDF 다운로드">
                        <Download className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div ref={staffRef} className="p-8 flex-1 overflow-y-auto prose prose-base max-w-none prose-h2:text-blue-700 prose-li:marker:text-blue-500
                prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-th:bg-blue-50 prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-slate-200 prose-td:p-3 prose-td:border prose-td:border-slate-200">
                {staffReport ? (
                  <div className="space-y-6">
                    {isStaffStreaming && <StreamingIndicator tone="blue" />}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{staffReport}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                    {isStaffStreaming ? (
                      <div className="w-full max-w-xl opacity-100">
                        <StreamingIndicator tone="blue" />
                      </div>
                    ) : (
                      <>
                        <FileText className="w-16 h-16" />
                        <p className="text-lg">AI가 음성을 듣고 마크다운을 작성 중입니다...</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* 경영진 패널 */}
            <motion.div 
               initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}} transition={{delay: 0.15}}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[700px]"
            >
              <div className="bg-amber-50/50 border-b border-amber-100 px-8 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-0.5">경영진용 (Executive) 보고서</h3>
                    <p className="text-sm text-slate-500">회의 목적, 핵심 결과, 리스크/리소스 중심 1장 요약</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExecStreaming && (
                    <div className="rounded-full bg-amber-50 px-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                  {execReport && !isProcessing && (
                    <>
                      <button onClick={() => copyToClipboard(execReport, 'exec')} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="마크다운 복사">
                        {copiedExec ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button onClick={() => downloadPDF(execRef, 'executive_report.pdf')} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="PDF 다운로드">
                        <Download className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div ref={execRef} className="p-8 flex-1 overflow-y-auto prose prose-base max-w-none prose-h2:text-amber-700 prose-h3:text-amber-800
                prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-th:bg-amber-50 prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-slate-200 prose-td:p-3 prose-td:border prose-td:border-slate-200">
                {execReport ? (
                  <div className="space-y-6">
                    {isExecStreaming && <StreamingIndicator tone="amber" />}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{execReport}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                    {isExecStreaming ? (
                      <div className="w-full max-w-xl opacity-100">
                        <StreamingIndicator tone="amber" />
                      </div>
                    ) : (
                      <>
                        <FileText className="w-16 h-16" />
                        <p className="text-lg">AI가 음성을 듣고 마크다운을 작성 중입니다...</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
