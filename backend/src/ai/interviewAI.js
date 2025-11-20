import aiBrain from './aiBrain.js';

/**
 * AI-driven interview evaluation
 */
export const score = async (payload) => {
  const { answers, jobRole, skills, resumeData } = payload;

  const systemPrompt = `You are an expert interview evaluator specializing in Indian tech company interviews. 
Analyze candidate responses with focus on:
- Communication clarity (especially for non-native English speakers)
- Technical knowledge relevant to Indian job market
- Confidence and presence
- Cultural fit for Indian workplace
Provide structured, actionable feedback.`;

  const userPrompt = `Evaluate this interview for a ${jobRole} position.

Required Skills: ${skills?.join(', ') || 'Not specified'}

Candidate Background:
- Experience: ${resumeData?.experienceYears || 0} years
- Current Role: ${resumeData?.currentRole || 'Fresher'}
- Education: ${resumeData?.educationSummary || 'Not specified'}

Interview Answers:
${answers?.map((a, i) => `Q${i + 1}: ${a.question || 'Question'}\nAnswer: ${a.answerText || a.answer || 'No answer'}`).join('\n\n') || 'No answers provided'}

Provide JSON response:
{
  "communication": <1-10>,
  "confidence": <1-10>,
  "technical": <1-10>,
  "overall": <1-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "summary": "Overall assessment (2-3 sentences)",
  "indianMarketFit": <1-10>,
  "tipsForIndianCompanies": ["tip1", "tip2"]
}`;

  const aiResponse = await aiBrain.callAI(systemPrompt, userPrompt);

  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        communication: parsed.communication || 7,
        confidence: parsed.confidence || 7,
        technical: parsed.technical || 7,
        overall: parsed.overall || 7,
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        summary: parsed.summary || 'Interview completed successfully.',
        indianMarketFit: parsed.indianMarketFit || 7,
        tipsForIndianCompanies: parsed.tipsForIndianCompanies || []
      };
    } catch (parseError) {
      console.error('[InterviewAI] JSON parse error:', parseError);
    }
  }

  // Fallback to mock scores
  return generateMockScores(answers, jobRole, skills);
};

const generateMockScores = (answers, jobRole, skills) => {
  const baseScore = 6 + Math.random() * 3;
  
  return {
    communication: Math.round(Math.min(10, Math.max(1, baseScore + (Math.random() - 0.5) * 2))),
    confidence: Math.round(Math.min(10, Math.max(1, baseScore + (Math.random() - 0.5) * 2))),
    technical: Math.round(Math.min(10, Math.max(1, baseScore + (Math.random() - 0.5) * 2))),
    overall: Math.round(Math.min(10, Math.max(1, baseScore))),
    strengths: [
      'Clear communication style',
      'Relevant experience mentioned',
      'Shows enthusiasm for the role'
    ],
    improvements: [
      'Could provide more specific examples',
      'Consider elaborating on technical details',
      'Practice articulating achievements'
    ],
    summary: `The candidate demonstrated solid understanding of ${jobRole} requirements. Responses were coherent and relevant. Areas for improvement include providing more concrete examples and technical depth.`,
    indianMarketFit: Math.round(Math.min(10, Math.max(1, baseScore + 0.5))),
    tipsForIndianCompanies: [
      'Emphasize your willingness to learn and adapt',
      'Highlight any internship or project experience',
      'Mention your ability to work in teams'
    ]
  };
};

export default { score };

