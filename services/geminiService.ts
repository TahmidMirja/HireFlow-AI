
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalContent = async (
  type: 'cover_letter' | 'resume_summary',
  jobDescription: string,
  resumeContent: string,
  userName: string
) => {
  // Using gemini-3-flash-preview for typical career content generation tasks
  const model = 'gemini-3-flash-preview';
  
  const prompt = type === 'cover_letter' 
    ? `Act as a professional career coach. Write a highly tailored, compelling, and professional cover letter for ${userName} based on the following job description and resume.
       Job Description: ${jobDescription}
       Resume Content: ${resumeContent}
       The letter should be professional, minimalist, and persuasive. Use a modern business tone.`
    : `Act as a professional recruiter. Create a concise, high-impact professional resume summary for ${userName} that highlights the best matches between their skills and the job description.
       Job Description: ${jobDescription}
       Resume Content: ${resumeContent}
       Keep it under 4 sentences. Focus on results and value proposition.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    // Directly access the .text property on the response object
    return response.text || "Failed to generate content. Please try again.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
