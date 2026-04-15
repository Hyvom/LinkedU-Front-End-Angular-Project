// ===========================
// AUTH MODELS
// ===========================
export interface LoginPayload {
  identifier: string;  // accepts email OR username
  password: string;
}

export interface GuestRegisterPayload {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;        // format: YYYY-MM-DD
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface ContractRegisterPayload {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;        // format: YYYY-MM-DD
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  confirmPassword: string;
  productKey: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  role: string;
  message: string;
}

export interface RegisterResponse {
  userId: number;
  message: string;
}

// ===========================
// USER / ROLES
// ===========================
export type UserRole = 'ADMIN' | 'USER' | 'GUEST' | 'STUDENT' | 'AGENT' | 'LANGUAGE_TEACHER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  enabled: boolean;
}
export interface AssignRolePayload {
  role: UserRole;
}

// ===========================
// AGENT MODELS
// ===========================
export interface AssignedStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: string;
  enabled: boolean;
}

export interface DocumentResponseDTO {
  id: number;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  status: string;
  uploadedAt: string;
  // CV
  summary?: string;
  experience?: string;
  skills?: string;
  // Passport
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  // ID Card
  numId?: string;
  birthday?: string;
  // Diploma
  degree?: string;
  institution?: string;
  graduationYear?: string;
  fieldOfStudy?: string;
  // Transcript
  academicYear?: string;
  average?: string;
  // Cover Letter
  targetUniversity?: string;
  targetProgram?: string;
  content?: string;
  // Other
  documentTitle?: string;
  notes?: string;
}

// ===========================
// STUDENT PROFILE MODELS
// ===========================
export type StudyLevel = 'BACHELOR' | 'MASTER' | 'PHD';
export type CollegeType = 'PUBLIC' | 'PRIVATE';

export interface Language {
  name: string;
  level: string;  // A1, A2, B1, B2, C1, C2
  rank: number;
}

export interface StudentProfileDTO {
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  currentStudyLevel?: StudyLevel;
  wishedStudyLevel?: StudyLevel;
  speciality?: string;
  universityYear?: number;
  languages?: string;       // JSON string
  budget?: number;
  collegeType?: CollegeType;
  onlineStatus?: OnlineStatus;
  availabilityTime?: string;
  address?: string;
  phoneNumber?: string;
}

export interface StudentProfileResponse {
  id: number;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  currentStudyLevel?: StudyLevel;
  wishedStudyLevel?: StudyLevel;
  speciality?: string;
  universityYear?: number;
  languages?: string;
  budget?: number;
  collegeType?: CollegeType;
  onlineStatus?: OnlineStatus;
  availabilityTime?: string;
  address?: string;
  phoneNumber?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string;
    address: string;
    role: string;
  };
}
// ===========================
// PROFILE MODELS BASED ON ROLES
// ===========================
export type OnlineStatus = 'ONLINE' | 'AWAY' | 'OFFLINE';

// ── Guest ──────────────────────────────────────────────
export interface GuestProfileDTO {
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  onlineStatus?: OnlineStatus;
  availabilityTime?: string;
  address?: string;
  phoneNumber?: string;
}

export interface GuestProfileResponse {
  id: number;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  onlineStatus?: OnlineStatus;
  availabilityTime?: string;
  address?: string;
  phoneNumber?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string;
    address: string;
    role: string;
  };
}

// ── Agent ──────────────────────────────────────────────
export interface AgentProfileDTO {
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  address?: string;
  phoneNumber?: string;
  contactName?: string;
  email?: string;
  availabilityTime?: string;
  onlineStatus?: OnlineStatus;
}

export interface AgentProfileResponse {
  id: number;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  address?: string;
  phoneNumber?: string;
  contactName?: string;
  email?: string;
  availabilityTime?: string;
  onlineStatus?: OnlineStatus;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string;
    address: string;
    role: string;
  };
}

// ===========================
// PRODUCT KEYS
// ===========================
export interface ProductKey {
  id: number;
  keyValue: string;
  used: boolean;
  createdAt?: string;
}

// ===========================
// DESTINATION MODELS
// ===========================
export interface Destination {
  id?: number;
  countryName: string;
  description: string;
  paragraph: string;
  offers: string;
  universities: string;
}

