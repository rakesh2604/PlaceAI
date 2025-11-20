import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Download, Eye, Save, Plus, Trash2, ChevronRight, Upload, Linkedin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { userApi } from '../../services/candidateApi';
import ImportTemplateModal from '../../components/resume/ImportTemplateModal';
import ImportLinkedInModal from '../../components/resume/ImportLinkedInModal';

const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary design', category: 'Professional' },
  { id: 'classic', name: 'Classic', description: 'Traditional and timeless', category: 'Professional' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and ATS-friendly', category: 'ATS-Optimized' },
  { id: 'creative', name: 'Creative', description: 'Bold and eye-catching', category: 'Creative' },
  { id: 'professional', name: 'Professional', description: 'Corporate and polished', category: 'Business' },
  { id: 'executive', name: 'Executive', description: 'Executive-level sophistication', category: 'Executive' },
  { id: 'imported', name: 'Imported Template', description: 'Your custom template', category: 'Custom' },
];

const INITIAL_RESUME_DATA = {
  templateId: 'modern',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  achievements: [],
  certifications: [],
  languages: []
};

export default function ResumeBuilder() {
  const { user } = useAuthStore();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [currentSection, setCurrentSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedResumes, setSavedResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [showImportTemplateModal, setShowImportTemplateModal] = useState(false);
  const [showImportLinkedInModal, setShowImportLinkedInModal] = useState(false);
  const [improving, setImproving] = useState(false);

  // Load saved resumes on mount
  useEffect(() => {
    loadSavedResumes();
  }, []);

  // Load saved resumes
  const loadSavedResumes = async () => {
    try {
      const response = await api.get('/resume-builder/all');
      if (response.data?.resumes) {
        setSavedResumes(response.data.resumes);
        // Load active resume or first resume
        const active = response.data.resumes.find(r => r.isActive);
        if (active) {
          setActiveResumeId(active._id);
          setResumeData(active);
          setSelectedTemplate(active.templateId);
        } else if (response.data.resumes.length > 0) {
          setActiveResumeId(response.data.resumes[0]._id);
          setResumeData(response.data.resumes[0]);
          setSelectedTemplate(response.data.resumes[0].templateId);
        }
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  // Update resume data field
  const updateField = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: section === 'personalInfo' 
        ? { ...prev[section], [field]: value }
        : Array.isArray(prev[section])
          ? prev[section].map((item, idx) => idx === field ? value : item)
          : value
    }));
  };

  // Add array item
  const addItem = (section, newItem) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem]
    }));
  };

  // Remove array item
  const removeItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Save resume
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...resumeData,
        templateId: selectedTemplate,
        resumeId: activeResumeId || undefined
      };

      const response = await api.post('/resume-builder/save', payload);
      if (response.data?.resume) {
        await loadSavedResumes();
        setActiveResumeId(response.data.resume._id);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    if (!activeResumeId) {
      await handleSave();
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/resume-builder/${activeResumeId}/generate-pdf`);
      if (response.data?.pdfUrl) {
        // Download PDF
        window.open(response.data.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create new resume
  const handleNewResume = () => {
    setResumeData({ ...INITIAL_RESUME_DATA, templateId: selectedTemplate });
    setActiveResumeId(null);
    setCurrentSection('personal');
  };

  // Handle template import success
  const handleTemplateImportSuccess = (resume) => {
    setResumeData(resume);
    setActiveResumeId(resume._id);
    setSelectedTemplate('imported');
    loadSavedResumes();
  };

  // Handle LinkedIn import success
  const handleLinkedInImportSuccess = (resume) => {
    setResumeData(resume);
    setActiveResumeId(resume._id);
    loadSavedResumes();
  };

  // Improve resume with AI
  const handleImproveWithAI = async () => {
    if (!activeResumeId) {
      await handleSave();
      return;
    }

    setImproving(true);
    try {
      const response = await api.post(`/resume-builder/${activeResumeId}/improve-ai`, {
        jobDescription: '' // Can be extended to accept job description
      });

      if (response.data?.resume) {
        setResumeData(response.data.resume);
        alert('Resume improved with AI! Check the changes in your resume.');
      }
    } catch (error) {
      console.error('Error improving resume:', error);
      alert('Failed to improve resume. Please try again.');
    } finally {
      setImproving(false);
    }
  };

  // Resume Preview Component
  const ResumePreview = ({ data, template }) => {
    const { personalInfo, education, experience, skills, projects, achievements } = data;

    return (
      <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-cyan-500 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-dark-600 dark:text-dark-400">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
          </div>
          {(personalInfo.linkedin || personalInfo.github || personalInfo.website) && (
            <div className="flex gap-4 mt-2 text-sm">
              {personalInfo.linkedin && <a href={personalInfo.linkedin} className="text-cyan-600 dark:text-cyan-400">LinkedIn</a>}
              {personalInfo.github && <a href={personalInfo.github} className="text-cyan-600 dark:text-cyan-400">GitHub</a>}
              {personalInfo.website && <a href={personalInfo.website} className="text-cyan-600 dark:text-cyan-400">Website</a>}
            </div>
          )}
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Summary</h2>
            <p className="text-dark-700 dark:text-dark-300">{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-3">Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-dark-100">{exp.title}</h3>
                    <p className="text-sm text-dark-600 dark:text-dark-400">{exp.company} {exp.location && `• ${exp.location}`}</p>
                  </div>
                  <span className="text-sm text-dark-600 dark:text-dark-400">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.description && <p className="text-sm text-dark-700 dark:text-dark-300 mt-1">{exp.description}</p>}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-dark-700 dark:text-dark-300 mt-2 ml-4">
                    {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-3">Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-dark-100">{edu.degree}</h3>
                    <p className="text-sm text-dark-600 dark:text-dark-400">{edu.institution} {edu.location && `• ${edu.location}`}</p>
                  </div>
                  <span className="text-sm text-dark-600 dark:text-dark-400">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </span>
                </div>
                {edu.gpa && <p className="text-sm text-dark-700 dark:text-dark-300 mt-1">GPA: {edu.gpa}</p>}
                {edu.description && <p className="text-sm text-dark-700 dark:text-dark-300 mt-1">{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="px-3 py-1 bg-cyan-50 dark:bg-cyan-900/20 rounded-full text-sm text-dark-700 dark:text-dark-300">
                  {skill.category && <span className="font-semibold">{skill.category}: </span>}
                  {skill.items?.join(', ') || skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-3">Projects</h2>
            {projects.map((proj, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-dark-900 dark:text-dark-100">{proj.name}</h3>
                  {proj.link && <a href={proj.link} className="text-sm text-cyan-600 dark:text-cyan-400">View</a>}
                </div>
                {proj.description && <p className="text-sm text-dark-700 dark:text-dark-300">{proj.description}</p>}
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-xs text-dark-600 dark:text-dark-400 mt-1">Tech: {proj.technologies.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-3">Achievements</h2>
            {achievements.map((ach, idx) => (
              <div key={idx} className="mb-2">
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">{ach.title}</h3>
                {ach.description && <p className="text-sm text-dark-700 dark:text-dark-300">{ach.description}</p>}
                {ach.date && <p className="text-xs text-dark-600 dark:text-dark-400">{ach.date}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: FileText },
    { id: 'education', name: 'Education', icon: FileText },
    { id: 'experience', name: 'Experience', icon: FileText },
    { id: 'skills', name: 'Skills', icon: FileText },
    { id: 'projects', name: 'Projects', icon: FileText },
    { id: 'achievements', name: 'Achievements', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-dark-900 dark:text-[#F8F9FA]">Resume Builder</h1>
              <p className="text-sm text-dark-600 dark:text-[#CBD5E1]">Create professional resumes with live preview</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNewResume} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Resume
            </Button>
            <Button variant="outline" onClick={() => setShowImportTemplateModal(true)} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import Template
            </Button>
            <Button variant="outline" onClick={() => setShowImportLinkedInModal(true)} size="sm">
              <Linkedin className="w-4 h-4 mr-2" />
              Import LinkedIn
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleImproveWithAI} disabled={improving || !activeResumeId} size="sm" variant="secondary">
              <Sparkles className="w-4 h-4 mr-2" />
              {improving ? 'Improving...' : 'Improve with AI'}
            </Button>
            <Button onClick={handleGeneratePDF} disabled={loading} size="sm">
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr_2fr] gap-6">
          {/* Left Sidebar - Templates & Sections */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="p-4 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
              <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA] mb-3">Templates</h3>
              <div className="space-y-2">
                {TEMPLATES.map(template => {
                  // Show imported template only if resume has imported template
                  if (template.id === 'imported' && (!resumeData.importedTemplate || !resumeData.importedTemplate.parsedLayoutJson)) {
                    return null;
                  }
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedTemplate === template.id
                          ? 'bg-cyan-500 text-white'
                          : 'bg-dark-100 dark:bg-[#003566] text-dark-700 dark:text-[#CBD5E1] hover:bg-dark-200 dark:hover:bg-[#003566]'
                      }`}
                    >
                      {template.name}
                      {template.id === 'imported' && resumeData.importedTemplate && (
                        <span className="text-xs opacity-75 block mt-1">
                          {resumeData.importedTemplate.originalName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sections */}
            <div className="p-4 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
              <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA] mb-3">Sections</h3>
              <div className="space-y-1">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        currentSection === section.id
                          ? 'bg-cyan-500 text-white'
                          : 'text-dark-700 dark:text-[#CBD5E1] hover:bg-dark-100 dark:hover:bg-[#003566]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Middle - Form Editor */}
          <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] overflow-y-auto max-h-[calc(100vh-200px)]">
            {currentSection === 'personal' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-dark-900 dark:text-[#F8F9FA] mb-4">Personal Information</h2>
                <Input label="Full Name" value={resumeData.personalInfo.fullName} onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)} />
                <Input label="Email" type="email" value={resumeData.personalInfo.email} onChange={(e) => updateField('personalInfo', 'email', e.target.value)} />
                <Input label="Phone" value={resumeData.personalInfo.phone} onChange={(e) => updateField('personalInfo', 'phone', e.target.value)} />
                <Input label="Location" value={resumeData.personalInfo.location} onChange={(e) => updateField('personalInfo', 'location', e.target.value)} />
                <Input label="LinkedIn URL" value={resumeData.personalInfo.linkedin} onChange={(e) => updateField('personalInfo', 'linkedin', e.target.value)} />
                <Input label="GitHub URL" value={resumeData.personalInfo.github} onChange={(e) => updateField('personalInfo', 'github', e.target.value)} />
                <Input label="Website URL" value={resumeData.personalInfo.website} onChange={(e) => updateField('personalInfo', 'website', e.target.value)} />
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">Professional Summary</label>
                  <textarea
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => updateField('personalInfo', 'summary', e.target.value)}
                    className="w-full h-32 px-3 py-2 rounded-lg bg-white dark:bg-[#003566] border border-dark-200 dark:border-[#003566] text-dark-900 dark:text-[#F8F9FA]"
                    placeholder="Brief professional summary..."
                  />
                </div>
              </div>
            )}

            {currentSection === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-dark-900 dark:text-[#F8F9FA]">Education</h2>
                  <Button size="sm" onClick={() => addItem('education', { degree: '', institution: '', location: '', startDate: '', endDate: '', gpa: '', description: '' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </div>
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-dark-200 dark:border-[#003566] space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA]">Education #{idx + 1}</h3>
                      <Button size="sm" variant="outline" onClick={() => removeItem('education', idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input label="Degree" value={edu.degree || ''} onChange={(e) => updateField('education', idx, { ...edu, degree: e.target.value })} />
                    <Input label="Institution" value={edu.institution || ''} onChange={(e) => updateField('education', idx, { ...edu, institution: e.target.value })} />
                    <Input label="Location" value={edu.location || ''} onChange={(e) => updateField('education', idx, { ...edu, location: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Start Date" value={edu.startDate || ''} onChange={(e) => updateField('education', idx, { ...edu, startDate: e.target.value })} />
                      <Input label="End Date" value={edu.endDate || ''} onChange={(e) => updateField('education', idx, { ...edu, endDate: e.target.value })} />
                    </div>
                    <Input label="GPA" value={edu.gpa || ''} onChange={(e) => updateField('education', idx, { ...edu, gpa: e.target.value })} />
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">Description</label>
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => updateField('education', idx, { ...edu, description: e.target.value })}
                        className="w-full h-24 px-3 py-2 rounded-lg bg-white dark:bg-[#003566] border border-dark-200 dark:border-[#003566] text-dark-900 dark:text-[#F8F9FA]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentSection === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-dark-900 dark:text-[#F8F9FA]">Experience</h2>
                  <Button size="sm" onClick={() => addItem('experience', { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [] })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-dark-200 dark:border-[#003566] space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA]">Experience #{idx + 1}</h3>
                      <Button size="sm" variant="outline" onClick={() => removeItem('experience', idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input label="Job Title" value={exp.title || ''} onChange={(e) => updateField('experience', idx, { ...exp, title: e.target.value })} />
                    <Input label="Company" value={exp.company || ''} onChange={(e) => updateField('experience', idx, { ...exp, company: e.target.value })} />
                    <Input label="Location" value={exp.location || ''} onChange={(e) => updateField('experience', idx, { ...exp, location: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Start Date" value={exp.startDate || ''} onChange={(e) => updateField('experience', idx, { ...exp, startDate: e.target.value })} />
                      <Input label="End Date" value={exp.endDate || ''} onChange={(e) => updateField('experience', idx, { ...exp, endDate: e.target.value })} />
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={exp.current || false} onChange={(e) => updateField('experience', idx, { ...exp, current: e.target.checked })} />
                      <span className="text-sm text-dark-700 dark:text-[#CBD5E1]">Current Position</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">Description</label>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateField('experience', idx, { ...exp, description: e.target.value })}
                        className="w-full h-24 px-3 py-2 rounded-lg bg-white dark:bg-[#003566] border border-dark-200 dark:border-[#003566] text-dark-900 dark:text-[#F8F9FA]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentSection === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-dark-900 dark:text-[#F8F9FA]">Skills</h2>
                  <Button size="sm" onClick={() => addItem('skills', { category: '', items: [] })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill Category
                  </Button>
                </div>
                {resumeData.skills.map((skill, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-dark-200 dark:border-[#003566] space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA]">Skill Category #{idx + 1}</h3>
                      <Button size="sm" variant="outline" onClick={() => removeItem('skills', idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input label="Category" value={skill.category || ''} onChange={(e) => updateField('skills', idx, { ...skill, category: e.target.value })} />
                    <Input label="Skills (comma-separated)" value={Array.isArray(skill.items) ? skill.items.join(', ') : ''} onChange={(e) => updateField('skills', idx, { ...skill, items: e.target.value.split(',').map(s => s.trim()) })} />
                  </div>
                ))}
              </div>
            )}

            {currentSection === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-dark-900 dark:text-[#F8F9FA]">Projects</h2>
                  <Button size="sm" onClick={() => addItem('projects', { name: '', description: '', technologies: [], link: '', startDate: '', endDate: '' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-dark-200 dark:border-[#003566] space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA]">Project #{idx + 1}</h3>
                      <Button size="sm" variant="outline" onClick={() => removeItem('projects', idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input label="Project Name" value={proj.name || ''} onChange={(e) => updateField('projects', idx, { ...proj, name: e.target.value })} />
                    <Input label="Link" value={proj.link || ''} onChange={(e) => updateField('projects', idx, { ...proj, link: e.target.value })} />
                    <Input label="Technologies (comma-separated)" value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''} onChange={(e) => updateField('projects', idx, { ...proj, technologies: e.target.value.split(',').map(s => s.trim()) })} />
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">Description</label>
                      <textarea
                        value={proj.description || ''}
                        onChange={(e) => updateField('projects', idx, { ...proj, description: e.target.value })}
                        className="w-full h-24 px-3 py-2 rounded-lg bg-white dark:bg-[#003566] border border-dark-200 dark:border-[#003566] text-dark-900 dark:text-[#F8F9FA]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentSection === 'achievements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-dark-900 dark:text-[#F8F9FA]">Achievements</h2>
                  <Button size="sm" onClick={() => addItem('achievements', { title: '', description: '', date: '' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
                {resumeData.achievements.map((ach, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-dark-200 dark:border-[#003566] space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA]">Achievement #{idx + 1}</h3>
                      <Button size="sm" variant="outline" onClick={() => removeItem('achievements', idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input label="Title" value={ach.title || ''} onChange={(e) => updateField('achievements', idx, { ...ach, title: e.target.value })} />
                    <Input label="Date" value={ach.date || ''} onChange={(e) => updateField('achievements', idx, { ...ach, date: e.target.value })} />
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-[#CBD5E1] mb-2">Description</label>
                      <textarea
                        value={ach.description || ''}
                        onChange={(e) => updateField('achievements', idx, { ...ach, description: e.target.value })}
                        className="w-full h-24 px-3 py-2 rounded-lg bg-white dark:bg-[#003566] border border-dark-200 dark:border-[#003566] text-dark-900 dark:text-[#F8F9FA]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Live Preview */}
          <div className="p-6 rounded-xl border border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D] overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-900 dark:text-[#F8F9FA]">Live Preview</h3>
              <span className="text-xs text-dark-600 dark:text-[#CBD5E1] px-2 py-1 rounded bg-dark-100 dark:bg-[#003566]">
                {TEMPLATES.find(t => t.id === selectedTemplate)?.name} Template
              </span>
            </div>
            <ResumePreview data={resumeData} template={selectedTemplate} />
          </div>
        </div>
      </div>

      {/* Import Modals */}
      <ImportTemplateModal
        isOpen={showImportTemplateModal}
        onClose={() => setShowImportTemplateModal(false)}
        onSuccess={handleTemplateImportSuccess}
      />
      <ImportLinkedInModal
        isOpen={showImportLinkedInModal}
        onClose={() => setShowImportLinkedInModal(false)}
        onSuccess={handleLinkedInImportSuccess}
      />
    </div>
  );
}
