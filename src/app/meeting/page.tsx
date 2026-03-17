"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Upload, FileAudio, Loader2, PlayCircle, AlertCircle, FileText, Users, Briefcase, Download, Copy, CheckCircle2, X, MessageSquare, LayoutList, Zap, ChevronDown, Volume2, Scissors, Type, UserCheck, TrendingUp, CheckSquare, ShieldAlert, Pencil, RotateCcw, Save,
  Send, Mail, Hash, Plus, Cloud
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import PptxGenJS from "pptxgenjs";

interface HistoryItem {
  id: string;
  date: string;
  filename: string;
  staffReport: string;
  execReport: string;
  staffFormatId?: FormatId;
  execFormatId?: ExecFormatId;
}

// ────────────────────────────────────────────────────────────
// 포맷 정의 — 실무진용
// ────────────────────────────────────────────────────────────
type FormatId = "conversation" | "formal" | "action";

interface ReportFormat {
  id: FormatId;
  icon: React.ReactNode;
  name: string;
  desc: string;
  preview: string;
}

const STAFF_FORMATS: ReportFormat[] = [
  {
    id: "formal",
    icon: <LayoutList className="w-5 h-5" />,
    name: "공식 문서형",
    desc: "기안·결재용 A4 보고서 스타일",
    preview: "제 목: 회의록 자동화 도입 검토\n1. 개요\n2. 현황 분석\n3. 결론 및 건의",
  },
  {
    id: "conversation",
    icon: <MessageSquare className="w-5 h-5" />,
    name: "대화형",
    desc: "발화자별 발언 + 액션 아이템",
    preview: "👤 김현우\n\"회의록 방식이 사람마다...\"\n✅ 할 일: 실행안 정리 → 3/15",
  },
  {
    id: "action",
    icon: <Zap className="w-5 h-5" />,
    name: "액션 중심형",
    desc: "할 일·담당자·기한 집중 정리",
    preview: "🔴 High | 김현우 | 3/15\n실행안 1차 정리 및 공유\n\n🟡 Medium | 이수민 | 3/18",
  },
];

// ────────────────────────────────────────────────────────────
// 포맷 정의 — 경영진용
// ────────────────────────────────────────────────────────────
type ExecFormatId = "official" | "summary" | "risk";

// ────────────────────────────────────────────────────────────
// 언어 설정
// ────────────────────────────────────────────────────────────
type LanguageId = "ko" | "en" | "bilingual";

interface Language {
  id: LanguageId;
  flag: string;
  name: string;
  desc: string;
}

const LANGUAGES: Language[] = [
  { id: "ko",       flag: "🇰🇷", name: "한국어",   desc: "Korean" },
  { id: "en",       flag: "🇺🇸", name: "English",  desc: "영어" },
  { id: "bilingual",flag: "🌐", name: "이중 언어", desc: "KO + EN" },
];

interface ExecReportFormat {
  id: ExecFormatId;
  icon: React.ReactNode;
  name: string;
  desc: string;
  preview: string;
}

const EXEC_FORMATS: ExecReportFormat[] = [
  {
    id: "official",
    icon: <FileText className="w-5 h-5" />,
    name: "공식 문서형",
    desc: "결재·배포용 경영진 정식 보고서",
    preview: "제 목: AI 회의록 자동화 도입 검토\n1. 회의 개요\n2. 주요 논의사항\n3. 의사결정 및 후속조치",
  },
  {
    id: "summary",
    icon: <TrendingUp className="w-5 h-5" />,
    name: "핵심 요약형",
    desc: "KPI · 결과 · 후속조치 1페이지",
    preview: "| 항목 | 현재 → 개선 후 |\n|------|----------------|\n| 작성 시간 | 2h → 30min |\n| 배포 속도 | 48h → 즉시 |",
  },
  {
    id: "risk",
    icon: <ShieldAlert className="w-5 h-5" />,
    name: "리스크 중심형",
    desc: "리스크 등급 · 대응방안 · 기회요인",
    preview: "🔴 보안 이슈 → 내부 서버 전환\n🟡 도입 지연 → 담당자 지정\n🟢 기회: 전사 표준화 가능",
  },
];

// ────────────────────────────────────────────────────────────
// 실무진용 데모 데이터
// ────────────────────────────────────────────────────────────
const DEMO_STAFF: Record<FormatId, (filename: string) => string> = {
  conversation: (filename) => `## 💬 누가 뭐라고 했나요
**${filename} 기준 데모 분석** · 실제 배포 버전에서는 음성에서 발화자를 자동으로 구분합니다.

---

### 👤 김현우

> "회의록 작성 방식이 사람마다 달라서 결과물 편차가 너무 크다고 생각해요."

- 보고 대상에 따라 상세본/요약본을 따로 써야 해서 시간이 두 배로 낭비됨
- 이번 데모가 그 문제를 해결할 수 있는 방향이라고 긍정적으로 평가
- ✅ **할 일:** 회의 내용 바탕으로 1차 실행안 정리 → **3/15까지 (High)**

---

### 👤 이수민

> "관련 부서 일정이 아직 확정이 안 됐어요. 제가 다시 확인해볼게요."

- 부서 간 일정 싱크가 맞지 않아 공유 타이밍이 계속 늦어지고 있다고 언급
- 자동 보고서 생성이 되면 공유 속도도 빨라질 것 같다고 동의
- ✅ **할 일:** 관련 부서 일정 재확인 후 팀에 공유 → **3/18까지 (Medium)**

---

### 👤 박지훈

> "리스크 항목이 아직 최신화가 안 돼 있어요. 업데이트하고 슬랙에 올릴게요."

- 현재 리스크 목록이 2주 전 기준으로 멈춰 있다고 지적
- 팀 슬랙에 공유하면 경영진용 요약과도 연계가 될 것 같다고 제안
- ✅ **할 일:** 리스크 항목 업데이트 후 팀 슬랙 공유 → **3/19까지 (High)**

---

### 📋 오늘 결정된 것들

- 다음 회의부터 음성 파일 업로드를 표준 프로세스로 적용하기로 합의
- 실무진용 / 경영진용 보고서 동시 생성 체계 도입 검토
- 부서별 일정 재확인 후 전체 공유 예정`,

  formal: (filename) => `## 회의 결과 보고 (실무진용)

**문서번호:** AX-2026-031301  **작성일:** 2026. 03. 13.  **작성자:** 자동생성 (${filename})

---

### 제1조 (회의 개요)

1. **일시:** 2026. 03. 13. 14:00 ~ 15:00
2. **장소:** 대회의실 3층
3. **참석자:** 김현우(팀장), 이수민(PO), 박지훈(리스크 담당) 외 2명
4. **회의 목적:** AI 기반 회의록 자동화 도구 도입 타당성 검토

---

### 제2조 (논의 사항)

**2-1. 현황 진단**

현재 부서별 회의록 작성 방식이 상이하여 산출물 품질 편차가 심화되고 있음. 담당자에 따라 상세본·요약본을 이중으로 작성하는 관행으로 주당 평균 2시간의 추가 업무 발생이 확인됨.

**2-2. 검토 방향**

AI 기반 자동 생성 시스템을 통해 실무진용·경영진용 보고서를 동시 출력하는 방식을 표준화하기로 방향을 설정함.

---

### 제3조 (결정 사항)

1. 차기 회의부터 음성 업로드 방식을 표준 프로세스로 채택한다.
2. 부서별 표준 템플릿 배포 및 가이드라인을 수립한다.
3. 일정 재확인 후 전체 공지한다. (담당: 이수민, 기한: 3/18)

---

### 제4조 (후속 조치)

| 순번 | 담당자 | 업무 내용 | 기한 | 우선순위 |
|---|---|---|---|---|
| 1 | 김현우 | 1차 실행안 정리 및 팀 내 공유 | 3/15 | High |
| 2 | 이수민 | 관련 부서 일정 재확인 및 공지 | 3/18 | Medium |
| 3 | 박지훈 | 리스크 항목 최신화 후 슬랙 게시 | 3/19 | High |`,

  action: (filename) => `## ⚡ 액션 아이템 전체 목록

**${filename}** · 추출일: 2026. 03. 13. · 총 3개 액션

---

### 🔴 High 우선순위

#### 1. 1차 실행안 정리 및 공유
- **담당:** 김현우
- **기한:** 3/15 (금)
- **내용:** 오늘 회의 내용 바탕으로 AI 도입 실행안 초안 작성 후 팀 전체 공유

#### 2. 리스크 항목 최신화 및 슬랙 공유
- **담당:** 박지훈
- **기한:** 3/19 (수)
- **내용:** 2주 전 기준으로 멈춰 있는 리스크 목록 업데이트 → 팀 슬랙 #risk-mgmt 채널 게시

---

### 🟡 Medium 우선순위

#### 3. 관련 부서 일정 재확인 및 공지
- **담당:** 이수민
- **기한:** 3/18 (화)
- **내용:** 연관 부서 담당자 연락 → 일정 확정 후 전체 공지

---

### 📊 요약

| 우선순위 | 건수 | 최종 기한 |
|---|---|---|
| 🔴 High | 2건 | 3/19 |
| 🟡 Medium | 1건 | 3/18 |`,
};

