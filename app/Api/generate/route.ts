import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Parse incoming request
    const body = await req.json().catch(() => null);

    if (!body || !body.jobDescription || !body.resume) {
      return NextResponse.json(
        { error: "Missing required fields: jobDescription and resume" },
        { status: 400 }
      );
    }

    const { jobDescription, resume } = body;

    // Prepare prompt for AI
 const prompt = `
You are an expert career coach and professional writer.

Respond **only in plain text**, and clearly separate each section with these exact headings on their own line:

Tailored Resume:
[Your tailored resume content here]

Cover Letter:
[Your cover letter content here]

Interview Preparation:
[Your interview prep content here]

Do not include anything else, no explanations or notes.
Use the job description and resume provided below:

Job Description:
${jobDescription}

Resume:
${resume}
`;


    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert career coach and professional writer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI. Try again later." },
        { status: 500 }
      );
    }

    // Return plain text for frontend
    return NextResponse.json(
      { result: content },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
