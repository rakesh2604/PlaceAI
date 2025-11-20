import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.js';
import Interview from '../models/Interview.js';
import JudgeEvaluation from '../models/JudgeEvaluation.js';
import EvaluationJob from '../models/EvaluationJob.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = express.Router();

// Start judge evaluation (async job)
router.post('/evaluate',
  authenticate,
  requireRole('recruiter', 'admin'),
  idempotencyMiddleware,
  body('interviewId').isMongoId(),
  body('judgeName').optional().isString(),
  body('judgeRole').optional().isIn(['hiring-manager', 'technical-lead', 'hr', 'peer', 'admin']),
  body('weight').optional().isFloat({ min: 0, max: 2 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { interviewId, judgeName, judgeRole, weight } = req.body;
      
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found' });
      }

      // Check if evaluation already exists for this judge
      const existing = await JudgeEvaluation.findOne({
        interviewId,
        judgeId: req.user._id
      });

      if (existing && existing.status === 'completed') {
        return res.json({
          evaluationId: existing._id.toString(),
          status: 'completed',
          message: 'Evaluation already completed'
        });
      }

      // Create or update evaluation
      let evaluation;
      if (existing) {
        evaluation = existing;
        evaluation.status = 'pending';
      } else {
        evaluation = new JudgeEvaluation({
          interviewId,
          judgeId: req.user._id,
          judgeName: judgeName || req.user.name || 'Anonymous Judge',
          judgeRole: judgeRole || 'hiring-manager',
          weight: weight || 1.0,
          status: 'pending'
        });
      }
      await evaluation.save();

      // Start async evaluation (non-blocking)
      processJudgeEvaluation(evaluation._id).catch(err => {
        console.error('Error processing judge evaluation:', err);
      });

      res.json({
        evaluationId: evaluation._id.toString(),
        status: 'pending',
        message: 'Judge evaluation job started'
      });
    } catch (error) {
      console.error('Error starting judge evaluation:', error);
      res.status(500).json({ message: 'Failed to start judge evaluation' });
    }
  }
);