// ===========================
// QUIZ MODELS
// ===========================
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  language?: string;
  createdAt?: string;
  startTime?: string;
  endTime?: string;
  start_time?: string;
  end_time?: string;
}

export interface CreateQuizPayload {
  title: string;
  description: string;
  language: string;
  startTime?: string;
  endTime?: string;
}

export interface QuestionFormPayload {
  quizId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export interface QuizOption {
  id: number;
  optionText: string;
  isCorrect?: boolean;
  orderIndex: number;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
}

export interface QuizAnswerSubmission {
  questionId: number;
  selectedOption: string;
}

export interface QuizSubmitResponse {
  quizAttemptId: number;
  score: number;
  passed: boolean;
  message: string;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  quizTitle: string;
  score: number;
  timeTaken: number;
  completedAt: string;
}

export interface SubmitAnswerPayload {
  questionId: number;
  selectedOptionId?: number;
  userAnswer?: string;
}

// ===========================
// CHAT MODELS
// ===========================
export type RoomType = 'PRIVATE' | 'GROUP';
export type MessageType = 'TEXT' | 'IMAGE';
export type ParticipantRole = 'ADMIN' | 'MEMBER';

export interface ChatRoom {
  id: number;
  name: string;
  type: RoomType;
  createdAt: string;
}

export interface ChatParticipant {
  id: number;
  userId: number;
  userName: string;
  role: ParticipantRole;
  joinedAt: string;
}

export interface ChatNotification {
  id: number;
  roomId: number;
  roomName: string;
  messageId: number;
  isRead: boolean;
}

// ===========================
// DOCUMENT MODELS
// ===========================
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'CV' | 'PASSPORT' | 'ID_CARD' | 'DIPLOMA' | 'TRANSCRIPT' | 'COVER_LETTER' | 'OTHER';

export interface StudentDocument {
  id: number;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  status: string;
  uploadedAt: string;
  // CV
  summary?: string;
  experience?: string;
  skills?: string;
  // Passport
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  // ID Card
  numId?: string;
  birthday?: string;
  // Diploma
  degree?: string;
  institution?: string;
  graduationYear?: string;
  fieldOfStudy?: string;
  // Transcript
  academicYear?: string;
  average?: string;
  // Cover Letter
  targetUniversity?: string;
  targetProgram?: string;
  content?: string;
  // Other
  documentTitle?: string;
  notes?: string;
}

// ===========================
// CV ANALYSIS
// ===========================
export interface CvAnalysis {
  score: number;
  overallFeedback: string;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  formattingFeedback: string;
  keywordsFound: string;
  missingKeywords: string;
}

// ===========================
// PROGRESS MODELS
// ===========================
export type ProgressStage = 
  | 'ORIENTATION'
  | 'DOSSIER_PREPARATION'
  | 'DOCUMENT_COLLECTION'
  | 'LANGUAGE_TESTS'
  | 'UNIVERSITY_SELECTION'
  | 'APPLICATION_SUBMISSION'
  | 'INTERVIEW_PREPARATION'
  | 'ACCEPTANCE_LETTER'
  | 'VISA_APPLICATION'
  | 'ACCOMMODATION'
  | 'TRAVEL_PLANNING'
  | 'PRE_DEPARTURE'
  | 'ARRIVAL_SETTLEMENT';

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Progress {
  id: number;
  stage: ProgressStage;
  status: ProgressStatus;
  updatedAt: string;
}

// ===========================
// CHAT MODELS
// ===========================
export interface ChatMessage {
  id: number;
  senderId?: number;
  receiverId?: number;
  sender?: { id: number; firstName: string; lastName: string; username: string };
  receiver?: { id: number; firstName: string; lastName: string; username: string };
  message: string;
  timestamp: string;
  seen: boolean;
}

export interface UnreadCount {
  count: number;
}

// ===========================
// TICKET MODELS
// ===========================
export type TicketStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Ticket {
  id: number;
  object: string;
  description: string;
  availabilityDateTime: string;
  status: TicketStatus;
  googleMeetLink?: string;
  rejectionReason?: string;
  student?: { id: number; firstName: string; lastName: string; email: string; };
  agent?: { id: number; firstName: string; lastName: string; email: string; };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDTO {
  object: string;
  description: string;
  availabilityDateTime: string;
}

export interface AcceptTicketDTO {
  googleMeetLink: string;
}

export interface RejectTicketDTO {
  reason: string;
}