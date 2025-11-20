import aiBrain from './aiBrain.js';

/**
 * FAQ and chatbot responses
 */
const faqDatabase = {
  'how to use placedai': {
    answer: `PlacedAI is your AI-powered placement preparation platform. Here's how to get started:

1. **Sign Up**: Create a free account with your email
2. **Upload Resume**: Add your resume to get personalized analysis
3. **Practice Interviews**: Take AI-powered mock interviews anytime
4. **Get Feedback**: Receive detailed scores and improvement tips
5. **Find Jobs**: Get matched with relevant job opportunities

All features are designed specifically for Indian students and freshers!`,
    category: 'getting-started'
  },
  'how ai interviews work': {
    answer: `Our AI interview system works like this:

1. **Select Role**: Choose the job role you're preparing for
2. **Answer Questions**: Our AI asks relevant questions (just like real interviews)
3. **AI Analysis**: We evaluate your:
   - Communication skills
   - Technical knowledge
   - Confidence and presence
   - Cultural fit for Indian companies
4. **Get Feedback**: Receive detailed scores and actionable tips

The AI is trained on thousands of real Indian company interviews, so you get authentic practice!`,
    category: 'interviews'
  },
  'how resumes are analyzed': {
    answer: `PlacedAI analyzes your resume using advanced AI to evaluate:

1. **ATS Compatibility**: How well your resume passes Applicant Tracking Systems
2. **Keyword Optimization**: Whether you have relevant industry keywords
3. **Formatting**: Structure, readability, and professional appearance
4. **Content Quality**: Impact of achievements, clarity of descriptions
5. **Indian Market Fit**: Relevance for Indian job market standards

You'll get:
- Overall score (1-100)
- Detailed breakdown by category
- Specific improvement suggestions
- Missing keywords to add
- Formatting recommendations`,
    category: 'resume'
  },
  'how ats scoring works': {
    answer: `ATS (Applicant Tracking System) scoring evaluates how well your resume will pass automated screening systems used by companies.

**What we check:**
- ✅ Keyword matching with job descriptions
- ✅ Proper section headings (Experience, Education, Skills)
- ✅ Text-based format (not scanned images)
- ✅ Clean, simple formatting
- ✅ Industry-standard structure
- ✅ Quantifiable achievements

**Your ATS Score includes:**
- Overall ATS compatibility (1-100)
- Keyword match percentage
- Formatting score
- Missing keywords list
- Optimization tips

**Pro Tip**: Most Indian companies (TCS, Infosys, Wipro, etc.) use ATS systems. A score above 75 is considered good!`,
    category: 'resume'
  },
  'how payments premium work': {
    answer: `PlacedAI offers flexible pricing for Indian students:

**Free Plan:**
- 3 AI interviews per month
- Basic resume analysis
- Job recommendations
- Perfect for trying out PlacedAI!

**Premium Plans:**
- **Starter (₹499/month)**: 10 interviews, advanced resume analysis, priority support
- **Pro (₹999/month)**: Unlimited interviews, ATS optimization, interview coaching
- **Student Discount**: Special rates for verified students!

**Payment Methods:**
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards
- Net Banking

All plans auto-renew monthly. Cancel anytime!`,
    category: 'pricing'
  },
  'how recruiters interact': {
    answer: `Recruiters on PlacedAI can:

1. **Browse Candidates**: View profiles of students who've opted in
2. **Filter by Skills**: Find candidates matching specific requirements
3. **View Interview Scores**: See AI-evaluated interview performance
4. **Check Resume Scores**: Review ATS and overall resume quality
5. **Send Opt-in Requests**: Reach out to candidates they're interested in

**For Students:**
- You control who sees your profile
- Opt-in to share your profile with recruiters
- Get matched with relevant opportunities
- No spam - only verified recruiters

**Privacy**: Your data is only shared when you explicitly opt-in to a recruiter's request.`,
    category: 'recruiters'
  }
};

export const answer = async (payload) => {
  const { query, context } = payload;
  const lowerQuery = (query || '').toLowerCase().trim();

  // Check exact matches first
  for (const [key, data] of Object.entries(faqDatabase)) {
    if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
      return {
        answer: data.answer,
        category: data.category,
        confidence: 0.9,
        source: 'faq-database'
      };
    }
  }

  // Use AI for complex queries
  const systemPrompt = `You are a helpful assistant for PlacedAI, an AI-powered placement preparation platform for Indian students.

Your role:
- Answer questions about PlacedAI features
- Help students understand how to use the platform
- Provide tips for interviews, resumes, and job search
- Be friendly, professional, and encouraging
- Focus on Indian job market context
- Use simple, clear language (many users are non-native English speakers)

Always be helpful and provide actionable advice.`;

  const userPrompt = `User Question: ${query}

Context: ${context || 'No additional context'}

Provide a helpful, detailed answer. If the question is about:
- PlacedAI features: Explain how it works
- Interviews: Give practical tips for Indian companies
- Resumes: Provide ATS and formatting advice
- Job search: Share Indian market insights
- Pricing: Explain plans and payment options

Format your response as clear, friendly text. Use bullet points if helpful.`;

  const aiResponse = await aiBrain.callAI(systemPrompt, userPrompt, {
    temperature: 0.8,
    responseFormat: null // Text response, not JSON
  });

  if (aiResponse) {
    return {
      answer: aiResponse,
      category: 'general',
      confidence: 0.7,
      source: 'ai-generated'
    };
  }

  // Fallback response
  return {
    answer: `Thanks for your question! I'm here to help with PlacedAI. 

Could you be more specific? I can help with:
- How to use PlacedAI
- AI interview preparation
- Resume analysis and ATS scoring
- Job recommendations
- Pricing and plans
- Recruiter interactions

Feel free to ask me anything about placement preparation!`,
    category: 'general',
    confidence: 0.5,
    source: 'fallback'
  };
};

export default { answer };