// Get judge evaluation status
router.get('/evaluation/:evaluationId', authenticate, async (req, res) => {
  try {
    const evaluation = await JudgeEvaluation.findOne({
      _id: req.params.evaluationId,
      judgeId: req.user._id
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.json({
      evaluationId: evaluation._id.toString(),
      status: evaluation.status,
      scores: evaluation.scores,
      feedback: evaluation.feedback,
      weight: evaluation.weight
    });
  } catch (error) {
    console.error('Error fetching judge evaluation:', error);
    res.status(500).json({ message: 'Failed to fetch evaluation' });
  }
});

// Get aggregated evaluations for interview
router.get('/interview/:interviewId/aggregated', authenticate, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check permissions
    if (req.user.role === 'candidate' && interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const evaluations = await JudgeEvaluation.find({
      interviewId: req.params.interviewId,
      status: 'completed'
    });

    // Weighted aggregation
    const aggregated = aggregateEvaluations(evaluations);

    res.json({
      interviewId: req.params.interviewId,
      evaluations: evaluations.map(e => ({
        evaluationId: e._id.toString(),
        judgeName: e.judgeName,
        judgeRole: e.judgeRole,
        scores: e.scores,
        feedback: e.feedback,
        weight: e.weight
      })),
      aggregated
    });
  } catch (error) {
    console.error('Error fetching aggregated evaluations:', error);
    res.status(500).json({ message: 'Failed to fetch aggregated evaluations' });
  }
});

/**
 * Process judge evaluation asynchronously
 */
const processJudgeEvaluation = async (evaluationId) => {
  try {
    const evaluation = await JudgeEvaluation.findById(evaluationId);
    if (!evaluation) {
      console.error(`Judge evaluation ${evaluationId} not found`);
      return;
    }

    evaluation.status = 'processing';
    await evaluation.save();

    const interview = await Interview.findById(evaluation.interviewId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    // Get interview data
    const transcripts = interview.answers.map(a => a.transcript || a.answerText).join('\n\n');
    const allAnswers = interview.answers.map(a => ({
      question: interview.questions.find(q => q.id === a.questionId)?.text || '',
      answer: a.transcript || a.answerText,
      language: a.language,
      timeTaken: a.timeTaken
    }));

    // Call AI for evaluation (can be customized per judge role)
    const aiEvaluation = await evaluateAsJudge({
      transcripts,
      answers: allAnswers,
      judgeRole: evaluation.judgeRole,
      behaviorData: interview.behaviorData
    });

    // Store evaluation
    evaluation.scores = aiEvaluation.scores;
    evaluation.feedback = aiEvaluation.feedback;
    evaluation.status = 'completed';
    evaluation.completedAt = new Date();
    await evaluation.save();

    console.log(`Judge evaluation ${evaluationId} completed successfully`);
  } catch (error) {
    console.error(`Error processing judge evaluation ${evaluationId}:`, error);
    const evaluation = await JudgeEvaluation.findById(evaluationId);
    if (evaluation) {
      evaluation.status = 'failed';
      await evaluation.save();
    }
  }
};

/**
 * Evaluate interview from judge perspective
 */
const evaluateAsJudge = async (payload) => {
  const { transcripts, answers, judgeRole, behaviorData } = payload;

  // Customize evaluation based on judge role
  const roleFocus = {
    'hiring-manager': 'leadership, cultural fit, communication',
    'technical-lead': 'technical skills, problem-solving, domain expertise',
    'hr': 'communication, soft skills, cultural alignment',
    'peer': 'collaboration, teamwork, communication',
    'admin': 'overall assessment'
  };

  const focus = roleFocus[judgeRole] || 'overall assessment';

  // Use AI to evaluate (simplified - in production would call actual AI)
  const scores = {
    communication: Math.round(70 + Math.random() * 20),
    confidence: Math.round(65 + Math.random() * 25),
    technical: Math.round(70 + Math.random() * 20),
    overall: Math.round(70 + Math.random() * 20),
    culturalFit: Math.round(70 + Math.random() * 20),
    problemSolving: Math.round(70 + Math.random() * 20)
  };

  const feedback = {
    strengths: ['Clear communication', 'Good technical knowledge'],
    improvements: ['Could improve confidence', 'Reduce filler words'],
    summary: `Evaluation from ${judgeRole} perspective focusing on ${focus}.`,
    detailedFeedback: {
      communication: 'Overall communication was clear and understandable.',
      confidence: 'Confidence level was moderate.',
      technical: 'Demonstrated solid technical understanding.',
      culturalFit: 'Good alignment with company values.',
      problemSolving: 'Showed good problem-solving approach.'
    },
    recommendation: ['strong-hire', 'hire', 'maybe', 'no-hire'][Math.floor(Math.random() * 4)]
  };

  return { scores, feedback };
};

/**
 * Aggregate multiple judge evaluations with weights
 */
const aggregateEvaluations = (evaluations) => {
  if (evaluations.length === 0) {
    return null;
  }

  const totalWeight = evaluations.reduce((sum, e) => sum + (e.weight || 1.0), 0);
  
  const aggregatedScores = {
    communication: 0,
    confidence: 0,
    technical: 0,
    overall: 0,
    culturalFit: 0,
    problemSolving: 0
  };

  const allStrengths = new Set();
  const allImprovements = new Set();
  const recommendations = [];

  evaluations.forEach(evaluation => {
    const weight = (evaluation.weight || 1.0) / totalWeight;
    
    Object.keys(aggregatedScores).forEach(key => {
      if (evaluation.scores && evaluation.scores[key]) {
        aggregatedScores[key] += evaluation.scores[key] * weight;
      }
    });

    if (evaluation.feedback) {
      if (evaluation.feedback.strengths) {
        evaluation.feedback.strengths.forEach(s => allStrengths.add(s));
      }
      if (evaluation.feedback.improvements) {
        evaluation.feedback.improvements.forEach(i => allImprovements.add(i));
      }
      if (evaluation.feedback.recommendation) {
        recommendations.push(evaluation.feedback.recommendation);
      }
    }
  });

  // Round scores
  Object.keys(aggregatedScores).forEach(key => {
    aggregatedScores[key] = Math.round(aggregatedScores[key]);
  });

  // Determine final recommendation (majority vote)
  const recommendationCounts = {};
  recommendations.forEach(rec => {
    recommendationCounts[rec] = (recommendationCounts[rec] || 0) + 1;
  });
  const finalRecommendation = Object.keys(recommendationCounts).reduce((a, b) => 
    recommendationCounts[a] > recommendationCounts[b] ? a : b
  );

  return {
    scores: aggregatedScores,
    strengths: Array.from(allStrengths),
    improvements: Array.from(allImprovements),
    recommendation: finalRecommendation,
    judgeCount: evaluations.length,
    summary: `Aggregated evaluation from ${evaluations.length} judge(s)`
  };
};

export default router;

