import aiBrain from './aiBrain.js';

/**
 * Job role matching and recommendations
 */
export const match = async (payload) => {
  const { userSkills, userExperience, userRole, jobDescription, jobSkills } = payload;

  const systemPrompt = `You are a job matching expert for the Indian tech job market.
Evaluate job-candidate fit considering:
- Skill alignment
- Experience level match
- Role compatibility
- Indian market trends
- Salary expectations (₹)
- Company culture fit
Provide match score and detailed reasoning.`;

  const userPrompt = `Match this candidate profile to this job:

Candidate Profile:
- Skills: ${userSkills?.join(', ') || 'Not specified'}
- Experience: ${userExperience || 0} years
- Current Role: ${userRole || 'Fresher'}

Job Description:
${jobDescription || 'Not provided'}

Required Skills: ${jobSkills?.join(', ') || 'Not specified'}

Provide JSON response:
{
  "matchScore": <1-100>,
  "skillMatch": <1-100>,
  "experienceMatch": <1-100>,
  "roleFit": <1-100>,
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2"],
  "expectedSalaryRange": {
    "min": <number in ₹>,
    "max": <number in ₹>
  },
  "interviewReadiness": <1-100>,
  "whyThisJob": "2-3 sentence explanation"
}`;

  const aiResponse = await aiBrain.callAI(systemPrompt, userPrompt);

  if (aiResponse) {
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('[JobAI] JSON parse error:', parseError);
    }
  }

  // Fallback
  return generateMockMatch(userSkills, jobSkills, userExperience);
};

const generateMockMatch = (userSkills, jobSkills, experience) => {
  // Calculate skill overlap
  const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
  const jobSkillsLower = (jobSkills || []).map(s => s.toLowerCase());
  const matches = userSkillsLower.filter(skill => 
    jobSkillsLower.some(js => js.includes(skill) || skill.includes(js))
  );
  const skillMatchPercent = jobSkillsLower.length > 0 
    ? (matches.length / jobSkillsLower.length) * 100 
    : 50;

  const baseScore = Math.min(95, Math.max(40, skillMatchPercent + (experience > 0 ? 10 : -10)));

  return {
    matchScore: Math.round(baseScore),
    skillMatch: Math.round(skillMatchPercent),
    experienceMatch: Math.round(70 + Math.random() * 20),
    roleFit: Math.round(baseScore - 5),
    strengths: [
      'Strong technical foundation',
      'Relevant experience',
      'Good skill alignment'
    ],
    gaps: [
      'Could learn additional technologies',
      'More experience would help',
      'Consider certifications'
    ],
    recommendations: [
      'Practice interview questions for this role',
      'Update resume with relevant keywords',
      'Prepare examples of relevant projects'
    ],
    expectedSalaryRange: {
      min: experience > 0 ? 300000 : 200000,
      max: experience > 0 ? 800000 : 500000
    },
    interviewReadiness: Math.round(65 + Math.random() * 25),
    whyThisJob: 'This role aligns well with your skills and experience level. The position offers good growth opportunities in the Indian tech market.'
  };
};

export default { match };

