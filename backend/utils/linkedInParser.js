import { load } from 'cheerio';
import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';

/**
 * Parse LinkedIn profile from URL
 * @param {string} url - LinkedIn profile URL
 * @returns {Object} Parsed resume data
 */
export const parseLinkedInURL = async (url) => {
  try {
    // Fetch LinkedIn profile HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Extract profile data
    const resumeData = {
      name: extractName($),
      headline: extractHeadline($),
      summary: extractSummary($),
      experience: extractExperience($),
      education: extractEducation($),
      skills: extractSkills($),
      projects: extractProjects($),
      certifications: extractCertifications($),
      volunteering: extractVolunteering($)
    };
    
    return resumeData;
  } catch (error) {
    console.error('Error parsing LinkedIn URL:', error);
    throw new Error('Failed to parse LinkedIn profile. Please ensure the URL is public and accessible.');
  }
};

/**
 * Parse LinkedIn data export ZIP file
 * @param {string} zipPath - Path to LinkedIn ZIP file
 * @returns {Object} Parsed resume data
 */
export const parseLinkedInZIP = async (zipPath) => {
  try {
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    
    // Find JSON files
    const profileJson = findAndParseJSON(zip, zipEntries, 'Profile.json');
    const positionsJson = findAndParseJSON(zip, zipEntries, 'Positions.json');
    const educationJson = findAndParseJSON(zip, zipEntries, 'Education.json');
    const skillsJson = findAndParseJSON(zip, zipEntries, 'Skills.json');
    const certificationsJson = findAndParseJSON(zip, zipEntries, 'Certifications.json');
    const projectsJson = findAndParseJSON(zip, zipEntries, 'Projects.json');
    
    // Map to unified resume data format
    const resumeData = {
      name: extractNameFromProfile(profileJson),
      headline: extractHeadlineFromProfile(profileJson),
      summary: extractSummaryFromProfile(profileJson),
      experience: mapPositions(positionsJson),
      education: mapEducation(educationJson),
      skills: mapSkills(skillsJson),
      projects: mapProjects(projectsJson),
      certifications: mapCertifications(certificationsJson),
      volunteering: [] // LinkedIn export may not include this
    };
    
    return resumeData;
  } catch (error) {
    console.error('Error parsing LinkedIn ZIP:', error);
    throw new Error('Failed to parse LinkedIn ZIP export. Please ensure the file is a valid LinkedIn data export.');
  }
};

/**
 * Find and parse JSON file from ZIP
 */