// ────────────────────────────────────────────────────────────
// 경영진용 데모 데이터 (ExecFormatId 기반)
// ────────────────────────────────────────────────────────────
const DEMO_EXEC: Record<ExecFormatId, (filename: string) => string> = {
  official: (filename) => `## 경영진 회의 결과 보고

**문서번호:** AX-2026-031301  **작성일:** 2026. 03. 13.  **작성자:** 자동생성 (${filename})

---

### 제1조 (회의 개요)

| 항목 | 내용 |
|---|---|
| 일시 | 2026. 03. 13. 14:00 ~ 15:00 |
| 장소 | 대회의실 3층 |
| 참석자 | 김현우(팀장), 이수민(PO), 박지훈(리스크 담당) 외 2명 |
| 주관 | AX Education Team |
| 회의 목적 | AI 기반 회의록 자동화 도구 도입 타당성 검토 |

---

### 제2조 (주요 논의 사항)

**2-1. 현황 진단**

현재 부서별 회의록 작성 방식의 표준화 미흡으로 산출물 품질 편차가 심화되고 있으며, 담당자별 상세본·요약본 이중 작성 관행으로 인해 주당 평균 2시간의 추가 업무 부담이 발생하고 있음.

**2-2. 도입 방향**

AI 기반 자동 생성 시스템을 통해 실무진용·경영진용 보고서를 단일 음성 파일에서 동시 출력하는 방식을 표준 프로세스로 채택하기로 방향을 설정함.

---

### 제3조 (의사결정 사항)

1. 차기 회의부터 음성 업로드 방식을 공식 프로세스로 채택한다.
2. 부서별 표준 템플릿 및 운영 가이드라인을 수립·배포한다.
3. 4주 파일럿 운영 후 전사 확산 여부를 재보고한다.

---

### 제4조 (후속 조치)

| 순번 | 담당자 | 업무 내용 | 기한 | 우선순위 |
|---|---|---|---|---|
| 1 | 김현우 | 1차 실행안 수립 및 내부 공유 | 3/15 | High |
| 2 | 이수민 | 부서 간 일정 조율 및 전파 | 3/18 | Medium |
| 3 | 박지훈 | 리스크 목록 최신화 및 슬랙 게시 | 3/19 | High |`,

  summary: (filename) => `## 회의 결과 요약 보고

| 보고일자 | 2026. 03. 13. |
|---|---|
| 보고부서 | AX Education Team |
| 관련파일 | ${filename} |
| 회의일시 | 2026. 03. 13. 14:00 ~ 15:00 |
| 참석자 | 김현우, 이수민, 박지훈 외 2명 |

---

### 핵심 성과 지표 (KPI)

| 지표 | 현재 | 도입 후 (예상) | 개선율 |
|---|---|---|---|
| 회의록 작성 시간 | 주 평균 2시간 | 30분 이하 | **↓ 75%** |
| 보고서 배포 속도 | 24~48시간 | 즉시 | **↓ 100%** |
| 표준화율 | 약 30% | 100% | **↑ 70%p** |
| 보고서 버전 편차 | 높음 | 없음 | **해소** |

---

### 의사결정 요약

1. 음성 업로드 표준 프로세스 채택 → **승인**
2. 실무진·경영진 이중 보고서 자동 생성 체계 → **승인**
3. 단계적 전사 확산 일정 수립 → **검토 진행 중**

---

### 후속 조치 계획

| 담당 | 내용 | 기한 |
|---|---|---|
| 김현우 | 1차 실행안 수립 및 팀 공유 | 3/15 |
| 이수민 | 관련 부서 일정 조율 및 공지 | 3/18 |
| 박지훈 | 리스크 목록 최신화 | 3/19 |`,

  risk: (filename) => `## 리스크 및 기회 분석

**작성일:** 2026. 03. 13.  **관련파일:** ${filename}

---

### 리스크 매트릭스

| 리스크 항목 | 발생 가능성 | 영향도 | 등급 | 대응 방안 |
|---|---|---|---|---|
| 음성 데이터 보안 유출 | 낮음 | 높음 | 🔴 | 사내 서버 전환 또는 On-premise 배포 검토 |
| 부서별 도입 저항 | 중간 | 중간 | 🟡 | 가이드라인 배포 + 담당자 교육 선행 |
| AI 전사 오류 | 중간 | 낮음 | 🟢 | 담당자 검수 프로세스 병행 운영 |
| 도입 일정 지연 | 낮음 | 낮음 | 🟢 | 담당자 지정 완료, 기한 확정됨 |

---

### 기회 요인

| 기회 | 기대 가치 | 실현 시점 |
|---|---|---|
| 전사 표준화 → 보고 품질 균일화 | 높음 | 도입 즉시 |
| 회의록 아카이빙 자동화 | 중간 | 1개월 내 |
| 경영진 의사결정 속도 향상 | 높음 | 도입 즉시 |
| 부서 간 정보 비대칭 해소 | 중간 | 2개월 내 |

---

### 권고 사항

1. **보안 우선 조치:** 음성 파일이 외부 API로 전송되지 않도록 사내 인프라 배포 방식 우선 검토
2. **파일럿 운영:** 1개 부서에서 4주 시범 운영 후 전사 확산 결정
3. **모니터링:** AI 전사 정확도 주간 검수 후 임계값(95%) 미달 시 수동 보완`,
};

// ────────────────────────────────────────────────────────────
// 영어 데모 데이터
// ────────────────────────────────────────────────────────────
const DEMO_STAFF_EN: Record<FormatId, (filename: string) => string> = {
  conversation: (filename) => `## 💬 Who Said What
**Demo analysis of ${filename}** · In production, speakers are identified automatically from audio.

---

### 👤 Kim Hyunwoo

> "The inconsistency in how meeting minutes are written across teams creates a huge variance in output quality."

- Writing separate detailed and summary reports for different audiences wastes double the time
- Expressed optimism that this demo directly addresses the root cause
- ✅ **Action:** Draft initial implementation plan based on today's meeting → **By 3/15 (High)**

---

### 👤 Lee Sumin

> "The related department schedules haven't been confirmed yet. I'll follow up on those."

- Ongoing sync issues keep causing delays in information sharing
- Agreed that automated report generation would significantly speed up distribution
- ✅ **Action:** Confirm cross-department schedules and share with team → **By 3/18 (Medium)**

---

### 👤 Park Jihoon

> "The risk items haven't been updated yet. I'll update them and post to Slack."

- Pointed out that the current risk list is based on data from two weeks ago
- Suggested linking Slack updates to the executive summary pipeline
- ✅ **Action:** Update risk items and post to team Slack → **By 3/19 (High)**

---

### 📋 Decisions Made Today

- Agreed to adopt audio upload as the standard process starting next meeting
- Reviewing introduction of simultaneous staff/executive dual-report generation
- Cross-department schedule confirmation and team announcement pending`,

  formal: (filename) => `## Meeting Minutes (Staff Report)

**Doc No:** AX-2026-031301  **Date:** March 13, 2026  **Author:** Auto-generated (${filename})

---

### Article 1 (Meeting Overview)

1. **Date/Time:** March 13, 2026, 14:00 – 15:00
2. **Location:** Conference Room 3F
3. **Attendees:** Kim Hyunwoo (Team Lead), Lee Sumin (PO), Park Jihoon (Risk Manager), +2
4. **Purpose:** Review feasibility of AI-based meeting minute automation

---

### Article 2 (Discussion Items)

**2-1. Current State Assessment**

Meeting documentation practices vary significantly across departments, creating inconsistent output quality. Writing separate detailed and summary versions for different audiences results in an average of 2 extra work hours per week.

**2-2. Proposed Direction**

Agreed to standardize an AI-based auto-generation system that simultaneously outputs staff and executive reports from a single audio file.

---

### Article 3 (Decisions)

1. Adopt audio upload as the standard process from the next meeting.
2. Develop and distribute department-level standard templates and guidelines.
3. Confirm schedule and announce to all stakeholders. (Owner: Lee Sumin, Due: 3/18)

---

### Article 4 (Action Items)

| # | Owner | Task | Due | Priority |
|---|-------|------|-----|----------|
| 1 | Kim Hyunwoo | Draft implementation plan and share with team | 3/15 | High |
| 2 | Lee Sumin | Confirm cross-department schedules and announce | 3/18 | Medium |
| 3 | Park Jihoon | Update risk items and post to team Slack | 3/19 | High |`,

  action: (filename) => `## ⚡ Action Item List

**${filename}** · Extracted: March 13, 2026 · Total: 3 actions

---

### 🔴 High Priority

#### 1. Draft Initial Implementation Plan
- **Owner:** Kim Hyunwoo
- **Due:** 3/15 (Fri)
- **Details:** Draft AI adoption implementation plan based on today's meeting and share with full team

#### 2. Update Risk Items & Post to Slack
- **Owner:** Park Jihoon
- **Due:** 3/19 (Wed)
- **Details:** Update risk list (stale for 2 weeks) → Post to team Slack #risk-mgmt

---

### 🟡 Medium Priority

#### 3. Confirm Cross-Department Schedules
- **Owner:** Lee Sumin
- **Due:** 3/18 (Tue)
- **Details:** Contact cross-department leads → Confirm schedule → Announce to all stakeholders

---

### 📊 Summary

| Priority | Count | Final Due |
|----------|-------|-----------|
| 🔴 High | 2 items | 3/19 |
| 🟡 Medium | 1 item | 3/18 |`,
};

