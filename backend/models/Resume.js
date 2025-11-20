import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: String,
    required: true,
    enum: ['modern', 'classic', 'minimal', 'creative', 'professional', 'executive', 'imported']
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    website: String,
    summary: String
  },
  education: [{
    degree: String,
    institution: String,
    location: String,
    startDate: String,
    endDate: String,
    gpa: String,
    description: String
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String,
    achievements: [String]
  }],
  skills: [{
    category: String,
    items: [String]
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String,
    startDate: String,
    endDate: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    expiryDate: String
  }],
  languages: [{
    language: String,
    proficiency: String
  }],
  pdfUrl: String,
  previewUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  // Imported template support
  importedTemplate: {
    originalName: String,
    fileUrl: String,
    parsedLayoutJson: {
      sections: [{
        id: String,
        style: mongoose.Schema.Types.Mixed,
        content: String,
        items: [mongoose.Schema.Types.Mixed]
      }],
      layoutMetadata: mongoose.Schema.Types.Mixed
    },
    importedAt: Date
  },
  // LinkedIn import support
  linkedInData: {
    parsedData: mongoose.Schema.Types.Mixed,
    importedAt: Date,
    importSource: {
      type: String,
      enum: ['url', 'zip'],
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;

