export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech: string[];
    link?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    dates: string;
    gpa?: string;
  }>;
  skills: Record<string, string[]>;
  certifications?: Array<{ name: string; issuer?: string; date?: string }>;
  links?: { github?: string; linkedin?: string; portfolio?: string };
}

export interface ATSDimension {
  name: string;
  score: number;
  weight: number;
  issues: string[];
  suggestions: string[];
}

export interface ATSScore {
  overall: number;
  passFail: "pass" | "fail";
  dimensions: ATSDimension[];
  summary: string;
}

export interface SkillGap {
  present: string[];
  missing: string[];
  partial: string[];
  jdMatchPercent: number;
  priorityOrder: string[];
  summary: string;
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AssessmentResult {
  skill: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  score: number;
  badge: boolean;
  questions: AssessmentQuestion[];
  userAnswers: number[];
}

export interface RecruiterSimulation {
  shortlistProbability: number;
  decision: "hire" | "no-hire" | "maybe";
  strengths: string[];
  redFlags: string[];
  changesToFlip: string[];
  summary: string;
}

export interface MicroLearningResource {
  title: string;
  url: string;
  type: "video" | "article" | "course" | "docs";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
}

export interface ImprovementPlan {
  resumeEdits: Array<{ priority: "high" | "medium" | "low"; change: string; reason: string }>;
  skillsToLearn: Array<{ skill: string; resources: MicroLearningResource[] }>;
  weeklyPlan: Array<{ week: number; tasks: string[] }>;
  summary: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "resume" | "situational";
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  suggestedPoints?: string[];
}

export interface InterviewAnswer {
  questionId: string;
  transcript: string;
  duration: number;
}

export interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

export interface InterviewFeedback {
  interviewId: string;
  userId: string;
  totalScore: number;
  categories: CategoryScore[];
  strengths: string[];
  areasToImprove: string[];
  finalAssessment: string;
  transcript: Array<{ role: "interviewer" | "candidate"; content: string }>;
  createdAt: string;
}

export interface ResumeAnalysisState {
  step: number;
  completed: boolean[];
  parsedResume?: ParsedResume;
  atsScore?: ATSScore;
  skillGap?: SkillGap;
  assessmentResults?: AssessmentResult[];
  recruiterSim?: RecruiterSimulation;
  improvementPlan?: ImprovementPlan;
  jobDescription?: string;
  targetRole?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  userId: string;
  role: string;
  type: "technical" | "behavioral" | "mixed";
  level: "junior" | "mid" | "senior";
  techStack: string[];
  questions: string[];
  coverImage: string;
  finalized: boolean;
  createdAt: string;
}

export interface SentimentScore {
  label: "positive" | "neutral" | "negative";
  confidence: number;
  tone: "confident" | "hesitant" | "nervous" | "assertive" | "uncertain";
}

export interface CommunicationAnalysis {
  clarity: number;           // 0-100
  confidence: number;        // 0-100
  structure: number;         // 0-100
  conciseness: number;       // 0-100
  issues: string[];          // e.g. ["Rambling detected", "One-word answer"]
  strengths: string[];
}

export interface BehavioralIndicators {
  ownershipScore: number;        // 0-100 — uses "I" vs "we/they"
  problemSolvingScore: number;   // 0-100
  adaptabilityScore: number;     // 0-100
  leadershipScore: number;       // 0-100
  honestyScore: number;          // 0-100
  willingnessToLearn: number;    // 0-100
  redFlags: string[];            // e.g. ["Blamed teammates", "Said I don't know without elaborating"]
  positiveSignals: string[];     // e.g. ["Took initiative", "Acknowledged failure with learning"]
}

export interface STARAnalysis {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  starScore: number;    // 0-100
  feedback: string;
}

export interface AnswerAnalysis {
  questionId: string;
  question: string;
  transcript: string;
  sentiment: SentimentScore;
  communication: CommunicationAnalysis;
  behavioral: BehavioralIndicators;
  star: STARAnalysis;
  overallAnswerScore: number;
  coachingTip: string;   // one actionable tip
}

export interface EnhancedInterviewFeedback extends InterviewFeedback {
  answerAnalyses: AnswerAnalysis[];
  overallSentiment: SentimentScore;
  overallCommunication: CommunicationAnalysis;
  overallBehavioral: BehavioralIndicators;
  mindsetScore: number;       // 0-100
  behavioralScore: number;    // 0-100
  starUsageRate: number;      // % of answers using STAR
  topRedFlags: string[];
  topStrengths: string[];
  coachingSummary: string;
}

