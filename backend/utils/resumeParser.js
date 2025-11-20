import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

/**
 * Parse resume file and extract structured data
 * @param {string} filePath - Path to resume file
 * @returns {Object} Parsed resume data
 */
export const parseResume = async (filePath) => {
  try {
    // Read file
    const dataBuffer = await fs.readFile(filePath);
    
    // Parse PDF
    const data = await pdfParse(dataBuffer);
    const text = data.text.toLowerCase();

    // Extract skills
    const skills = extractSkills(text);
    
    // Extract experience years
    const experienceYears = extractExperienceYears(text);
    
    // Extract current role
    const currentRole = extractCurrentRole(text);
    
    // Extract education summary
    const educationSummary = extractEducation(text);

    return {
      skills,
      experienceYears,
      currentRole,
      educationSummary,
      rawText: data.text
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    // Return minimal data on error
    return {
      skills: [],
      experienceYears: 0,
      currentRole: null,
      educationSummary: null,
      rawText: ''
    };
  }
};

const extractSkills = (text) => {
  const skills = [];
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'express', 'mongodb',
    'sql', 'aws', 'docker', 'kubernetes', 'git', 'typescript', 'angular',
    'vue', 'html', 'css', 'redux', 'graphql', 'rest api', 'microservices',
    'machine learning', 'ai', 'data science', 'agile', 'scrum', 'ci/cd'
  ];

  // Look for skills section
  const skillsSection = text.match(/(?:skills|technical skills|technologies|expertise)[\s:]*([^\n]+(?:\n[^\n]+){0,10})/i);
  
  if (skillsSection) {
    const skillsText = skillsSection[1];
    commonSkills.forEach(skill => {
      if (skillsText.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
  }

  // Also check entire text for skill mentions
  if (skills.length === 0) {
    commonSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
  }

  return [...new Set(skills)]; // Remove duplicates
};

const extractExperienceYears = (text) => {
  // Look for patterns like "5 years", "5+ years", "5 yrs"
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i,
    /experience[:\s]+(\d+)\+?\s*(?:years?|yrs?)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  // Fallback: estimate from dates
  const yearPattern = /(19|20)\d{2}/g;
  const years = text.match(yearPattern);
  if (years && years.length >= 2) {
    const sortedYears = years.map(y => parseInt(y)).sort((a, b) => b - a);
    const diff = sortedYears[0] - sortedYears[sortedYears.length - 1];
    return Math.min(diff, 15); // Cap at 15 years
  }

  return 0;
};

const extractCurrentRole = (text) => {
  // Look for current/current role section
  const currentPatterns = [
    /(?:current|present)[\s:]+(?:role|position|title)[\s:]+([^\n]+)/i,
    /(?:software engineer|developer|engineer|manager|lead|architect|analyst)[\s]+(?:at|@)[\s]+([^\n]+)/i
  ];

  for (const pattern of currentPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Try to find job titles
  const titles = ['software engineer', 'developer', 'senior engineer', 'tech lead', 'manager'];
  for (const title of titles) {
    if (text.includes(title)) {
      return title;
    }
  }

  return null;
};

const extractEducation = (text) => {
  // Look for education section
  const eduPattern = /(?:education|qualification)[\s:]*([^\n]+(?:\n[^\n]+){0,5})/i;
  const match = text.match(eduPattern);
  
  if (match) {
    return match[1].substring(0, 200).trim(); // Limit length
  }

  // Look for degree mentions
  const degrees = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'mba'];
  for (const degree of degrees) {
    if (text.includes(degree)) {
      return `Education: ${degree}`;
    }
  }

  return null;
};

