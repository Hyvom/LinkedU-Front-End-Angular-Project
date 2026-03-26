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
export type UserRole = 'ADMIN' | 'USER' | 'GUEST' | 'STUDENT' | 'AGENT';

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
  languages?: string;  // JSON string
  budget?: number;
  collegeType?: CollegeType;
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
  description: string;
  timeLimit: number;
  totalQuestions: number;
  isActive: boolean;
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
  questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  orderIndex: number;
  options: QuizOption[];
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

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: MessageType;
  sentAt: string;
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
export type DocumentType = 'CV' | 'PASSPORT' | 'ID_CARD';

export interface StudentDocument {
  id: number;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  status: DocumentStatus;
  uploadedAt: string;
  // CV fields
  summary?: string;
  experience?: string;
  skills?: string;
  // Passport fields
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  // ID Card fields
  numId?: string;
  birthday?: string;
}

// ===========================
// PROGRESS MODELS
// ===========================
export type ProgressStage =
  'ORIENTATION' |
  'DOSSIER_PREPARATION' |
  'INTERVIEW' |
  'DOCUMENT_VERIFICATION' |
  'ADMISSION_CONFIRMATION';

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Progress {
  id: number;
  stage: ProgressStage;
  status: ProgressStatus;
  updatedAt: string;
}