const DEMO_EXEC_EN: Record<ExecFormatId, (filename: string) => string> = {
  official: (filename) => `## Executive Meeting Report

**Doc No:** AX-2026-031301  **Date:** March 13, 2026  **Source:** ${filename}

---

### Article 1 (Meeting Overview)

| Item | Details |
|---|---|
| Date & Time | March 13, 2026, 14:00 – 15:00 |
| Location | Conference Room 3F |
| Attendees | Kim Hyunwoo (Team Lead), Lee Sumin (PO), Park Jihoon (Risk) +2 |
| Host | AX Education Team |
| Purpose | Feasibility review of AI-based meeting minutes automation |

---

### Article 2 (Key Discussion Items)

**2-1. Current State Assessment**

Lack of standardization in meeting minutes across departments has caused significant variance in output quality. The practice of preparing separate detailed and summary reports per audience adds an estimated 2 hours of extra work per person per week.

**2-2. Proposed Direction**

An AI-powered system that simultaneously generates both staff-level and executive-level reports from a single audio file will be adopted as the new standard process.

---

### Article 3 (Decisions Made)

1. Audio file upload will be adopted as the official meeting process starting from the next meeting.
2. Department-level standard templates and operational guidelines will be developed and distributed.
3. A 4-week pilot will be conducted, followed by a company-wide roll-out review.

---

### Article 4 (Action Items)

| # | Owner | Task | Due | Priority |
|---|---|---|---|---|
| 1 | Kim Hyunwoo | Draft implementation plan & share internally | 3/15 | High |
| 2 | Lee Sumin | Coordinate and communicate cross-dept schedules | 3/18 | Medium |
| 3 | Park Jihoon | Update risk list & post to Slack | 3/19 | High |`,

  summary: (filename) => `## Meeting Results Summary

| Report Date | March 13, 2026 |
|---|---|
| Department | AX Education Team |
| Source File | ${filename} |
| Meeting Time | March 13, 2026, 14:00 – 15:00 |
| Attendees | Kim Hyunwoo, Lee Sumin, Park Jihoon +2 |

---

### Key Performance Indicators (KPI)

| Metric | Current | Post-Implementation | Improvement |
|--------|---------|---------------------|-------------|
| Meeting minutes time | 2 hrs/week avg | Under 30 min | **↓ 75%** |
| Report distribution speed | 24–48 hrs | Immediate | **↓ 100%** |
| Standardization rate | ~30% | 100% | **↑ 70%p** |
| Report version variance | High | None | **Eliminated** |

---

### Decision Summary

1. Standard audio upload process adoption → **Approved**
2. Simultaneous dual-report auto-generation → **Approved**
3. Phased company-wide roll-out → **Under Review**

---

### Next Steps

| Owner | Task | Due |
|-------|------|-----|
| Kim Hyunwoo | Draft implementation plan & share with team | 3/15 |
| Lee Sumin | Confirm cross-department schedules | 3/18 |
| Park Jihoon | Update risk inventory | 3/19 |`,

  risk: (filename) => `## Risk & Opportunity Analysis

**Date:** March 13, 2026  **Source:** ${filename}

---

### Risk Matrix

| Risk Item | Likelihood | Impact | Rating | Mitigation |
|-----------|-----------|--------|--------|------------|
| Audio data security breach | Low | High | 🔴 | Evaluate on-premise or internal server deployment |
| Department resistance to adoption | Medium | Medium | 🟡 | Distribute guidelines + conduct training before launch |
| AI transcription errors | Medium | Low | 🟢 | Maintain parallel human review process |
| Implementation delay | Low | Low | 🟢 | Owner assigned, deadlines confirmed |

---

### Opportunity Factors

| Opportunity | Expected Value | Timeline |
|-------------|---------------|----------|
| Company-wide standardization → uniform quality | High | Immediate |
| Automated meeting archive | Medium | Within 1 month |
| Faster executive decision-making | High | Immediate |
| Reduced information asymmetry | Medium | Within 2 months |

---

### Recommendations

1. **Security First:** Prioritize on-premise deployment to prevent audio from reaching external APIs
2. **Pilot Program:** 4-week pilot in one department before company-wide roll-out
3. **Quality Monitoring:** Weekly transcription accuracy review; manual correction if below 95%`,
};

// ────────────────────────────────────────────────────────────
// 이중 언어 데모 데이터 (KO + EN)
// ────────────────────────────────────────────────────────────
const DEMO_STAFF_BILINGUAL: Record<FormatId, (filename: string) => string> = {
  conversation: (filename) => `## 💬 누가 뭐라고 했나요 / Who Said What
**${filename} 데모 분석 · Demo Analysis**

---

### 👤 김현우 / Kim Hyunwoo

- 🇰🇷 "회의록 작성 방식이 사람마다 달라서 결과물 편차가 너무 크다고 생각해요."
- 🇺🇸 "The inconsistency in how meeting minutes are written creates a huge variance in output quality."

- 🇰🇷 보고 대상별 상세본/요약본 이중 작성으로 시간 낭비 발생
- 🇺🇸 Writing separate reports for different audiences wastes double the time
- ✅ **할 일 / Action:** 1차 실행안 정리 → By 3/15 (High)

---

### 👤 이수민 / Lee Sumin

- 🇰🇷 "관련 부서 일정이 아직 확정이 안 됐어요. 제가 다시 확인해볼게요."
- 🇺🇸 "Related department schedules haven't been confirmed yet. I'll follow up."

- ✅ **할 일 / Action:** 부서 일정 재확인 후 공유 → By 3/18 (Medium)

---

### 👤 박지훈 / Park Jihoon

- 🇰🇷 "리스크 항목이 아직 최신화가 안 돼 있어요. 업데이트하고 슬랙에 올릴게요."
- 🇺🇸 "The risk items haven't been updated yet. I'll update and post to Slack."

- ✅ **할 일 / Action:** 리스크 최신화 후 슬랙 게시 → By 3/19 (High)

---

### 📋 오늘 결정된 것들 / Decisions Made Today

| 🇰🇷 한국어 | 🇺🇸 English |
|---|---|
| 음성 업로드 표준 프로세스 채택 | Audio upload adopted as standard process |
| 듀얼 보고서 자동 생성 체계 검토 | Dual-report auto-generation under review |
| 부서 일정 재확인 후 전체 공지 | Full announcement after schedule confirmation |`,

  formal: (filename) => `## 회의 결과 보고 / Meeting Minutes

**문서번호 / Doc No:** AX-2026-031301  **작성일 / Date:** 2026. 03. 13. / March 13, 2026

---

### 제1조 / Article 1 (회의 개요 / Overview)

| 항목 / Item | 🇰🇷 한국어 | 🇺🇸 English |
|---|---|---|
| 일시 / Date | 2026. 03. 13. 14:00~15:00 | March 13, 2026, 14:00–15:00 |
| 장소 / Location | 대회의실 3층 | Conference Room 3F |
| 참석자 / Attendees | 김현우, 이수민, 박지훈 외 2명 | Kim Hyunwoo, Lee Sumin, Park Jihoon +2 |
| 목적 / Purpose | AI 회의록 자동화 도입 검토 | AI meeting automation feasibility review |

---

### 제2조 / Article 2 (결정 사항 / Decisions)

- 🇰🇷 차기 회의부터 음성 업로드를 표준 프로세스로 채택한다.
- 🇺🇸 Adopt audio upload as the standard process from the next meeting.

- 🇰🇷 부서별 표준 템플릿 배포 및 가이드라인을 수립한다.
- 🇺🇸 Develop and distribute department-level standard templates and guidelines.

---

### 제3조 / Article 3 (후속 조치 / Action Items)

| 담당 / Owner | 🇰🇷 업무 | 🇺🇸 Task | 기한 / Due | 우선순위 |
|---|---|---|---|---|
| 김현우 | 1차 실행안 정리 | Draft implementation plan | 3/15 | High |
| 이수민 | 부서 일정 재확인 | Confirm dept. schedules | 3/18 | Medium |
| 박지훈 | 리스크 최신화 | Update risk inventory | 3/19 | High |`,

  action: (filename) => `## ⚡ 액션 아이템 / Action Item List

**${filename}** · 2026. 03. 13. · 총 3개 / Total: 3 actions

---

### 🔴 High Priority

| 항목 | 🇰🇷 한국어 | 🇺🇸 English |
|---|---|---|
| 담당 / Owner | 김현우 | Kim Hyunwoo |
| 기한 / Due | 3/15 (금/Fri) | 3/15 (Fri) |
| 내용 / Details | 1차 실행안 정리 및 팀 공유 | Draft implementation plan & share with team |

| 항목 | 🇰🇷 한국어 | 🇺🇸 English |
|---|---|---|
| 담당 / Owner | 박지훈 | Park Jihoon |
| 기한 / Due | 3/19 (수/Wed) | 3/19 (Wed) |
| 내용 / Details | 리스크 최신화 후 슬랙 게시 | Update risk list & post to Slack |

---

### 🟡 Medium Priority

| 항목 | 🇰🇷 한국어 | 🇺🇸 English |
|---|---|---|
| 담당 / Owner | 이수민 | Lee Sumin |
| 기한 / Due | 3/18 (화/Tue) | 3/18 (Tue) |
| 내용 / Details | 부서 일정 재확인 후 전체 공지 | Confirm schedules & announce to all |`,
};

