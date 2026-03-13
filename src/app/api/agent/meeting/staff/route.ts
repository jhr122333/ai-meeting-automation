import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { audioData, mimeType } = await req.json();

    if (!audioData) {
      return new Response("No audio data provided", { status: 400 });
    }

    const systemPrompt = `You are a professional Manufacturing Operations Assistant for the Staff team.
    You will be provided with an audio file of a meeting.
    Please write a detailed Markdown report specifically tailored for the STAFF (실무진).
    
    CRITICAL: YOU MUST OUTPUT THE RESULTS PRIMARILY IN MARKDOWN TABLES. Do not use plain lists for action items.
    
    Format the output in clean, professional Korean Markdown using bold headers (##) and tables format.
    
    Structure the report exactly like this:
    
    ## 🎯 회의 세부 안건
    (Brief description of what was discussed)

    ## ✅ 액션 아이템 테이블 (Action Items)
    | 담당자 | 업무 내용 | 마감 기한 | 우선순위 |
    |---|---|---|---|
    | (Name) | (Task Description) | (Date, e.g. TBD/ASAP) | (High/Medium/Low) |
    
    ## 🛠 세부 논의 및 결정 사항
    (Granular technical or operational decisions made, bullet points)
    
    ## 🚀 향후 진행 절차 (Next Steps)
    (Step-by-step next steps)`;

    // Note: Passing base64 file buffer to Gemini Multimodal
    const response = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this meeting audio and generate the staff report." },
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
    console.error("Staff Meeting API Error:", error);
    const rawMessage = error instanceof Error ? error.message : String(error);
    const message = rawMessage.includes("quota") || rawMessage.includes("RESOURCE_EXHAUSTED")
      ? "현재 Gemini API 사용 한도를 초과했습니다. 잠시 후 다시 시도하거나, 결제/쿼터 설정이 가능한 API 키로 변경해 주세요."
      : rawMessage;
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
