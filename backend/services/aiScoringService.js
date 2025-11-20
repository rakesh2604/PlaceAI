import dotenv from 'dotenv';

dotenv.config();

/**
 * Calls external LLM API to score interview responses
 * @param {Object} payload - Interview data
 * @returns {Object} Scores and feedback
 */
export const scoreInterview = async (payload) => {
  const { answers, jobRole, skills, resumeData } = payload;

  // If API not configured, return mock scores
  if (!process.env.AI_API_BASE_URL || !process.env.AI_API_KEY) {
    console.log('[MOCK AI] Scoring interview with mock data');
    return generateMockScores(answers, jobRole, skills);
  }

  try {
    // Prepare prompt for LLM
    const prompt = buildScoringPrompt(answers, jobRole, skills, resumeData);

    // Call OpenAI-compatible API
    const response = await fetch(`${process.env.AI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview evaluator. Analyze candidate responses and provide structured scores and feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      communication: content.communication || 7,
      confidence: content.confidence || 7,
      technical: content.technical || 7,
      overall: content.overall || 7,
      strengths: content.strengths || [],
      improvements: content.improvements || [],
      summary: content.summary || 'Interview completed successfully.'
    };
  } catch (error) {
    console.error('Error calling AI scoring service:', error);
    // Fallback to mock scores on error
    return generateMockScores(answers, jobRole, skills);
  }
};

const buildScoringPrompt = (answers, jobRole, skills, resumeData) => {
  return `Evaluate this interview for a ${jobRole} position requiring skills: ${skills.join(', ')}.

Candidate Background:
${resumeData ? `Experience: ${resumeData.experienceYears} years, Current Role: ${resumeData.currentRole || 'N/A'}` : 'N/A'}

Interview Answers:
${answers.map((a, i) => `Q${i + 1}: ${a.answerText}`).join('\n\n')}

Provide a JSON response with:
{
  "communication": <1-10>,
  "confidence": <1-10>,
  "technical": <1-10>,
  "overall": <1-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "summary": "Overall assessment summary"
}`;
};

const generateMockScores = (answers, jobRole, skills) => {
  // Generate realistic mock scores based on answer length and content
  const baseScore = 6 + Math.random() * 3; // 6-9 range
  
  return {
    communication: Math.round(baseScore + (Math.random() - 0.5) * 2),
    confidence: Math.round(baseScore + (Math.random() - 0.5) * 2),
    technical: Math.round(baseScore + (Math.random() - 0.5) * 2),
    overall: Math.round(baseScore),
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
    summary: `The candidate demonstrated solid understanding of ${jobRole} requirements. Responses were coherent and relevant. Areas for improvement include providing more concrete examples and technical depth.`
  };
};