const DEMO_EXEC_BILINGUAL: Record<ExecFormatId, (filename: string) => string> = {
  official: (filename) => `## 경영진 회의 결과 보고 / Executive Meeting Report

**문서번호 / Doc No:** AX-2026-031301  **작성일 / Date:** 2026. 03. 13. / March 13, 2026

---

### 제1조 / Article 1 (회의 개요 / Overview)

| 항목 / Item | 🇰🇷 한국어 | 🇺🇸 English |
|---|---|---|
| 일시 / Date | 2026. 03. 13. 14:00~15:00 | March 13, 2026, 14:00–15:00 |
| 장소 / Location | 대회의실 3층 | Conference Room 3F |
| 참석자 / Attendees | 김현우, 이수민, 박지훈 외 2명 | Kim Hyunwoo, Lee Sumin, Park Jihoon +2 |
| 목적 / Purpose | AI 회의록 자동화 도입 검토 | AI meeting automation feasibility review |

---

### 제2조 / Article 2 (주요 논의 사항 / Key Discussion Items)

- 🇰🇷 현황: 부서별 작성 방식 미표준화로 품질 편차 심화
- 🇺🇸 Current: Lack of standardization causing quality variance across departments

- 🇰🇷 방향: AI 기반 단일 파일 → 실무진·경영진 보고서 동시 생성 표준화
- 🇺🇸 Direction: Standardize AI-driven dual-report generation from a single audio file

---

### 제3조 / Article 3 (의사결정 / Decisions)

| # | 🇰🇷 결정 사항 | 🇺🇸 Decision | 결과 |
|---|---|---|---|
| 1 | 음성 업로드 공식 프로세스 채택 | Adopt audio upload as official process | ✅ |
| 2 | 표준 템플릿·가이드라인 수립 배포 | Develop & distribute standard templates | ✅ |
| 3 | 4주 파일럿 후 전사 확산 재보고 | 4-week pilot then company-wide review | ⏳ |

---

### 제4조 / Article 4 (후속 조치 / Action Items)

| 담당 / Owner | 🇰🇷 업무 | 🇺🇸 Task | 기한 / Due |
|---|---|---|---|
| 김현우 | 1차 실행안 수립 | Draft implementation plan | 3/15 |
| 이수민 | 부서 일정 조율 | Coordinate dept. schedules | 3/18 |
| 박지훈 | 리스크 목록 최신화 | Update risk inventory | 3/19 |`,

  summary: (filename) => `## 회의 결과 요약 / Meeting Results Summary

| 항목 / Item | 🇰🇷 한국어 | 🇺🇸 English |
|---|---|---|
| 보고일자 / Date | 2026. 03. 13. | March 13, 2026 |
| 보고부서 / Dept | AX Education Team | AX Education Team |
| 관련파일 / File | ${filename} | ${filename} |
| 참석자 / Attendees | 김현우, 이수민, 박지훈 외 2명 | Kim Hyunwoo, Lee Sumin, Park Jihoon +2 |

---

### 핵심 성과 지표 / Key Performance Indicators (KPI)

| 지표 / Metric | 현재 / Current | 개선 후 / After | 개선율 / Improvement |
|---|---|---|---|
| 회의록 작성 시간 / Minutes time | 주 평균 2시간 / 2 hrs/week | 30분 이하 / Under 30 min | **↓ 75%** |
| 보고서 배포 속도 / Distribution | 24~48시간 / 24–48 hrs | 즉시 / Immediate | **↓ 100%** |
| 표준화율 / Standardization | 약 30% / ~30% | 100% | **↑ 70%p** |

---

### 의사결정 요약 / Decision Summary

| 🇰🇷 한국어 | 🇺🇸 English | 결과 / Result |
|---|---|---|
| 음성 업로드 표준화 채택 | Standard audio upload adoption | ✅ 승인 / Approved |
| 이중 보고서 자동 생성 | Dual-report auto-generation | ✅ 승인 / Approved |
| 전사 확산 일정 수립 | Company-wide roll-out schedule | ⏳ 검토 / Under Review |

---

### 후속 조치 / Next Steps

| 담당 / Owner | 🇰🇷 내용 | 🇺🇸 Task | 기한 / Due |
|---|---|---|---|
| 김현우 | 1차 실행안 수립 | Draft implementation plan | 3/15 |
| 이수민 | 부서 일정 조율 | Confirm dept. schedules | 3/18 |
| 박지훈 | 리스크 목록 최신화 | Update risk inventory | 3/19 |`,


  risk: (filename) => `## 리스크 및 기회 분석 / Risk & Opportunity Analysis

**작성일 / Date:** 2026. 03. 13.  **파일 / File:** ${filename}

---

### 리스크 매트릭스 / Risk Matrix

| 리스크 / Risk | 가능성 / Likelihood | 영향도 / Impact | 등급 / Rating | 대응 / Mitigation |
|---|---|---|---|---|
| 음성 데이터 보안 / Audio security | 낮음 / Low | 높음 / High | 🔴 | 사내 서버 전환 / On-premise migration |
| 부서 저항 / Dept resistance | 중 / Medium | 중 / Medium | 🟡 | 가이드라인 배포 / Distribute guidelines |
| AI 전사 오류 / AI errors | 중 / Medium | 낮음 / Low | 🟢 | 검수 병행 / Human review |
| 일정 지연 / Delay | 낮음 / Low | 낮음 / Low | 🟢 | 담당 지정 완료 / Owner assigned |

---

### 기회 요인 / Opportunities

| 기회 / Opportunity | 가치 / Value | 시점 / Timeline |
|---|---|---|
| 전사 표준화 / Standardization | 높음 / High | 즉시 / Immediate |
| 아카이빙 자동화 / Auto-archive | 중 / Medium | 1개월 / 1 month |
| 의사결정 속도 향상 / Faster decisions | 높음 / High | 즉시 / Immediate |

---

### 권고 사항 / Recommendations

- 🇰🇷 1. 보안 우선 — 음성 파일 사내 서버 배포 방식 검토
- 🇺🇸 1. Security First — Prioritize on-premise deployment

- 🇰🇷 2. 파일럿 — 1개 부서 4주 시범 운영 후 전사 확산
- 🇺🇸 2. Pilot First — 4-week pilot in one department before roll-out`,
};

