import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Recruiter from '../models/Recruiter.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/placedai');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Recruiter.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@placedai.com',
      role: 'admin',
      otpHash: adminPassword
    });
    await admin.save();
    console.log('Created admin user');

    // Create sample jobs
    const jobs = [
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full stack developer to join our team.',
        skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        level: 'senior',
        location: 'Remote'
      },
      {
        title: 'Frontend Developer',
        description: 'Join our frontend team to build amazing user experiences.',
        skillsRequired: ['React', 'TypeScript', 'CSS', 'HTML', 'Redux'],
        level: 'mid',
        location: 'San Francisco, CA'
      },
      {
        title: 'Backend Engineer',
        description: 'Design and implement scalable backend systems.',
        skillsRequired: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
        level: 'mid',
        location: 'New York, NY'
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage infrastructure and deployment pipelines.',
        skillsRequired: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
        level: 'senior',
        location: 'Remote'
      },
      {
        title: 'Machine Learning Engineer',
        description: 'Build and deploy ML models for production.',
        skillsRequired: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Data Science'],
        level: 'senior',
        location: 'Seattle, WA'
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log(`Created ${createdJobs.length} jobs`);

    // Create sample recruiter
    const recruiterPassword = await bcrypt.hash('recruiter123', 10);
    const recruiterUser = new User({
      email: 'recruiter@test.com',
      role: 'recruiter',
      otpHash: recruiterPassword
    });
    await recruiterUser.save();

    const recruiter = new Recruiter({
      userId: recruiterUser._id,
      companyName: 'Tech Recruiters Inc',
      credits: 5,
      planType: 'basic',
      isApproved: true
    });
    await recruiter.save();
    console.log('Created sample recruiter');

    // Create sample candidate
    const candidatePassword = await bcrypt.hash('candidate123', 10);
    const candidate = new User({
      email: 'candidate@test.com',
      role: 'candidate',
      otpHash: candidatePassword,
      phone: '+1234567890',
      languages: ['English', 'Spanish'],
      ctc: 120000,
      resumeParsed: {
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experienceYears: 5,
        currentRole: 'Full Stack Developer',
        educationSummary: 'BS in Computer Science'
      },
      selectedRoleId: createdJobs[0]._id,
      selectedSkills: ['JavaScript', 'React', 'Node.js']
    });
    await candidate.save();
    console.log('Created sample candidate');

    console.log('\nSeed data created successfully!');
    console.log('\nTest accounts:');
    console.log('Admin: admin@placedai.com / admin123');
    console.log('Recruiter: recruiter@test.com / recruiter123');
    console.log('Candidate: candidate@test.com / candidate123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

