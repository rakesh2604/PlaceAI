import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';

/**
 * Parse PDF template and extract layout structure
 * @param {string} filePath - Path to PDF file
 * @returns {Object} Parsed layout JSON
 */
export const parsePDFTemplate = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Extract text with position information
    const text = data.text;
    const lines = text.split('\n').filter(line => line.trim());
    
    // Detect sections
    const sections = detectSections(lines);
    
    // Extract layout metadata
    const layoutMetadata = {
      pageCount: data.numpages,
      fonts: extractFonts(data),
      spacing: detectSpacing(lines),
      columns: detectColumns(lines)
    };
    
    return {
      sections,
      layoutMetadata,
      rawText: text
    };
  } catch (error) {
    console.error('Error parsing PDF template:', error);
    throw new Error('Failed to parse PDF template. Template may be too complex or corrupted.');
  }
};

/**
 * Parse DOCX template and extract layout structure
 * @param {string} filePath - Path to DOCX file
 * @returns {Object} Parsed layout JSON
 */
export const parseDOCXTemplate = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const result = await mammoth.convertToHtml({ buffer: dataBuffer });
    const html = result.value;
    
    // Parse HTML to extract structure
    const sections = parseHTMLStructure(html);
    
    // Extract formatting from HTML
    const layoutMetadata = {
      fonts: extractFontsFromHTML(html),
      spacing: detectSpacingFromHTML(html),
      columns: detectColumnsFromHTML(html),
      styles: extractStylesFromHTML(html)
    };
    
    return {
      sections,
      layoutMetadata,
      rawText: result.value
    };
  } catch (error) {
    console.error('Error parsing DOCX template:', error);
    throw new Error('Failed to parse DOCX template. Unsupported formatting may be present.');
  }
};

/**
 * Detect resume sections from text lines
 */
const detectSections = (lines) => {
  const sectionKeywords = {
    summary: ['summary', 'professional summary', 'objective', 'profile'],
    experience: ['experience', 'work experience', 'employment', 'career', 'professional experience'],
    education: ['education', 'academic', 'qualifications', 'degrees'],
    skills: ['skills', 'technical skills', 'competencies', 'expertise', 'technologies'],
    projects: ['projects', 'project experience', 'portfolio'],
    certifications: ['certifications', 'certificates', 'credentials', 'licenses'],
    achievements: ['achievements', 'awards', 'honors', 'accomplishments'],
    languages: ['languages', 'language proficiency']
  };
  
  const sections = [];
  let currentSection = null;
  let currentContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if line is a section header
    const lowerLine = line.toLowerCase();
    let matchedSection = null;
    
    for (const [sectionId, keywords] of Object.entries(sectionKeywords)) {
      for (const keyword of keywords) {
        if (lowerLine.includes(keyword) && line.length < 50) {
          // Save previous section
          if (currentSection) {
            sections.push({
              id: currentSection,
              style: detectSectionStyle(lines, i - currentContent.length, i),
              content: currentContent.join('\n'),
              items: currentSection === 'experience' || currentSection === 'education' || 
                     currentSection === 'projects' ? parseItems(currentContent) : []
            });
          }
          
          currentSection = sectionId;
          currentContent = [];
          matchedSection = sectionId;
          break;
        }
      }
      if (matchedSection) break;
    }
    
    if (!matchedSection && currentSection) {
      currentContent.push(line);
    }
  }
  
  // Add last section
  if (currentSection) {
    sections.push({
      id: currentSection,
      style: detectSectionStyle(lines, lines.length - currentContent.length, lines.length),
      content: currentContent.join('\n'),
      items: currentSection === 'experience' || currentSection === 'education' || 
             currentSection === 'projects' ? parseItems(currentContent) : []
    });
  }
  
  // If no sections detected, create default structure
  if (sections.length === 0) {
    return createDefaultSections(lines);
  }
  
  return sections;
};

/**
 * Parse items from content (for experience, education, projects)
 */
const parseItems = (content) => {
  const items = [];
  let currentItem = { content: [] };
  
  for (const line of content) {
    // Detect item start (usually title/company or date)
    if (line.match(/^\d{4}|\w+\s+\d{4}|present|current/i) || 
        line.length > 50 && !line.startsWith('•') && !line.startsWith('-')) {
      if (currentItem.content.length > 0) {
        items.push(parseItemContent(currentItem.content));
        currentItem = { content: [] };
      }
    }
    currentItem.content.push(line);
  }
  
  if (currentItem.content.length > 0) {
    items.push(parseItemContent(currentItem.content));
  }
  
  return items;
};

/**
 * Parse individual item content
 */
const parseItemContent = (lines) => {
  const item = {
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    achievements: []
  };
  
  // Try to extract structured data
  for (const line of lines) {
    if (line.match(/^\d{4}/)) {
      const dates = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
      if (dates) {
        item.startDate = dates[1];
        item.endDate = dates[2];
      }
    } else if (line.startsWith('•') || line.startsWith('-')) {
      item.achievements.push(line.replace(/^[•\-]\s*/, ''));
    } else if (line.length > 10 && !item.title) {
      item.title = line;
    } else if (line.length > 5 && !item.company) {
      item.company = line;
    } else {
      item.description += line + ' ';
    }
  }
  
  return item;
};

/**
 * Detect section style from lines
 */
