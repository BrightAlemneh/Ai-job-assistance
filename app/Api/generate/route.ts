import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { jobDescription, resume } = await req.json();

    if (!jobDescription || !resume) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Robust prompt to ensure consistent headers and full plain text output
    const prompt = `
You are an expert career coach and professional writer.

Based on the job description and resume below, generate plain text output divided into three sections with **exact headers**:

--- Tailored Resume ---
Generate a complete tailored resume. Include:
- Full contact info (you may use placeholders)
- Summary / Objective
- Work experience (company names, roles, dates, bullets)
- Skills
- Education
Do not stop at the header; use the information from the provided resume.

--- Cover Letter ---
Write a professional cover letter tailored to the job description. Use information from the resume.

--- Interview Prep ---
Write concise interview preparation tips for this job based on the resume and job description.

**Important:** Always use these exact section headers and no other text outside the sections. Preserve plain text formatting.

Job Description:
${jobDescription}

Resume:
${resume}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert career coach and professional writer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // deterministic
      max_tokens: 2500, // enough for long resumes + cover letter
    });

    const content = response.choices[0].message?.content;

    if (!content) {
      return NextResponse.json({ error: "No response from model" }, { status: 500 });
    }

    // Return as plain text
    return NextResponse.json({ text: content });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
