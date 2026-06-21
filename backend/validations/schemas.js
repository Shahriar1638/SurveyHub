const { z } = require('zod');

// ── Auth ─────────────────────────────────────────────────────────────────────
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
  preferences: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const avatarUploadSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
});

// ── Profile ──────────────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
  preferences: z.array(z.string()).optional(),
  autoAIInsight: z.boolean().optional(),
});

// ── Survey ───────────────────────────────────────────────────────────────────
const questionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
  label: z.string().min(1, 'Question text is required').max(1000),
  type: z.enum(['short_answer', 'paragraph', 'multiple_choice', 'checkbox', 'linear_scale']),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  useCase: z.string().max(500).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  resultAccess: z.enum(['only_me', 'participants', 'everyone']).optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  image: z.string().url().optional().or(z.literal('')),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
  status: z.enum(['draft', 'published']).optional(),
});

const updateSurveySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  useCase: z.string().max(500).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  resultAccess: z.enum(['only_me', 'participants', 'everyone']).optional(),
  deadline: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  questions: z.array(questionSchema).optional(),
  status: z.enum(['draft', 'published', 'pending_review', 'rejected']).optional(),
});

const surveyResponseSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  answers: z.array(z.object({
    questionId: z.string(),
    label: z.string().optional(),
    value: z.union([z.string(), z.number(), z.array(z.string()), z.record(z.string(), z.number())]),
  })),
  isDraft: z.boolean().optional(),
});

const surveyFeedbackSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(1, 'Comment is required').max(2000),
  suggestions: z.string().max(2000).optional().or(z.literal('')),
});

const surveyReportSchema = z.object({
  reportReason: z.enum(['Spam', 'Hate Speech', 'Inappropriate Content', 'Other']),
  details: z.string().max(2000).optional().or(z.literal('')),
});

// ── Blog ─────────────────────────────────────────────────────────────────────
const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(50000),
  surveyId: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'active']).optional(),
});

const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  surveyId: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'active', 'pending_review', 'rejected']).optional(),
});

const blogReactionSchema = z.object({
  userEmail: z.string().email('Valid email is required'),
  reactionType: z.enum(['like', 'insightful', 'disagree', 'interesting', 'funny']),
});

const blogCommentSchema = z.object({
  userEmail: z.string().email('Valid email is required'),
  text: z.string().min(1, 'Comment text is required').max(5000),
});

// ── Site Feedback ────────────────────────────────────────────────────────────
const submitFeedbackSchema = z.object({
  userEmail: z.string().email().optional().or(z.literal('')),
  feedbackType: z.string().min(1, 'Feedback type is required'),
  affectedPage: z.string().max(200).optional().or(z.literal('')),
  comment: z.string().min(1, 'Comment is required').max(5000),
  attachments: z.array(z.string().url()).optional(),
});

const updateFeedbackSchema = z.object({
  status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']).optional(),
  adminResponse: z.object({
    message: z.string().min(1),
    respondedBy: z.string().optional(),
  }).optional(),
});

const feedbackImageUploadSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
});

module.exports = {
  signUpSchema,
  loginSchema,
  avatarUploadSchema,
  updateProfileSchema,
  createSurveySchema,
  updateSurveySchema,
  surveyResponseSchema,
  surveyFeedbackSchema,
  surveyReportSchema,
  createBlogSchema,
  updateBlogSchema,
  blogReactionSchema,
  blogCommentSchema,
  submitFeedbackSchema,
  updateFeedbackSchema,
  feedbackImageUploadSchema,
};
