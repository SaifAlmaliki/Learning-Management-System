// ======================== Global Type Declarations ========================
// These interfaces define the shape of objects used across the application.
// By declaring them globally, they can be used anywhere without repeated imports.

// ======================== Payment and User Settings ========================
/** Represents a user's payment method details */
interface PaymentMethod {
  methodId: string; // Unique identifier for the payment method
  type: string;     // Payment method type (e.g., credit card)
  lastFour: string; // Last four digits of the card
  expiry: string;   // Expiration date of the payment method
}

/** User settings for notifications and preferences */
export interface UserSettings {
  theme?: "light" | "dark"; // User-selected theme
  emailAlerts?: boolean; // Enable/disable email alerts
  smsAlerts?: boolean; // Enable/disable SMS alerts
  courseNotifications?: boolean; // Enable/disable course notifications
  notificationFrequency?: "immediate" | "daily" | "weekly"; // Notification frequency
}

// ======================== User Interface ========================
/** Represents a user in the system */
export interface User {
  userId: string; // Unique user ID
  firstName?: string; // User's first name
  lastName?: string; // User's last name
  username?: string; // Username for display
  email: string; // User's email
  publicMetadata: {
    userType: "teacher" | "student"; // User role: teacher or student
  };
  privateMetadata: {
    settings?: UserSettings; // User-specific settings
    paymentMethods?: Array<PaymentMethod>; // List of user's payment methods
    defaultPaymentMethodId?: string; // ID of the default payment method
    stripeCustomerId?: string; // Stripe customer ID for payments
  };
  unsafeMetadata: {
    bio?: string; // User biography
    urls?: string[]; // List of URLs (e.g., social links)
  };
}

// ======================== Course Interface ========================
/** Represents a course with its details and structure */
export interface Course {
  courseId: string; // Unique course ID
  teacherId: string; // Teacher's user ID
  teacherName: string; // Name of the teacher
  title: string; // Course title
  description?: string; // Course description
  category: string; // Course category
  image?: string; // URL for the course image
  price?: number; // Course price (in cents)
  level: "Beginner" | "Intermediate" | "Advanced"; // Course difficulty level
  status: "Draft" | "Published"; // Course status
  sections: Section[]; // List of sections in the course
  enrollments?: Array<{ userId: string }>; // Users enrolled in the course
}

// ======================== Transaction Interface ========================
/** Represents a financial transaction for a course */
export interface Transaction {
  userId: string; // User ID associated with the transaction
  transactionId: string; // Unique transaction ID
  dateTime: string; // Date and time of the transaction
  courseId: string; // ID of the course purchased
  paymentProvider: "stripe"; // Payment provider (only Stripe supported)
  paymentMethodId?: string; // Payment method ID
  amount: number; // Transaction amount (in cents)
  savePaymentMethod?: boolean; // Option to save the payment method
}

// ======================== Course Progress and Sections ========================
/** Represents progress of a user within a course */
export interface UserCourseProgress {
  userId: string;             // User ID
  courseId: string;           // Course ID
  enrollmentDate: string;     // Date of enrollment
  overallProgress: number;    // Overall progress percentage
  sections: SectionProgress[]; // Progress for individual sections
  lastAccessedTimestamp: string; // Last time the course was accessed
}

/** Progress for individual sections */
export interface SectionProgress {
  sectionId: string; // Section ID
  chapters: ChapterProgress[]; // Progress for chapters in the section
}

/** Progress for individual chapters */
export interface ChapterProgress {
  chapterId: string; // Chapter ID
  completed: boolean; // Completion status
}

// ======================== Sections and Chapters ========================
/** Represents a chapter within a section */
export interface Chapter {
  chapterId: string; // Chapter ID
  title: string; // Chapter title
  content: string; // Chapter content
  video?: string | File; // Video file or URL
  freePreview?: boolean; // Whether chapter is a free preview
  type: "Text" | "Quiz" | "Video"; // Chapter type
}

/** Represents a section containing chapters */
export interface Section {
  sectionId: string; // Section ID
  sectionTitle: string; // Section title
  sectionDescription?: string; // Section description
  chapters: Chapter[]; // List of chapters in the section
}

// ======================== Component Props Interfaces ========================
/** Props for course-related UI components */
export interface CourseCardProps {
  course: Course;
  onGoToCourse: (course: Course) => void;
}

export interface TeacherCourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  isOwner: boolean;
}

export interface SearchCourseCardProps {
  course: Course;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface CoursePreviewProps {
  course: Course;
}

export interface SelectedCourseProps {
  course: Course;
  handleEnrollNow: (courseId: string) => void;
}

/** Props for modal components */
export interface CustomFixedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionIndex: number | null;
  chapterIndex: number | null;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  courseId: string;
}

export interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionIndex: number | null;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

/** Props for other UI components */
export interface WizardStepperProps {
  currentStep: number;
}

export interface AccordionSectionsProps {
  sections: Section[];
}

export interface ToolbarProps {
  onSearch: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export interface HeaderProps {
  title: string;
  subtitle: string;
  rightElement?: ReactNode;
}

export interface SharedNotificationSettingsProps {
  title?: string;
  subtitle?: string;
}

/** Props for drag-and-drop section components */
interface DroppableComponentProps {
  sections: Section[];
  setSections: (sections: Section[]) => void;
  handleEditSection: (index: number) => void;
  handleDeleteSection: (index: number) => void;
  handleAddChapter: (sectionIndex: number) => void;
  handleEditChapter: (sectionIndex: number, chapterIndex: number) => void;
  handleDeleteChapter: (sectionIndex: number, chapterIndex: number) => void;
}

// ======================== Helper Types ========================
type CreateUserArgs = Omit<User, "userId">;
type CreateCourseArgs = Omit<Course, "courseId">;
type CreateTransactionArgs = Omit<Transaction, "transactionId">;

/** Represents a date range with optional start and end dates */
interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

/** Represents form data for creating or editing a course */
interface CourseFormData {
  courseTitle: string;
  courseDescription: string;
  courseCategory: string;
  coursePrice: string;
  courseStatus: boolean;
}

export { type SearchCourseCardProps }; // Ensures the file is treated as a module
 // Ensures the file is treated as a module
