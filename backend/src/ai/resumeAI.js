import aiBrain from './aiBrain.js';

/**
 * Resume analysis and ATS scoring
 */
export const analyze = async (payload) => {
  const { resumeText, resumeData, jobRole } = payload;

  const systemPrompt = `You are an expert resume analyst specializing in Indian job market. 
Analyze resumes with focus on:
- ATS (Applicant Tracking System) compatibility
- Keyword optimization for Indian companies
- Formatting and readability
- Content quality and impact
- Industry relevance
Provide actionable improvement suggestions.`;

  const userPrompt = `Analyze this resume for a ${jobRole || 'general tech'} position in India.

Resume Text:
${resumeText || 'No resume text provided'}

Parsed Data:
- Skills: ${resumeData?.skills?.join(', ') || 'Not extracted'}
- Experience: ${resumeData?.experienceYears || 0} years
- Current Role: ${resumeData?.currentRole || 'Fresher'}

Provide JSON response:
{
  "overallScore": <1-100>,
  "keywordMatch": <1-100>,
  "readability": <1-100>,
  "formatting": <1-100>,
  "contentQuality": <1-100>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestedKeywords": ["keyword1", "keyword2"],
  "recommendedFixes": ["fix1", "fix2"],
  "atsCompatibility": <1-100>,
  "indianMarketRelevance": <1-100>
}`;

  const aiResponse = await aiBrain.callAI(systemPrompt, userPrompt);

  if (aiResponse) {
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('[ResumeAI] JSON parse error:', parseError);
    }
  }

  // Fallback
  return generateMockAnalysis(resumeData);
};

export const atsScore = async (payload) => {
  const { resumeText, resumeData, jobDescription, jobRole } = payload;

  const systemPrompt = `You are an ATS (Applicant Tracking System) expert. 
Evaluate resume ATS compatibility with focus on:
- Keyword matching against job description
- Formatting (no complex layouts, proper headings)
- File structure (text-based, parseable)
- Industry-standard sections
- Indian job market ATS systems (Naukri, LinkedIn, company portals)
Provide detailed ATS score and optimization tips.`;

  const jobDesc = jobDescription || `Position: ${jobRole || 'Software Developer'}`;
  const resume = resumeText || 'No resume text provided';

  const userPrompt = `Evaluate ATS compatibility for this resume against this job:

Job Description:
${jobDesc}

Resume Text:
${resume}

Provide JSON response:
{
  "score": <1-100>,
  "keywordMatch": <1-100>,
  "readability": <1-100>,
  "formatting": <1-100>,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestedKeywords": ["keyword1", "keyword2"],
  "recommendedFixes": ["fix1", "fix2"],
  "missingSections": ["section1", "section2"],
  "atsOptimizationTips": ["tip1", "tip2"],
  "suggestedSummary": "Improved professional summary text",
  "improvedExperience": [
    {
      "description": "Improved description using STAR method",
      "achievements": ["Improved bullet point 1", "Improved bullet point 2"]
    }
  ]
}`;

  const aiResponse = await aiBrain.callAI(systemPrompt, userPrompt);

  if (aiResponse) {
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('[ResumeAI] ATS JSON parse error:', parseError);
    }
  }

  // Fallback
  return generateMockATSScore(resumeData, jobRole);
};

const generateMockAnalysis = (resumeData) => {
  const baseScore = 65 + Math.random() * 25;
  
  return {
    overallScore: Math.round(baseScore),
    keywordMatch: Math.round(60 + Math.random() * 30),
    readability: Math.round(70 + Math.random() * 20),
    formatting: Math.round(65 + Math.random() * 25),
    contentQuality: Math.round(baseScore),
    strengths: [
      'Clear structure',
      'Relevant skills listed',
      'Professional formatting'
    ],
    weaknesses: [
      'Could add more quantifiable achievements',
      'Missing some industry keywords',
      'Summary could be more impactful'
    ],
    suggestedKeywords: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
    recommendedFixes: [
      'Add metrics to achievements (e.g., "Improved performance by 30%")',
      'Include more action verbs',
      'Optimize for ATS by using standard section headings'
    ],
    atsCompatibility: Math.round(70 + Math.random() * 20),
    indianMarketRelevance: Math.round(65 + Math.random() * 25)
  };
};

const generateMockATSScore = (resumeData, jobRole) => {
  const baseScore = 70 + Math.random() * 20;
  
  return {
    score: Math.round(baseScore),
    keywordMatch: Math.round(65 + Math.random() * 25),
    readability: Math.round(75 + Math.random() * 15),
    formatting: Math.round(70 + Math.random() * 20),
    strengths: [
      'Clean formatting',
      'Standard section structure',
      'Text-based content'
    ],
    weaknesses: [
      'Missing some job-relevant keywords',
      'Could improve section headings',
      'Add more quantifiable metrics'
    ],
    suggestedKeywords: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'REST API'],
    recommendedFixes: [
      'Use standard headings: "Experience", "Education", "Skills"',
      'Add more industry-specific keywords',
      'Include metrics in bullet points',
      'Ensure file is text-searchable (not image-based)'
    ],
    missingSections: [],
    atsOptimizationTips: [
      'Use simple, clean formatting',
      'Include keywords from job description',
      'Use standard section names',
      'Save as PDF with text layer (not scanned image)'
    ],
    suggestedSummary: resumeData?.personalInfo?.summary || 'Experienced professional with strong technical skills and proven track record.',
    improvedExperience: resumeData?.experience?.map(exp => ({
      description: exp.description || '',
      achievements: exp.achievements?.map(ach => `Improved: ${ach}`) || []
    })) || []
  };
};

export default { analyze, atsScore };

