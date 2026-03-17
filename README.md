# Audio Report AI — 회의 음성 기반 듀얼 보고서 자동 생성기

회의 녹음 파일을 업로드하면 AI가 음성을 분석해 **실무진용 상세 보고서**와 **경영진용 요약 보고서**를 동시에 생성합니다.

---

## v2 — 2026.03.17 업데이트

### 추가된 기능

| 기능 | 설명 |
|------|------|
| **다운로드 포맷 다양화** | Word(DOCX) / PDF / PPT 슬라이드 3종 다운로드 지원 |
| **이메일 · Slack 자동 발송** | 보고서 완성 즉시 수신자 태그 입력 후 바로 발송 (발송 애니메이션 포함) |
| **클라우드 저장소 내보내기** | Google Drive · OneDrive · Notion 실제 브랜드 아이콘 + 업로드 진행률 UI |
| **이중 언어 모드 개선** | 🇰🇷 · 🇺🇸 언어별 줄 구분 정렬, `>` 기호 제거 |
| **템플릿 UX 개선** | 카드 클릭 = 선택만 / `∨` 토글 버튼 = 미리보기 독립 분리 |
| **경영진용 템플릿 개편** | 공식 문서형 → 핵심 요약형 → 리스크 중심형 순서로 재편 |
| **실무진용 템플릿 개편** | 공식 문서형 → 대화형 → 액션 중심형 순서로 재편 |

### v2 기술 추가

- **DOCX 생성:** `docx` 패키지 (브라우저 사이드, 마크다운 → Word 변환)
- **PPT 생성:** `pptxgenjs` 패키지 (섹션별 슬라이드 자동 분리)
- **클라우드 아이콘:** Google Drive · OneDrive · Notion 실제 SVG 브랜드 로고 인라인 삽입

---

## v1 — 초기 버전

### 주요 기능

- **듀얼 보고서 자동 생성** — 오디오 업로드 한 번으로 실무진용·경영진용 2종 문서 동시 생성
- **실무진용 보고서** — 발화자별 발언 내용, 맥락, 액션 아이템·마감일 정리
- **경영진용 보고서** — 대기업 보고서 양식 기반 (회의 목적 / 핵심 논의 결과 / 의사결정 / 리스크 / 후속 조치)
- **이중 언어 모드** — 🇰🇷 한국어 / 🇺🇸 영어 동시 출력
- **스트리밍 출력** — AI가 실시간으로 타이핑하는 듯한 UX
- **히스토리 저장** — 최근 생성한 보고서 50건 로컬 저장 및 재열람
- **PDF 다운로드 / 클립보드 복사** — 보고서 즉시 활용

### v1 기술 스택

- **Framework:** Next.js 15 (App Router, Static Export)
- **UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Markdown:** react-markdown + remark-gfm
- **PDF:** html2canvas + jsPDF
- **배포:** GitHub Pages (`/docs` 폴더)

---

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 빌드 및 배포

```bash
npm run build        # /out 폴더에 정적 파일 생성
cp -r out/* docs/    # GitHub Pages용 docs 폴더에 복사
touch docs/.nojekyll # _next 폴더 인식을 위해 필수
git add docs/
git commit -m "Deploy"
git push
```

GitHub 저장소 Settings → Pages → Source: `main` 브랜치 / `docs/` 폴더로 설정

## 프로젝트 구조

```
src/app/
├── page.tsx          # 랜딩 페이지
└── meeting/
    └── page.tsx      # 보고서 생성 대시보드
docs/                 # GitHub Pages 배포 파일
```
