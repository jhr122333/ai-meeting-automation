import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { department, timeWasted, taskTypes, painPoint } = body;

    const prompt = `
당신은 최고의 사내 AX(AI Transformation) 컨설턴트입니다.
다음은 현업 실무자가 입력한 업무 비효율성에 대한 정보입니다.

[입력 정보]
- 부서: ${department}
- 단순 반복 업무 소요 시간 (주당): ${timeWasted}시간
- 반복 업무 유형: ${taskTypes.join(', ')}
- 상세 불편 사항(Pain Point): ${painPoint}

당신은 내부적으로 3개의 에이전트 역할을 수행하여 최종 결과물을 JSON 구조로 반환해야 합니다.

1. Profiler: 현업 실무자의 글에서 데이터 입출력(I/O) 병목 현상과 가장 낭비되는 요소를 정확히 진단합니다.
2. Solution Architect: 단순한 코딩이 아닌, 비개발자도 쓸 수 있는 최적의 노코드(Make, Zapier) 및 SaaS, LLM(ChatGPT, Claude) 조합을 설계합니다.
3. Report Generator: 실무자가 즉시 실행할 수 있는 가이드라인과 프롬프트 템플릿을 작성합니다.

반드시 한국어로 친절하고 전문적으로 작성해주세요.
    `;

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        axScore: z.number().describe('100점 만점 기준 이 업무의 자동화(AX) 전환 가능성 점수 (높을수록 자동화가 쉽고 효과 큼)'),
        roiHours: z.number().describe('자동화 적용 시 주당 예상 절약 시간 (입력된 소요 시간 대비 현실적인 절감 시간)'),
        profilerAnalysis: z.string().describe('사용자 문제에 대한 핵심 병목 포인트 진단 (2~3문장, 전문가적인 시선)'),
        recommendedTools: z.array(z.string()).describe('추천하는 솔루션 도구 이름 배열 (예: ["Make", "Google Sheets", "ChatGPT"])'),
        solutionArchitecture: z.string().describe('이 도구들을 결합하여 문제를 해결하는 구체적인 파이프라인/워크플로우 설명'),
        actionableGuidelines: z.array(z.string()).describe('실무자가 바로 따라할 수 있는 1-2-3 단계별 액션 플랜 (순서대로)'),
        promptTemplate: z.string().optional().describe('업무에 바로 복사-붙여넣기해서 쓸 수 있는 AI 프롬프트 템플릿 (필요한 경우에만 작성)')
      }),
      prompt: prompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
  }
}