const findAndParseJSON = (zip, entries, filename) => {
  const entry = entries.find(e => e.entryName.includes(filename) || e.entryName.endsWith(filename));
  if (!entry) {
    return null;
  }
  
  try {
    const content = zip.readAsText(entry);
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Failed to parse ${filename}:`, error);
    return null;
  }
};

/**
 * Extract name from LinkedIn HTML
 */
const extractName = ($) => {
  // Try multiple selectors
  const selectors = [
    'h1.text-heading-xlarge',
    'h1.pv-text-details__left-panel',
    'h1[data-anonymize="person-name"]',
    '.ph5 h1',
    'h1'
  ];
  
  for (const selector of selectors) {
    const name = $(selector).first().text().trim();
    if (name) return name;
  }
  
  return '';
};

/**
 * Extract headline from LinkedIn HTML
 */
const extractHeadline = ($) => {
  const selectors = [
    '.text-body-medium.break-words',
    '.pv-text-details__left-panel .text-body-medium',
    '[data-anonymize="headline"]',
    '.ph5 .text-body-medium'
  ];
  
  for (const selector of selectors) {
    const headline = $(selector).first().text().trim();
    if (headline) return headline;
  }
  
  return '';
};

/**
 * Extract summary/about from LinkedIn HTML
 */
const extractSummary = ($) => {
  const selectors = [
    '#about ~ .pvs-list__outer-container .inline-show-more-text',
    '.pv-about-section .inline-show-more-text',
    '[data-section="summary"] .inline-show-more-text',
    '#about + * .inline-show-more-text'
  ];
  
  for (const selector of selectors) {
    const summary = $(selector).first().text().trim();
    if (summary) return summary;
  }
  
  return '';
};

/**
 * Extract experience from LinkedIn HTML
 */
const extractExperience = ($) => {
  const experience = [];
  
  // Find experience section
  const expSection = $('#experience ~ .pvs-list, [data-section="experience"]').first();
  
  expSection.find('.pvs-list__outer-container > li').each((i, elem) => {
    const $elem = $(elem);
    const title = $elem.find('span[aria-hidden="true"]').first().text().trim();
    const company = $elem.find('span[aria-hidden="true"]').eq(1).text().trim();
    const dateRange = $elem.find('.pvs-entity__caption-wrapper .t-14').first().text().trim();
    const location = $elem.find('.t-14.t-normal.t-black--light').text().trim();
    const description = $elem.find('.inline-show-more-text').text().trim();
    
    // Parse date range
    const dates = parseDateRange(dateRange);
    
    if (title || company) {
      experience.push({
        title: title || '',
        company: company || '',
        location: location || '',
        startDate: dates.startDate || '',
        endDate: dates.endDate || '',
        current: dates.current || false,
        description: description || '',
        achievements: description ? description.split('\n').filter(l => l.trim()) : []
      });
    }
  });
  
  return experience;
};

/**
 * Extract education from LinkedIn HTML
 */
const extractEducation = ($) => {
  const education = [];
  
  const eduSection = $('#education ~ .pvs-list, [data-section="education"]').first();
  
  eduSection.find('.pvs-list__outer-container > li').each((i, elem) => {
    const $elem = $(elem);
    const degree = $elem.find('span[aria-hidden="true"]').first().text().trim();
    const institution = $elem.find('span[aria-hidden="true"]').eq(1).text().trim();
    const dateRange = $elem.find('.pvs-entity__caption-wrapper .t-14').first().text().trim();
    const gpa = $elem.find('.t-14.t-normal').text().trim();
    
    const dates = parseDateRange(dateRange);
    
    if (degree || institution) {
      education.push({
        degree: degree || '',
        institution: institution || '',
        location: '',
        startDate: dates.startDate || '',
        endDate: dates.endDate || '',
        gpa: gpa || '',
        description: ''
      });
    }
  });
  
  return education;
};

/**
 * Extract skills from LinkedIn HTML
 */
const extractSkills = ($) => {
  const skills = [];
  
  const skillsSection = $('#skills ~ .pvs-list, [data-section="skills"]').first();
  
  skillsSection.find('.pvs-list__outer-container > li').each((i, elem) => {
    const skill = $(elem).find('span[aria-hidden="true"]').first().text().trim();
    if (skill) {
      skills.push({
        category: '',
        items: [skill]
      });
    }
  });
  
  // If no structured skills, try to find skills section text
  if (skills.length === 0) {
    const skillsText = $('#skills').next().text();
    if (skillsText) {
      const skillList = skillsText.split(',').map(s => s.trim()).filter(s => s);
      if (skillList.length > 0) {
        skills.push({
          category: '',
          items: skillList
        });
      }
    }
  }
  
  return skills;
};

/**
 * Extract projects from LinkedIn HTML
 */
const extractProjects = ($) => {
  const projects = [];
  
  const projectsSection = $('#projects ~ .pvs-list, [data-section="projects"]').first();
  
  projectsSection.find('.pvs-list__outer-container > li').each((i, elem) => {
    const $elem = $(elem);
    const name = $elem.find('span[aria-hidden="true"]').first().text().trim();
    const dateRange = $elem.find('.pvs-entity__caption-wrapper .t-14').first().text().trim();
    const description = $elem.find('.inline-show-more-text').text().trim();
    const link = $elem.find('a').attr('href') || '';
    
    const dates = parseDateRange(dateRange);
    
    if (name) {
      projects.push({
        name: name || '',
        description: description || '',
        technologies: [],
        link: link || '',
        startDate: dates.startDate || '',
        endDate: dates.endDate || ''
      });
    }
  });
  
  return projects;
};

/**
 * Extract certifications from LinkedIn HTML
 */
const extractCertifications = ($) => {
  const certifications = [];
  
  const certsSection = $('#licenses_and_certifications ~ .pvs-list, [data-section="certifications"]').first();
  
  certsSection.find('.pvs-list__outer-container > li').each((i, elem) => {
    const $elem = $(elem);
    const name = $elem.find('span[aria-hidden="true"]').first().text().trim();
    const issuer = $elem.find('span[aria-hidden="true"]').eq(1).text().trim();
    const dateRange = $elem.find('.pvs-entity__caption-wrapper .t-14').first().text().trim();
    
    const dates = parseDateRange(dateRange);
    
    if (name) {
      certifications.push({
        name: name || '',
        issuer: issuer || '',
        date: dates.endDate || dates.startDate || '',
        expiryDate: ''
      });
    }
  });
  
  return certifications;
};

/**
 * Extract volunteering from LinkedIn HTML
 */
const extractVolunteering = ($) => {
  // Similar structure to experience
  return [];
};

/**
 * Parse date range string
 */
const parseDateRange = (dateRange) => {
  if (!dateRange) return { startDate: '', endDate: '', current: false };
  
  const currentPattern = /present|current/i;
  const isCurrent = currentPattern.test(dateRange);
  
  // Try to extract years
  const yearPattern = /(\d{4})/g;
  const years = dateRange.match(yearPattern) || [];
  
  let startDate = '';
  let endDate = '';
  
  if (years.length >= 2) {
    startDate = years[0];
    endDate = years[1];
  } else if (years.length === 1) {
    startDate = years[0];
    endDate = isCurrent ? 'Present' : years[0];
  }
  
  return {
    startDate,
    endDate: isCurrent ? 'Present' : endDate,
    current: isCurrent
  };
};

/**
 * Extract name from LinkedIn Profile.json
 */
const extractNameFromProfile = (profileJson) => {
  if (!profileJson) return '';
  
  const firstName = profileJson?.firstName?.localized?.en_US || profileJson?.firstName || '';
  const lastName = profileJson?.lastName?.localized?.en_US || profileJson?.lastName || '';
  
  return `${firstName} ${lastName}`.trim();
};

/**
 * Extract headline from LinkedIn Profile.json
 */
const extractHeadlineFromProfile = (profileJson) => {
  if (!profileJson) return '';
  
  return profileJson?.headline?.localized?.en_US || profileJson?.headline || '';
};

/**
 * Extract summary from LinkedIn Profile.json
 */
const extractSummaryFromProfile = (profileJson) => {
  if (!profileJson) return '';
  
  return profileJson?.summary?.localized?.en_US || profileJson?.summary || '';
};

/**
 * Map LinkedIn positions to resume experience format
 */
const mapPositions = (positionsJson) => {
  if (!positionsJson || !Array.isArray(positionsJson)) return [];
  
  return positionsJson.map(pos => {
    const company = pos?.companyName || '';
    const title = pos?.title || '';
    const description = pos?.description?.localized?.en_US || pos?.description || '';
    const location = pos?.locationName || '';
    const startDate = pos?.timePeriod?.startDate ? 
      `${pos.timePeriod.startDate.month || ''}/${pos.timePeriod.startDate.year || ''}` : '';
    const endDate = pos?.timePeriod?.endDate ?
      `${pos.timePeriod.endDate.month || ''}/${pos.timePeriod.endDate.year || ''}` : 'Present';
    const current = !pos?.timePeriod?.endDate;
    
    return {
      title: title || '',
      company: company || '',
      location: location || '',
      startDate: startDate || '',
      endDate: endDate || '',
      current: current || false,
      description: description || '',
      achievements: description ? description.split('\n').filter(l => l.trim()) : []
    };
  });
};

/**
 * Map LinkedIn education to resume education format
 */
const mapEducation = (educationJson) => {
  if (!educationJson || !Array.isArray(educationJson)) return [];
  
  return educationJson.map(edu => {
    const degree = edu?.degreeName || '';
    const institution = edu?.schoolName || '';
    const startDate = edu?.timePeriod?.startDate ?
      `${edu.timePeriod.startDate.year || ''}` : '';
    const endDate = edu?.timePeriod?.endDate ?
      `${edu.timePeriod.endDate.year || ''}` : 'Present';
    
    return {
      degree: degree || '',
      institution: institution || '',
      location: '',
      startDate: startDate || '',
      endDate: endDate || '',
      gpa: '',
      description: ''
    };
  });
};

/**
 * Map LinkedIn skills to resume skills format
 */
const mapSkills = (skillsJson) => {
  if (!skillsJson || !Array.isArray(skillsJson)) return [];
  
  // Group skills by category if available
  const skills = [];
  const items = skillsJson.map(skill => 
    skill?.name?.localized?.en_US || skill?.name || ''
  ).filter(s => s);
  
  if (items.length > 0) {
    skills.push({
      category: '',
      items: items
    });
  }
  
  return skills;
};

/**
 * Map LinkedIn projects to resume projects format
 */
const mapProjects = (projectsJson) => {
  if (!projectsJson || !Array.isArray(projectsJson)) return [];
  
  return projectsJson.map(proj => {
    const name = proj?.title?.localized?.en_US || proj?.title || '';
    const description = proj?.description?.localized?.en_US || proj?.description || '';
    const startDate = proj?.timePeriod?.startDate ?
      `${proj.timePeriod.startDate.year || ''}` : '';
    const endDate = proj?.timePeriod?.endDate ?
      `${proj.timePeriod.endDate.year || ''}` : 'Present';
    
    return {
      name: name || '',
      description: description || '',
      technologies: [],
      link: '',
      startDate: startDate || '',
      endDate: endDate || ''
    };
  });
};

/**
 * Map LinkedIn certifications to resume certifications format
 */
const mapCertifications = (certificationsJson) => {
  if (!certificationsJson || !Array.isArray(certificationsJson)) return [];
  
  return certificationsJson.map(cert => {
    const name = cert?.name?.localized?.en_US || cert?.name || '';
    const issuer = cert?.authority?.localized?.en_US || cert?.authority || '';
    const issueDate = cert?.timePeriod?.startDate ?
      `${cert.timePeriod.startDate.month || ''}/${cert.timePeriod.startDate.year || ''}` : '';
    const expiryDate = cert?.timePeriod?.endDate ?
      `${cert.timePeriod.endDate.month || ''}/${cert.timePeriod.endDate.year || ''}` : '';
    
    return {
      name: name || '',
      issuer: issuer || '',
      date: issueDate || '',
      expiryDate: expiryDate || ''
    };
  });
};