const detectSectionStyle = (lines, startIdx, endIdx) => {
  const sectionLines = lines.slice(startIdx, endIdx);
  const hasBullets = sectionLines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
  const hasBold = sectionLines.some(line => line.length > 0 && line[0] === line[0].toUpperCase());
  
  return {
    hasBullets,
    alignment: 'left', // Default
    fontSize: 'normal',
    fontWeight: hasBold ? 'bold' : 'normal'
  };
};

/**
 * Create default sections when none detected
 */
const createDefaultSections = (lines) => {
  return [
    { id: 'summary', style: {}, content: '', items: [] },
    { id: 'experience', style: {}, content: '', items: [] },
    { id: 'education', style: {}, content: '', items: [] },
    { id: 'skills', style: {}, content: '', items: [] },
    { id: 'projects', style: {}, content: '', items: [] }
  ];
};

/**
 * Extract fonts from PDF data
 */
const extractFonts = (data) => {
  // PDF-parse doesn't provide detailed font info, return defaults
  return {
    primary: 'Arial',
    secondary: 'Times New Roman',
    sizes: { heading: 16, body: 12, subheading: 14 }
  };
};

/**
 * Detect spacing patterns
 */
const detectSpacing = (lines) => {
  const lineHeights = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() && lines[i-1].trim()) {
      lineHeights.push(1); // Normalized
    }
  }
  
  return {
    lineHeight: 1.5,
    paragraphSpacing: 1,
    sectionSpacing: 2
  };
};

/**
 * Detect column layout
 */
const detectColumns = (lines) => {
  // Simple heuristic: check if text spans are short (indicating columns)
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const hasColumns = avgLineLength < 60 && lines.length > 10;
  
  return {
    hasColumns,
    columnCount: hasColumns ? 2 : 1
  };
};

/**
 * Parse HTML structure from DOCX
 */
const parseHTMLStructure = (html) => {
  // Extract headings and paragraphs
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
  
  const sections = [];
  let matches;
  
  // Find headings
  const headings = [];
  while ((matches = headingRegex.exec(html)) !== null) {
    headings.push({ text: matches[1], index: matches.index });
  }
  
  // Map headings to sections
  for (const heading of headings) {
    const sectionId = mapHeadingToSection(heading.text);
    if (sectionId) {
      sections.push({
        id: sectionId,
        style: extractStyleFromHTML(html, heading.index),
        content: '',
        items: []
      });
    }
  }
  
  return sections.length > 0 ? sections : createDefaultSections([]);
};

/**
 * Map heading text to section ID
 */
const mapHeadingToSection = (headingText) => {
  const lower = headingText.toLowerCase();
  if (lower.includes('summary') || lower.includes('objective') || lower.includes('profile')) return 'summary';
  if (lower.includes('experience') || lower.includes('employment')) return 'experience';
  if (lower.includes('education') || lower.includes('qualification')) return 'education';
  if (lower.includes('skill')) return 'skills';
  if (lower.includes('project')) return 'projects';
  if (lower.includes('certif')) return 'certifications';
  if (lower.includes('achievement') || lower.includes('award')) return 'achievements';
  if (lower.includes('language')) return 'languages';
  return null;
};

/**
 * Extract fonts from HTML
 */
const extractFontsFromHTML = (html) => {
  const fontFamilyRegex = /font-family:\s*([^;]+)/gi;
  const fonts = [];
  let match;
  
  while ((match = fontFamilyRegex.exec(html)) !== null) {
    fonts.push(match[1].trim());
  }
  
  return {
    primary: fonts[0] || 'Arial',
    secondary: fonts[1] || 'Times New Roman',
    sizes: { heading: 16, body: 12, subheading: 14 }
  };
};

/**
 * Detect spacing from HTML
 */
const detectSpacingFromHTML = (html) => {
  return {
    lineHeight: 1.5,
    paragraphSpacing: 1,
    sectionSpacing: 2
  };
};

/**
 * Detect columns from HTML
 */
const detectColumnsFromHTML = (html) => {
  const hasColumns = html.includes('column') || html.includes('col-');
  return {
    hasColumns,
    columnCount: hasColumns ? 2 : 1
  };
};

/**
 * Extract styles from HTML
 */
const extractStylesFromHTML = (html) => {
  return {
    hasBold: html.includes('<strong>') || html.includes('<b>'),
    hasItalic: html.includes('<em>') || html.includes('<i>'),
    hasUnderline: html.includes('<u>')
  };
};

/**
 * Extract style from HTML at specific index
 */
const extractStyleFromHTML = (html, index) => {
  const snippet = html.substring(Math.max(0, index - 100), index + 100);
  return {
    hasBullets: snippet.includes('<ul>') || snippet.includes('<li>'),
    alignment: snippet.includes('text-align: center') ? 'center' : 
               snippet.includes('text-align: right') ? 'right' : 'left',
    fontSize: 'normal',
    fontWeight: snippet.includes('<strong>') || snippet.includes('<b>') ? 'bold' : 'normal'
  };
};

/**
 * Main function to parse template based on file type
 */
export const parseTemplate = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    return await parsePDFTemplate(filePath);
  } else if (ext === '.docx') {
    return await parseDOCXTemplate(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}. Only PDF and DOCX are supported.`);
  }
};

