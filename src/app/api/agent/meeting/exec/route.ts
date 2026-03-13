import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { audioData, mimeType } = await req.json();

    if (!audioData) {
      return new Response("No audio data provided", { status: 400 });
    }

    const systemPrompt = `You are a high-level Manufacturing Strategy Assistant for the Executive team.
    You will be provided with an audio file of a meeting.
    Please write a concise, one-page Executive Summary Markdown report tailored for EXECUTIVES (경영진).
    
    CRITICAL: YOU MUST OUTPUT THE RESULTS PRIMARILY IN MARKDOWN TABLES. Do not use plain lists for risks/resources.
    
    Format the output in clean, professional Korean Markdown using bold headers (##) and tables format.
    Do NOT include granular, low-level technical task details.

    Structure the report exactly like this:

    ## 📊 경영 목표 및 요약 (Executive Summary)
    (High-level meeting purpose and core outcomes, 1-2 paragraphs)

    ## ⚠️ 리스크 및 리소스 관리 현황
    | 항목 분류 | 세부 내용 | 리소스 (예산/인력/일정) | 심각도 |
    |---|---|---|---|
    | (ex. 재무/운영/일정) | (Risk or Detail) | (Resource requirements) | (High/Med/Low) |

    ## 💡 핵심 전략 결정 (Key strategic decisions)
    (Bullet points for major big-picture decisions)`;

    const response = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this meeting audio and generate the executive summary." },
            {
              type: "file",
              data: audioData,
              mediaType: mimeType,
            },
          ],
        },
      ],
    });

    return response.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Exec Meeting API Error:", error);
    const rawMessage = error instanceof Error ? error.message : String(error);
    const message = rawMessage.includes("quota") || rawMessage.includes("RESOURCE_EXHAUSTED")
      ? "현재 Gemini API 사용 한도를 초과했습니다. 잠시 후 다시 시도하거나, 결제/쿼터 설정이 가능한 API 키로 변경해 주세요."
      : rawMessage;
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