// 언어별 데모 데이터 선택 헬퍼
function getDemoStaff(format: FormatId, lang: LanguageId): (filename: string) => string {
  if (lang === "en") return DEMO_STAFF_EN[format];
  if (lang === "bilingual") return DEMO_STAFF_BILINGUAL[format];
  return DEMO_STAFF[format];
}
function getDemoExec(format: ExecFormatId, lang: LanguageId): (filename: string) => string {
  if (lang === "en") return DEMO_EXEC_EN[format];
  if (lang === "bilingual") return DEMO_EXEC_BILINGUAL[format];
  return DEMO_EXEC[format];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ────────────────────────────────────────────────────────────
// 처리 파이프라인
// ────────────────────────────────────────────────────────────
interface PipelineStep {
  id: number;
  icon: React.ReactNode;
  label: string;
  detail: string | null;
}

function ProcessingPipeline({
  currentStep,
  detectedFormat,
  speakerCount,
}: {
  currentStep: number;
  detectedFormat: string;
  speakerCount: number;
}) {
  const steps: PipelineStep[] = [
    { id: 0, icon: <FileAudio className="w-5 h-5" />, label: "오디오 포맷 감지", detail: currentStep > 0 ? `${detectedFormat} 포맷 확인됨` : null },
    { id: 1, icon: <Volume2 className="w-5 h-5" />, label: "노이즈 제거 전처리", detail: currentStep > 1 ? "배경 잡음 제거 완료" : null },
    { id: 2, icon: <Type className="w-5 h-5" />, label: "음성 → 텍스트 변환 (STT)", detail: currentStep > 2 ? "전사(transcription) 완료" : null },
    { id: 3, icon: <UserCheck className="w-5 h-5" />, label: "화자 분리 분석", detail: currentStep > 3 ? `발화자 ${speakerCount}명 감지됨` : null },
    { id: 4, icon: <Scissors className="w-5 h-5" />, label: "AI 회의록 생성", detail: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto my-8 bg-white rounded-3xl border border-slate-200 shadow-md p-8"
    >
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">처리 진행 상황</p>
      <ol className="space-y-4">
        {steps.map((step) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <li key={step.id} className="flex items-start gap-4">
              <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all
                ${isDone ? "bg-teal-500 text-white" : isActive ? "bg-teal-50 text-teal-600 border-2 border-teal-400" : "bg-slate-100 text-slate-300"}`}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : step.icon}
              </div>
              <div className="flex-1 pt-1">
                <p className={`font-semibold text-sm ${isDone ? "text-teal-700" : isActive ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
                {step.detail && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-teal-600 mt-0.5">
                    ✓ {step.detail}
                  </motion.p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}

function StreamingIndicator({ tone }: { tone: "blue" | "amber" }) {
  const toneClasses = tone === "blue"
    ? { dot: "bg-blue-500", line: "from-blue-200 via-slate-200 to-blue-100", panel: "border-blue-100 bg-blue-50/60" }
    : { dot: "bg-amber-500", line: "from-amber-200 via-slate-200 to-amber-100", panel: "border-amber-100 bg-amber-50/60" };

  return (
    <div className={`rounded-3xl border p-6 ${toneClasses.panel}`}>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className={`h-2.5 w-2.5 rounded-full ${toneClasses.dot}`}
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -5, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }} />
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} className={`h-3 rounded-full bg-gradient-to-r ${toneClasses.line}`}
            animate={{ opacity: [0.35, 0.9, 0.35], scaleX: [0.55, 1, 0.72] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
            style={{ width: i === 0 ? "88%" : i === 1 ? "100%" : i === 2 ? "76%" : "92%", originX: 0 }} />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SendModal — 이메일 / Slack 발송 설정 모달
// ────────────────────────────────────────────────────────────
function SendModal({
  onClose,
  staffContent,
  execContent,
}: {
  onClose: () => void;
  staffContent: string;
  execContent: string;
}) {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [targets, setTargets] = useState({ staff: true, exec: true });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const hasContent = staffContent.length > 0 || execContent.length > 0;

  const addEmail = () => {
    const v = emailInput.trim();
    if (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && !emails.includes(v)) {
      setEmails(prev => [...prev, v]);
      setEmailInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmail(); }
    if (e.key === "Backspace" && emailInput === "" && emails.length > 0)
      setEmails(prev => prev.slice(0, -1));
  };

  const handleSend = async () => {
    if (emails.length === 0 && !slackChannel) return;
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1800));
    setStatus("sent");
  };

  const canSend = (emails.length > 0 || slackChannel.trim().length > 0) && (targets.staff || targets.exec);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={status !== "sending" ? onClose : undefined}
        />

        {/* Card */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.93, y: 24 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
        >
          {status === "sent" ? (
            /* ── 발송 완료 화면 ── */
            <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
                className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-teal-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">발송 완료!</h3>
              <p className="text-sm text-slate-500 mb-1">
                {emails.length > 0 && <><span className="font-semibold text-slate-700">{emails.length}명</span>에게 이메일 발송<br /></>}
                {slackChannel && <><span className="font-semibold text-slate-700">#{slackChannel.replace(/^#/, "")}</span> 채널로 Slack 발송</>}
              </p>
              <p className="text-xs text-slate-400 mt-2 mb-6">
                {[targets.staff && "실무진용", targets.exec && "경영진용"].filter(Boolean).join(" · ")} 보고서가 전달됐습니다.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 bg-teal-500 text-white rounded-xl font-semibold text-sm hover:bg-teal-600 transition-colors">
                닫기
              </button>
            </div>
          ) : (
            /* ── 설정 화면 ── */
            <>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Send className="w-4 h-4 text-teal-600" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">보고서 발송</h2>
                </div>
                <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* 발송 대상 보고서 */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">발송할 보고서</p>
                  <div className="flex gap-2">
                    {[
                      { key: "staff" as const, label: "실무진용", color: "blue" },
                      { key: "exec"  as const, label: "경영진용", color: "amber" },
                    ].map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => setTargets(t => ({ ...t, [key]: !t[key] }))}
                        disabled={!hasContent}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all
                          ${targets[key]
                            ? color === "blue"
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-white text-slate-400"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 이메일 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">이메일</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 min-h-[44px] focus-within:border-teal-400 focus-within:bg-white transition-colors">
                    {emails.map(email => (
                      <span key={email} className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-teal-200">
                        {email}
                        <button onClick={() => setEmails(prev => prev.filter(e => e !== email))} className="text-teal-400 hover:text-teal-700">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={addEmail}
                      placeholder={emails.length === 0 ? "이메일 입력 후 Enter" : "추가..."}
                      className="flex-1 min-w-[140px] bg-transparent text-sm text-slate-700 placeholder-slate-300 outline-none"
                    />
                    {emailInput && (
                      <button onClick={addEmail} className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-teal-500 text-white">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">쉼표(,) 또는 Enter로 여러 명 추가</p>
                </div>

                {/* Slack */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slack 채널</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-teal-400 focus-within:bg-white transition-colors">
                    <span className="text-slate-400 text-sm font-mono">#</span>
                    <input
                      type="text"
                      value={slackChannel}
                      onChange={e => setSlackChannel(e.target.value.replace(/^#/, ""))}
                      placeholder="general, meeting-minutes ..."
                      className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-300 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={handleSend}
                  disabled={!canSend || status === "sending"}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                    bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25
                    hover:shadow-teal-500/40 hover:-translate-y-0.5
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {status === "sending" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 발송 중...</>
                  ) : (
                    <><Send className="w-4 h-4" /> 지금 발송하기</>
                  )}
                </button>
                {!canSend && (
                  <p className="text-center text-xs text-slate-400 mt-2">이메일 또는 Slack 채널을 입력해주세요</p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────
// CloudModal — 클라우드 저장소 내보내기 모달
// ────────────────────────────────────────────────────────────
type CloudProviderId = "gdrive" | "onedrive" | "notion";

const CLOUD_PROVIDERS = [
  {
    id: "gdrive" as CloudProviderId,
    name: "Google Drive",
    folder: "내 드라이브 / 회의록",
    selectedBorder: "border-blue-400",
    selectedBg: "bg-blue-50",
    selectedText: "text-blue-800",
    iconBg: "bg-white",
    icon: (
      <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" width="28" height="25">
        <path fill="#0066da" d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"/>
        <path fill="#00ac47" d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z"/>
        <path fill="#ea4335" d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z"/>
        <path fill="#00832d" d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"/>
        <path fill="#2684fc" d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"/>
        <path fill="#ffba00" d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"/>
      </svg>
    ),
  },
  {
    id: "onedrive" as CloudProviderId,
    name: "OneDrive",
    folder: "Documents / 회의록",
    selectedBorder: "border-sky-400",
    selectedBg: "bg-sky-50",
    selectedText: "text-sky-800",
    iconBg: "bg-white",
    icon: (
      <svg viewBox="0 0 24 15" xmlns="http://www.w3.org/2000/svg" width="30" height="19">
        <path d="M14.56 5.15a5.5 5.5 0 0 0-10.4 1.67A4.25 4.25 0 0 0 4.25 15H20a3.5 3.5 0 0 0 .44-6.97 5.5 5.5 0 0 0-5.88-2.88z" fill="#0078D4"/>
        <path d="M10.35 6.5A5.5 5.5 0 0 1 14.56 5.15a5.5 5.5 0 0 1 5.88 2.88A3.5 3.5 0 0 1 20 15H11L8.5 9.5a5.47 5.47 0 0 1 1.85-3z" fill="#1890F1"/>
      </svg>
    ),
  },
  {
    id: "notion" as CloudProviderId,
    name: "Notion",
    folder: "워크스페이스 / 회의록",
    selectedBorder: "border-slate-400",
    selectedBg: "bg-slate-100",
    selectedText: "text-slate-900",
    iconBg: "bg-white",
    icon: (
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z" fill="#1a1a1a"/>
      </svg>
    ),
  },
];

function CloudModal({
  onClose,
  staffContent,
  execContent,
}: {
  onClose: () => void;
  staffContent: string;
  execContent: string;
}) {
  const [selectedProvider, setSelectedProvider] = useState<CloudProviderId>("gdrive");
  const [targets, setTargets] = useState({ staff: true, exec: true });
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const hasContent = staffContent.length > 0 || execContent.length > 0;
  const canUpload = (targets.staff || targets.exec) && hasContent;
  const provider = CLOUD_PROVIDERS.find(p => p.id === selectedProvider)!;
  const fileCount = [targets.staff, targets.exec].filter(Boolean).length;

  const handleUpload = async () => {
    if (!canUpload) return;
    setStatus("uploading");
    setProgress(0);
    const steps = [8, 18, 30, 45, 58, 70, 81, 91, 97, 100];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 130 + Math.random() * 70));
      setProgress(step);
    }
    await new Promise(r => setTimeout(r, 280));
    setStatus("done");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={status !== "uploading" ? onClose : undefined}
        />

        {/* Card */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.93, y: 24 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
        >
          {status === "done" ? (
            /* ── 완료 화면 ── */
            <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
                className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-teal-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">업로드 완료!</h3>
              <p className="text-sm text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">{provider.name}</span>에<br />
                <span className="font-semibold text-slate-700">{fileCount}개</span> 보고서가 저장됐습니다.
              </p>
              <div className="flex items-center gap-1.5 mt-2 mb-6 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm">📁</span>
                <span className="text-xs text-slate-500">{provider.folder}</span>
              </div>
              <button onClick={onClose} className="px-6 py-2.5 bg-teal-500 text-white rounded-xl font-semibold text-sm hover:bg-teal-600 transition-colors">
                닫기
              </button>
            </div>
          ) : (
            <>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-teal-600" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">클라우드 저장</h2>
                </div>
                <button
                  onClick={onClose}
                  disabled={status === "uploading"}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* 저장소 선택 */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">저장소 선택</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CLOUD_PROVIDERS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProvider(p.id)}
                        disabled={status === "uploading"}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all disabled:opacity-60
                          ${selectedProvider === p.id
                            ? `${p.selectedBorder} ${p.selectedBg} ${p.selectedText} shadow-sm`
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${p.iconBg} border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden`}>
                          {p.icon}
                        </div>
                        <span className="text-xs leading-tight text-center whitespace-nowrap">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  {/* 폴더 경로 표시 */}
                  <div className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm">📁</span>
                    <span className="text-xs text-slate-500 truncate">{provider.folder}</span>
                  </div>
                </div>

                {/* 저장할 보고서 */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">저장할 보고서</p>
                  <div className="flex gap-2">
                    {[
                      { key: "staff" as const, label: "실무진용", color: "blue" },
                      { key: "exec"  as const, label: "경영진용", color: "amber" },
                    ].map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => setTargets(t => ({ ...t, [key]: !t[key] }))}
                        disabled={!hasContent || status === "uploading"}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${targets[key]
                            ? color === "blue"
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-white text-slate-400"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 업로드 진행바 */}
                {status === "uploading" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500 font-medium">{provider.name}에 업로드 중...</span>
                      <span className="text-xs font-bold text-teal-600">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {fileCount}개 파일 처리 중 · 잠시만 기다려주세요
                    </p>
                  </motion.div>
                )}
              </div>

              {/* 푸터 */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={handleUpload}
                  disabled={!canUpload || status === "uploading"}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                    bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25
                    hover:shadow-teal-500/40 hover:-translate-y-0.5
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {status === "uploading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...</>
                  ) : (
                    <><Cloud className="w-4 h-4" /> {provider.name}에 저장하기</>
                  )}
                </button>
                {!canUpload && (
                  <p className="text-center text-xs text-slate-400 mt-2">저장할 보고서를 선택해주세요</p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────
// DownloadMenu — DOCX / PDF / PPT 포맷 선택 드롭다운
// ────────────────────────────────────────────────────────────
function DownloadMenu({
  onDownload,
  accent,
}: {
  onDownload: (fmt: "docx" | "pdf" | "ppt") => void;
  accent: "blue" | "amber";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const accentHover = accent === "blue"
    ? "hover:text-blue-600 hover:bg-blue-50"
    : "hover:text-amber-600 hover:bg-amber-50";

  const formats = [
    { id: "docx" as const, label: "Word (DOCX)", icon: "📄" },
    { id: "pdf"  as const, label: "PDF",         icon: "📕" },
    { id: "ppt"  as const, label: "PPT 슬라이드",  icon: "📊" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`p-2 text-slate-400 ${accentHover} rounded-lg transition-colors`}
        title="다운로드"
      >
        <Download className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 z-50 w-40 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 overflow-hidden"
          >
            {formats.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => { onDownload(fmt.id); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>{fmt.icon}</span>
                <span className="font-medium">{fmt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DualFormatPicker — 실무진/경영진 별도 템플릿 선택
// ────────────────────────────────────────────────────────────
function FormatCard<T extends string>({
  fmt,
  isSelected,
  isOpen,
  onSelect,
  onTogglePreview,
  accentClass,
}: {
  fmt: { id: T; icon: React.ReactNode; name: string; desc: string; preview: string };
  isSelected: boolean;
  isOpen: boolean;
  onSelect: () => void;
  onTogglePreview: (e: React.MouseEvent) => void;
  accentClass: { border: string; bg: string; text: string; icon: string; shadow: string };
}) {
  return (
    <div className={`flex items-center rounded-xl border transition-all w-full overflow-hidden
      ${isSelected
        ? `${accentClass.border} ${accentClass.bg} shadow-sm ${accentClass.shadow}`
        : "border-slate-200 bg-white hover:border-slate-300"
      }`}>
      {/* 선택 영역 */}
      <button
        type="button"
        onClick={onSelect}
        className={`flex items-center gap-2 px-3 py-2.5 flex-1 min-w-0 text-left transition-colors
          ${isSelected ? accentClass.text : "text-slate-600 hover:bg-slate-50"}`}
      >
        <span className={`shrink-0 ${isSelected ? accentClass.icon : "text-slate-400"}`}>{fmt.icon}</span>
        <span className="font-semibold text-sm truncate">{fmt.name}</span>
      </button>
      {/* 미리보기 토글 */}
      <button
        type="button"
        onClick={onTogglePreview}
        className={`shrink-0 px-2 py-2.5 border-l transition-colors
          ${isSelected
            ? `border-current/20 ${accentClass.icon} hover:bg-white/40`
            : "border-slate-100 text-slate-300 hover:text-slate-500 hover:bg-slate-50"
          }`}
        title="미리보기"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

function DualFormatPicker({
  staffSelected,
  execSelected,
  onStaffChange,
  onExecChange,
  selectedLanguage,
  onLanguageChange,
}: {
  staffSelected: FormatId;
  execSelected: ExecFormatId;
  onStaffChange: (id: FormatId) => void;
  onExecChange: (id: ExecFormatId) => void;
  selectedLanguage: LanguageId;
  onLanguageChange: (id: LanguageId) => void;
}) {
  const [expandedStaff, setExpandedStaff] = useState<FormatId | null>(null);
  const [expandedExec, setExpandedExec] = useState<ExecFormatId | null>(null);

  const staffAccent = {
    border: "border-blue-400", bg: "bg-blue-50", text: "text-blue-800",
    icon: "text-blue-500", shadow: "shadow-blue-100",
    preview: "border-blue-200 bg-blue-50/60 text-blue-900",
  };
  const execAccent = {
    border: "border-amber-400", bg: "bg-amber-50", text: "text-amber-800",
    icon: "text-amber-500", shadow: "shadow-amber-100",
    preview: "border-amber-200 bg-amber-50/60 text-amber-900",
  };

  return (
    <div className="mt-6 w-full space-y-4">
      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
        보고서 템플릿 커스터마이징
      </p>

      {/* 언어 선택 */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Type className="w-3.5 h-3.5 text-teal-500" />
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">보고서 언어</span>
        </div>
        <div className="flex gap-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => onLanguageChange(lang.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                ${selectedLanguage === lang.id
                  ? "border-teal-400 bg-teal-50 text-teal-800 shadow-sm shadow-teal-100"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 실무진용 */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">실무진용 템플릿</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {STAFF_FORMATS.map((fmt) => (
            <FormatCard
              key={fmt.id}
              fmt={fmt}
              isSelected={staffSelected === fmt.id}
              isOpen={expandedStaff === fmt.id}
              onSelect={() => onStaffChange(fmt.id)}
              onTogglePreview={(e) => {
                e.stopPropagation();
                setExpandedStaff(expandedStaff === fmt.id ? null : fmt.id);
              }}
              accentClass={staffAccent}
            />
          ))}
        </div>
        <AnimatePresence initial={false}>
          {expandedStaff && (
            <motion.div
              key={expandedStaff}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden mt-2"
            >
              <div className={`rounded-xl border p-3 ${staffAccent.preview}`}>
                <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  미리보기 — {STAFF_FORMATS.find(f => f.id === expandedStaff)?.name}
                </p>
                <div className="text-[11px] leading-relaxed
                  [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px]
                  [&_th]:border [&_th]:border-blue-300 [&_th]:bg-blue-100 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold
                  [&_td]:border [&_td]:border-blue-200 [&_td]:px-2 [&_td]:py-1
                  [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {STAFF_FORMATS.find(f => f.id === expandedStaff)?.preview ?? ""}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 경영진용 */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Briefcase className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">경영진용 템플릿</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {EXEC_FORMATS.map((fmt) => (
            <FormatCard
              key={fmt.id}
              fmt={fmt}
              isSelected={execSelected === fmt.id}
              isOpen={expandedExec === fmt.id}
              onSelect={() => onExecChange(fmt.id)}
              onTogglePreview={(e) => {
                e.stopPropagation();
                setExpandedExec(expandedExec === fmt.id ? null : fmt.id);
              }}
              accentClass={execAccent}
            />
          ))}
        </div>
        <AnimatePresence initial={false}>
          {expandedExec && (
            <motion.div
              key={expandedExec}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden mt-2"
            >
              <div className={`rounded-xl border p-3 ${execAccent.preview}`}>
                <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  미리보기 — {EXEC_FORMATS.find(f => f.id === expandedExec)?.name}
                </p>
                <div className="text-[11px] leading-relaxed
                  [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px]
                  [&_th]:border [&_th]:border-amber-300 [&_th]:bg-amber-100 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold
                  [&_td]:border [&_td]:border-amber-200 [&_td]:px-2 [&_td]:py-1
                  [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {EXEC_FORMATS.find(f => f.id === expandedExec)?.preview ?? ""}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
async function streamDemoReport(
  report: string,
  setReport: React.Dispatch<React.SetStateAction<string>>,
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>,
) {
  let cursor = 0;
  while (cursor < report.length) {
    cursor = Math.min(report.length, cursor + 36);
    setReport(report.slice(0, cursor));
    await wait(28);
  }
  setStreaming(false);
}

export default function MeetingAgentIndex() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStaffStreaming, setIsStaffStreaming] = useState(false);
  const [isExecStreaming, setIsExecStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedStaffFormat, setSelectedStaffFormat] = useState<FormatId>("formal");
  const [selectedExecFormat, setSelectedExecFormat] = useState<ExecFormatId>("official");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>("ko");

  const [staffReport, setStaffReport] = useState<string>("");
  const [execReport, setExecReport] = useState<string>("");
  const [copiedStaff, setCopiedStaff] = useState(false);
  const [copiedExec, setCopiedExec] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);

  // 에디터 상태
  const [isStaffEditing, setIsStaffEditing] = useState(false);
  const [isExecEditing, setIsExecEditing] = useState(false);
  const [staffDraft, setStaffDraft] = useState("");
  const [execDraft, setExecDraft] = useState("");
  const [staffEdited, setStaffEdited] = useState(false);
  const [execEdited, setExecEdited] = useState(false);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<number>(-1);
  const [detectedFormat, setDetectedFormat] = useState<string>("");
  const [speakerCount] = useState<number>(3);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const staffRef = useRef<HTMLDivElement>(null);
  const execRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("meetingHistory");
    if (saved) {
      try { setHistoryList(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveToHistory = (filename: string, staffText: string, execText: string, staffFmt: FormatId, execFmt: ExecFormatId) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      filename,
      staffReport: staffText,
      execReport: execText,
      staffFormatId: staffFmt,
      execFormatId: execFmt,
    };
    setHistoryList(prev => {
      const updated = [newItem, ...prev].slice(0, 50);
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
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
      setFile(null);
      setStaffReport("");
      setExecReport("");
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
    setProcessingStep(-1);
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

  const copyToClipboard = (text: string, type: "staff" | "exec") => {
    navigator.clipboard.writeText(text);
    if (type === "staff") { setCopiedStaff(true); setTimeout(() => setCopiedStaff(false), 2000); }
    else { setCopiedExec(true); setTimeout(() => setCopiedExec(false), 2000); }
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

  const downloadDOCX = async (content: string, filename: string) => {
    const lines = content.split("\n");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("## ")) {
        children.push(new Paragraph({ text: line.replace(/^## /, "").replace(/\*\*(.*?)\*\*/g, "$1"), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
      } else if (line.startsWith("### ")) {
        children.push(new Paragraph({ text: line.replace(/^### /, "").replace(/\*\*(.*?)\*\*/g, "$1"), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }));
      } else if (line.startsWith("#### ")) {
        children.push(new Paragraph({ text: line.replace(/^#### /, "").replace(/\*\*(.*?)\*\*/g, "$1"), heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }));
      } else if (/^[-*] /.test(line)) {
        const text = line.replace(/^[-*] /, "").replace(/\*\*(.*?)\*\*/g, "$1");
        children.push(new Paragraph({ text, bullet: { level: 0 } }));
      } else if (line.startsWith("| ") && !line.match(/^\|[\s:-]+\|/)) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
        const dataRows = tableLines.filter(l => !l.match(/^\|[\s:-]+\|/));
        if (dataRows.length > 0) {
          children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: dataRows.map((row, rIdx) => new TableRow({
              children: row.split("|").filter((_, ci, arr) => ci > 0 && ci < arr.length - 1).map(cell =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: cell.trim().replace(/\*\*(.*?)\*\*/g, "$1"), bold: rIdx === 0 })] })],
                  shading: rIdx === 0 ? { fill: "EFF6FF", color: "EFF6FF" } : undefined,
                  borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" }, left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" }, right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" } },
                })
              ),
            })),
          }));
          children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
        }
        continue;
      } else if (line.startsWith("---")) {
        children.push(new Paragraph({ text: "", spacing: { before: 100, after: 100 }, border: { bottom: { color: "E2E8F0", size: 4, style: BorderStyle.SINGLE } } }));
      } else if (line.trim() === "") {
        children.push(new Paragraph({ text: "" }));
      } else {
        const parts = line.split(/(\*\*.*?\*\*)/);
        const runs = parts.map(part => part.startsWith("**") ? new TextRun({ text: part.replace(/\*\*/g, ""), bold: true }) : new TextRun({ text: part }));
        children.push(new Paragraph({ children: runs }));
      }
      i++;
    }
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPPT = async (content: string, filename: string, reportTitle: string) => {
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";

    // 타이틀 슬라이드
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: "0D9488" };
    titleSlide.addText(reportTitle, { x: 0.8, y: 1.2, w: 8.4, h: 1.4, fontSize: 28, bold: true, color: "FFFFFF", align: "center" });
    titleSlide.addText("AI 자동 생성 회의록  |  " + (file?.name ?? ""), { x: 0.8, y: 2.8, w: 8.4, h: 0.7, fontSize: 14, color: "CCFBF1", align: "center" });

    // 섹션별 슬라이드 (--- 구분)
    const sections = content.split(/\n---\n/).filter(s => s.trim());
    sections.slice(0, 5).forEach(section => {
      const sLines = section.trim().split("\n").filter(l => l.trim());
      const heading = sLines.find(l => /^##+ /.test(l))?.replace(/^##+ /, "").replace(/\*\*(.*?)\*\*/g, "$1") ?? "";
      const bodyLines = sLines.filter(l => !/^##/.test(l) && !l.match(/^\|[\s:-]+\|/));

      const slide = pptx.addSlide();
      slide.addText(heading, { x: 0.5, y: 0.25, w: 9, h: 0.7, fontSize: 20, bold: true, color: "1E293B" });
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.98, w: 9, h: 0.04, fill: { color: "0D9488" } });

      // 표 행 추출
      const tableLines = bodyLines.filter(l => l.startsWith("| ") && !l.match(/^\|[\s:-]+\|/));
      if (tableLines.length >= 2) {
        const rows = tableLines.map((row, rIdx) =>
          row.split("|").filter((_, ci, arr) => ci > 0 && ci < arr.length - 1).map(cell => ({
            text: cell.trim().replace(/\*\*(.*?)\*\*/g, "$1"),
            options: { bold: rIdx === 0, fill: { color: rIdx === 0 ? "E0F2FE" : rIdx % 2 === 0 ? "F8FAFC" : "FFFFFF" }, color: "1E293B", fontSize: 10, align: "left" as const, valign: "middle" as const },
          }))
        );
        const colW = 9 / (rows[0]?.length ?? 1);
        slide.addTable(rows, { x: 0.5, y: 1.2, w: 9, colW: Array(rows[0]?.length ?? 1).fill(colW), fontSize: 10, border: { type: "solid", pt: 0.5, color: "CBD5E1" } });
      } else {
        const textLines = bodyLines
          .filter(l => !l.startsWith("|"))
          .map(l => l.replace(/^[-*>] /, "• ").replace(/^#+\s+/, "").replace(/\*\*(.*?)\*\*/g, "$1"))
          .filter(l => l.trim() && !l.match(/^[-\s]+$/))
          .slice(0, 10);
        slide.addText(textLines.join("\n"), { x: 0.5, y: 1.2, w: 9, h: 5, fontSize: 12, color: "334155", valign: "top", paraSpaceBefore: 6, lineSpacingMultiple: 1.3 });
      }
    });

    await pptx.writeFile({ fileName: filename });
  };

  const analyzeAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg("");
    setStaffReport("");
    setExecReport("");
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "AUDIO";
    setDetectedFormat(ext);

    try {
      setProcessingStep(0); await wait(800);
      setProcessingStep(1); await wait(1200);
      setProcessingStep(2); await wait(2000);
      setProcessingStep(3); await wait(1500);
      setProcessingStep(4);
      setIsStaffStreaming(true);
      setIsExecStreaming(true);

      const staffDemoReport = getDemoStaff(selectedStaffFormat, selectedLanguage)(file.name);
      const execDemoReport = getDemoExec(selectedExecFormat, selectedLanguage)(file.name);

      await Promise.all([
        streamDemoReport(staffDemoReport, setStaffReport, setIsStaffStreaming),
        streamDemoReport(execDemoReport, setExecReport, setIsExecStreaming),
      ]);

      saveToHistory(file.name, staffDemoReport, execDemoReport, selectedStaffFormat, selectedExecFormat);
    } catch (error) {
      console.error(error);
      setErrorMsg("데모 보고서 생성 중 오류가 발생했습니다.");
      setIsStaffStreaming(false);
      setIsExecStreaming(false);
    } finally {
      setIsProcessing(false);
      setProcessingStep(-1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* 발송 모달 */}
      {showSendModal && (
        <SendModal
          onClose={() => setShowSendModal(false)}
          staffContent={staffReport}
          execContent={execReport}
        />
      )}
      {/* 클라우드 저장 모달 */}
      {showCloudModal && (
        <CloudModal
          onClose={() => setShowCloudModal(false)}
          staffContent={staffReport}
          execContent={execReport}
        />
      )}

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
        {/* Left Sidebar */}
        <aside className="w-80 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[calc(100vh-6rem)] sticky top-24">
          <button
            onClick={startNewUpload}
            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mb-6
              ${!selectedHistoryId && !staffReport ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
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
                      ? "bg-teal-50 border-teal-200 text-teal-800"
                      : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-sm truncate">{item.filename}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}
                      className={`shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition-all ${
                        selectedHistoryId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs opacity-60">{item.date}</span>
                    {item.staffFormatId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">
                        {STAFF_FORMATS.find(f => f.id === item.staffFormatId)?.name}
                      </span>
                    )}
                    {item.execFormatId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-500 font-medium">
                        {EXEC_FORMATS.find(f => f.id === item.execFormatId)?.name}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 max-w-5xl">
          {!selectedHistoryId ? (
            <>
              <div className="mb-10 text-center max-w-2xl mx-auto mt-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  회의 음성 기반 <span className="text-teal-600">듀얼 보고서</span> 자동 생성
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  회의 녹음 파일을 업로드 하시면 AI가 음성을 직접 분석하여<br />
                  실무진용 상세 문서와 경영진용 요약 문서를 동시에 작성해 드립니다.
                </p>
              </div>

              <div className="max-w-3xl mx-auto mb-12">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setupFile(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all bg-white relative overflow-hidden shadow-sm
                    ${file ? "border-teal-400 bg-teal-50/50" : "border-slate-300 hover:border-teal-300 hover:bg-slate-50"}
                    ${isProcessing ? "pointer-events-none opacity-80" : "cursor-pointer"}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) setupFile(e.target.files[0]); }} accept="audio/*" className="hidden" />

                  {file ? (
                    <div className="flex flex-col items-center z-10 w-full" onClick={(e) => e.stopPropagation()}>
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 text-teal-600 border-4 border-white shadow-sm">
                        <FileAudio className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-slate-800 text-lg truncate max-w-xs">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "Audio Format"}</p>

                      <div className="w-full max-w-xl mt-2">
                        <DualFormatPicker
                          staffSelected={selectedStaffFormat}
                          execSelected={selectedExecFormat}
                          onStaffChange={setSelectedStaffFormat}
                          onExecChange={setSelectedExecFormat}
                          selectedLanguage={selectedLanguage}
                          onLanguageChange={setSelectedLanguage}
                        />
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); analyzeAudio(); }}
                        disabled={isProcessing}
                        className="mt-5 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 transition-all flex items-center gap-3 z-20 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlayCircle className="w-6 h-6" />}
                        {isProcessing ? "처리 중..." : "AI 회의 분석 시작"}
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

          <AnimatePresence>
            {processingStep >= 0 && (
              <ProcessingPipeline currentStep={processingStep} detectedFormat={detectedFormat} speakerCount={speakerCount} />
            )}
          </AnimatePresence>

          {(staffReport || execReport || isStaffStreaming || isExecStreaming) && (
            <div className="grid gap-8 pb-20 xl:grid-cols-2">
              {/* 실무진 패널 */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[700px]">
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-0.5">실무진용 (Staff) 보고서</h3>
                      <p className="text-sm text-slate-500">
                        {STAFF_FORMATS.find(f => f.id === selectedStaffFormat)?.name ?? ""} · {STAFF_FORMATS.find(f => f.id === selectedStaffFormat)?.desc ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isStaffStreaming && <div className="rounded-full bg-blue-50 px-3 py-2"><Loader2 className="w-4 h-4 animate-spin" /></div>}
                    {staffReport && !isProcessing && !isStaffStreaming && (
                      <>
                        {isStaffEditing ? (
                          <>
                            <button
                              onClick={() => { setStaffReport(staffDraft); setStaffEdited(true); setIsStaffEditing(false); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" /> 저장
                            </button>
                            <button
                              onClick={() => setIsStaffEditing(false)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            {staffEdited && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold">수정됨</span>
                            )}
                            <button
                              onClick={() => { setStaffDraft(staffReport); setIsStaffEditing(true); }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="직접 수정"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {staffEdited && (
                              <button
                                onClick={() => { setStaffEdited(false); }}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="원본 보기"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => setShowCloudModal(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="클라우드 저장">
                              <Cloud className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowSendModal(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="발송">
                              <Send className="w-4 h-4" />
                            </button>
                            <button onClick={() => copyToClipboard(staffReport, "staff")} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="복사">
                              {copiedStaff ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <DownloadMenu
                              accent="blue"
                              onDownload={(fmt) => {
                                const content = staffEdited ? staffDraft : staffReport;
                                if (fmt === "pdf") downloadPDF(staffRef, "staff_report.pdf");
                                else if (fmt === "docx") downloadDOCX(content, "staff_report.docx");
                                else downloadPPT(content, "staff_report.pptx", "실무진용 보고서");
                              }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 실무진 콘텐츠 — 뷰 / 에디터 토글 */}
                {isStaffEditing ? (
                  <textarea
                    value={staffDraft}
                    onChange={(e) => setStaffDraft(e.target.value)}
                    className="flex-1 w-full p-8 font-mono text-sm text-slate-700 bg-blue-50/30 border-0 outline-none resize-none leading-relaxed"
                    placeholder="마크다운을 직접 수정하세요..."
                    spellCheck={false}
                  />
                ) : (
                <div ref={staffRef} className="p-8 flex-1 overflow-y-auto prose prose-base max-w-none prose-h2:text-blue-700
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-blue-200
                  [&_th]:bg-blue-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:border [&_th]:border-blue-200 [&_th]:font-bold [&_th]:text-sm
                  [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-slate-200 [&_td]:text-sm [&_td]:align-top
                  [&_tr:nth-child(even)_td]:bg-blue-50/40">
                  {staffReport ? (
                    <div className="space-y-6">
                      {isStaffStreaming && <StreamingIndicator tone="blue" />}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{staffReport}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                      {isStaffStreaming
                        ? <div className="w-full max-w-xl opacity-100"><StreamingIndicator tone="blue" /></div>
                        : <><FileText className="w-16 h-16" /><p className="text-lg">AI가 음성을 듣고 마크다운을 작성 중입니다...</p></>
                      }
                    </div>
                  )}
                </div>
                )}
              </motion.div>

              {/* 경영진 패널 */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[700px]">
                <div className="bg-amber-50/50 border-b border-amber-100 px-8 py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-0.5">경영진용 (Executive) 보고서</h3>
                      <p className="text-sm text-slate-500">
                        {EXEC_FORMATS.find(f => f.id === selectedExecFormat)?.name ?? ""} · {EXEC_FORMATS.find(f => f.id === selectedExecFormat)?.desc ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isExecStreaming && <div className="rounded-full bg-amber-50 px-3 py-2"><Loader2 className="w-4 h-4 animate-spin" /></div>}
                    {execReport && !isProcessing && !isExecStreaming && (
                      <>
                        {isExecEditing ? (
                          <>
                            <button
                              onClick={() => { setExecReport(execDraft); setExecEdited(true); setIsExecEditing(false); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" /> 저장
                            </button>
                            <button
                              onClick={() => setIsExecEditing(false)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            {execEdited && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-semibold">수정됨</span>
                            )}
                            <button
                              onClick={() => { setExecDraft(execReport); setIsExecEditing(true); }}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="직접 수정"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {execEdited && (
                              <button
                                onClick={() => setExecEdited(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="원본 보기"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => setShowCloudModal(true)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="클라우드 저장">
                              <Cloud className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowSendModal(true)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="발송">
                              <Send className="w-4 h-4" />
                            </button>
                            <button onClick={() => copyToClipboard(execReport, "exec")} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="복사">
                              {copiedExec ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <DownloadMenu
                              accent="amber"
                              onDownload={(fmt) => {
                                const content = execEdited ? execDraft : execReport;
                                if (fmt === "pdf") downloadPDF(execRef, "executive_report.pdf");
                                else if (fmt === "docx") downloadDOCX(content, "executive_report.docx");
                                else downloadPPT(content, "executive_report.pptx", "경영진용 보고서");
                              }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 경영진 콘텐츠 — 뷰 / 에디터 토글 */}
                {isExecEditing ? (
                  <textarea
                    value={execDraft}
                    onChange={(e) => setExecDraft(e.target.value)}
                    className="flex-1 w-full p-8 font-mono text-sm text-slate-700 bg-amber-50/30 border-0 outline-none resize-none leading-relaxed"
                    placeholder="마크다운을 직접 수정하세요..."
                    spellCheck={false}
                  />
                ) : (
                <div ref={execRef} className="p-8 flex-1 overflow-y-auto prose prose-base max-w-none prose-h2:text-amber-700 prose-h3:text-amber-800
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-amber-200
                  [&_th]:bg-amber-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:border [&_th]:border-amber-200 [&_th]:font-bold [&_th]:text-sm
                  [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-slate-200 [&_td]:text-sm [&_td]:align-top
                  [&_tr:nth-child(even)_td]:bg-amber-50/40">
                  {execReport ? (
                    <div className="space-y-6">
                      {isExecStreaming && <StreamingIndicator tone="amber" />}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{execReport}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                      {isExecStreaming
                        ? <div className="w-full max-w-xl opacity-100"><StreamingIndicator tone="amber" /></div>
                        : <><FileText className="w-16 h-16" /><p className="text-lg">AI가 음성을 듣고 마크다운을 작성 중입니다...</p></>
                      }
                    </div>
                  )}
                </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
