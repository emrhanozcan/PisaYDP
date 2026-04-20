export type UserRole = 'admin' | 'mentor' | 'branch_user' | 'italy_staff' | 'technical_support';
export type StudentStatus = 'active' | 'frozen' | 'graduated' | 'cancelled';
export type AssignmentRole = 'primary' | 'support';
export type ServiceStatus = 'assigned' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'returned';
export type PaymentStatus = 'pending' | 'paid';

// Branch codes for Turkey offices
export type BranchCode = 'sariyer' | 'fethiye' | 'kadikoy' | 'ankara' | 'bursa' | 'izmir';

export const BRANCH_NAMES: Record<BranchCode, string> = {
  sariyer: 'Sarıyer',
  fethiye: 'Fethiye',
  kadikoy: 'Kadıköy',
  ankara: 'Ankara',
  bursa: 'Bursa',
  izmir: 'İzmir'
};

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  branchCode?: BranchCode;
  photoUrl?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  city?: string;
  school?: string;
  program?: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  address?: string;
  notes?: string;
  status: StudentStatus;
  packageType?: string;
  startDate: string;
  createdAt: string;
  educations?: StudentEducation[];
  photoUrl?: string;
}

export interface MentorAssignment {
  id: string;
  mentorId: string;
  studentId: string;
  role: AssignmentRole;
  startDate: string;
  endDate?: string;
  notes?: string;
  allowedServiceIds?: string[];
}

export type TransactionType = 'expense' | 'advance' | 'payment' | 'parent_payment';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface MentorTransaction {
  id: string;
  mentorId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  receiptUrl?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceType {
  id: string;
  name: string;
  category: string;
  pricingModel: 'fixed' | 'hourly';
  unitPrice: number;
  isActive: boolean;
}

export interface ServiceLog {
  id: string;
  studentId: string;
  mentorId: string;
  serviceTypeId: string;
  date: string;
  durationMinutes: number;
  notes?: string;
  attachments?: string[];
  status: ServiceStatus;
  paymentStatus?: PaymentStatus;
  unitPrice?: number;
  adminFeedback?: string;
  lastEditorRole?: 'mentor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'status_change';
  actorId: string;
  changes?: Record<string, any>;
  timestamp: string;
}

// =====================
// Branch User Types
// =====================

export type LeadStatus = 'new_lead' | 'lead' | 'contacted' | 'no_answer' | 'busy' | 'meeting_scheduled' | 'proposal_sent' | 'accepted' | 'rejected' | 'enrolled';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new_lead: 'Yeni Lead',
  lead: 'Lead (Eski)',
  contacted: 'İletişime Geçildi',
  no_answer: 'Cevap Yok',
  busy: 'Meşgul',
  meeting_scheduled: 'Randevu',
  proposal_sent: 'Teklif Gönderildi',
  accepted: 'Kabul',
  rejected: 'Red',
  enrolled: 'Kayıt'
};

export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  emails: string[];
  phone?: string;
  nationality?: string;

  hasItalyResidencePermit?: boolean;
  hasOtherCitizenship?: boolean;
  otherCitizenshipCountry?: string;

  contactRole: 'student' | 'guardian';
  studentInfo?: any; // JSONB
  guardianInfo?: any; // JSONB

  educationLevel?: string;
  englishLevel?: string;
  italianLevel?: string;
  workExperience?: string;
  // medicalTrack removed
  interestedPrograms: string[];
  interestedUniversities: string[];
  interestedCountries: string[];
  interestedServices: string[];

  serviceYear?: string;
  academicYear?: string;
  registrationYear?: string;

  meetingDate?: string;
  meetingTime?: string;
  meetingConsultant?: string;
  meetingType?: string;
  meetingSummary?: string;

  discussedPrice?: number;
  additionalPayment?: number;
  hasDiscount?: boolean;
  discountInfo?: string;
  priceNotes?: string;

  source?: string;
  referenceSource?: string;
  status: LeadStatus;
  priority?: 'low' | 'medium' | 'high';
  trackingStatus?: string;

  isSeriousCandidate?: boolean;
  visaInfoProvided?: boolean;
  contractSent?: boolean;
  formCompleted?: boolean;
  emailSent?: boolean;
  isRegistered?: boolean;

  followUpRequired?: boolean;
  followUpInfo?: any; // JSONB

  createdBy?: string;
  branchId?: string;
  assignedConsultants?: string[];
  notes?: string;

  createdAt: string;
  updatedAt: string;

  // Virtual fields (joins)
  consultant?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export interface University {
  id: string;
  name: string;
  country: string;
  isActive: boolean;
  registrationDeadline?: string;
}

export interface StudentEducation {
  id?: string;
  studentId?: string;
  universityId: string;
  department?: string;
  program?: string;
  grade?: string;
}

export interface BranchStudent {
  id: string;
  branchCode: BranchCode;
  firstName: string;
  lastName: string;
  full_name?: string; // Derived or extra
  idNumber?: string;
  serialNumber?: string; // Seri Numarası
  passportNo?: string;
  passportExpiry?: string;
  notes?: string;
  description?: string; // Açıklama
  infoDate?: string;
  infoStatus?: 'Evet' | 'Hayır';
  applicationDeadline?: string;
  applicationFee?: string;
  dsuFee?: string;
  visaFee?: string;
  offerLetter?: 'Tamamlandı' | 'Bekleniyor';
  email?: string;
  phone?: string;
  parentName?: string; // Veli Ad Soyad
  parentPhone?: string; // Veli Telefon
  parentEmail?: string; // Veli Email
  fee?: string; // Tutar Ücret
  city?: string;
  department?: string;
  iban?: string;
  universityId?: string;
  program?: string;
  grade?: string; // Sınıf (1,2,3,4,5,6)
  enrollmentYear?: string; // Keep for backward compatibility or map to Class

  // Second University (Deprecated by Unlimited, but keep for fallback)
  university2Id?: string;
  department2?: string;
  program2?: string;
  grade2?: string;

  // Unlimited Educations
  educations?: StudentEducation[];

  examResult?: string; // Sıralama
  selectionResult?: string; // Kira Kontratı (mapped from previous usage, or separate)
  contractStatus?: string; // Kira Kontratı specific field if needed, otherwise selectionResult
  visaResult?: string; // Bloke
  finalStatus?: 'Kabul' | 'Red' | 'Beklemede' | 'SOSPESO';
  paymentStatus?: 'Tamamlandı' | 'Kısmi Ödeme' | 'Bekleniyor';
  packageType?: string;
  accommodationService?: 'Evet' | 'Hayır';
  supportPackage?: 'Evet' | 'Hayır'; // Danışmanlık
  scholarshipPackage?: 'Evet' | 'Hayır'; // Burs Paketi
  scholarshipTypes?: string[]; // Burs Tipleri
  scholarshipStatus?: string; // Burs Durumu (Tamamlandı, Bekliyor, Tamamlanmadı)
  ydtSupport?: 'Evet' | 'Hayır'; // YDT (Yaşam Destek Paketi)
  ydtStatus?: string; // YDT Durumu (Tamamlandı, Bekliyor, Tamamlanmadı)

  // Accommodation Details
  accommodationCity?: string;
  accommodationType?: string; // Ev, Oda, Yurt, Stüdyo Daire
  accommodationAddress?: string;
  accommodationMonthlyRent?: string;
  accommodationDiffPayment?: string; // Konaklama fark ödemesi
  accommodationPaymentStatus?: string; // Ödeme
  accommodationDate?: string; // Tarih
  accommodationStatus?: string; // başvurunuz alınmıştır, işleminiz devam etmektedir, konaklamanız ayarlanmıştır

  // Guardian Service Details
  guardianOperator?: string; // İşlemi yapan kişi
  guardianArrivalDate?: string; // Geliş Tarihi
  guardianCity?: string; // Şehir
  guardianLocation?: string; // Yeri
  guardianTime?: string; // Saati
  guardianStatus?: string; // Durumu

  // Arrival Details
  arrivalCity?: string;
  arrivalPaymentStatus?: string;
  arrivalOperator?: string;
  arrivalDate?: string;
  arrivalAirport?: string;
  arrivalTime?: string; // Uçuş Saati
  flightCode?: string;
  arrivalAccommodation?: string;
  arrivalStatus?: string;

  // Life Support Service (YDT) - Date & Status pairs
  ydtWelcomeDate?: string;
  ydtWelcomeStatus?: string;
  ydtSchoolRegDate?: string;
  ydtSchoolRegStatus?: string;
  ydtResPermitDate?: string;
  ydtResPermitStatus?: string;
  ydtSimDate?: string;
  ydtSimStatus?: string; // Ulaşım kartı / SİM
  ydtBankDate?: string;
  ydtBankStatus?: string;

  // Residence Permit Details (Permesso di Soggiorno)
  residencePermitHandler?: string;
  residencePermitArrivalDate?: string;
  residencePermitAppointmentDate?: string;
  residencePermitPlace?: string;
  residencePermitTime?: string;
  residencePermitStatus?: string;

  // Codice Fiscale Details
  codiceFiscaleHandler?: string;
  codiceFiscaleArrivalDate?: string;
  codiceFiscaleAppointmentDate?: string;
  codiceFiscalePlace?: string;
  codiceFiscaleTime?: string;
  codiceFiscaleStatus?: string;

  // Consultant Info
  consultantName?: string;
  consultantContact?: string;

  guardianService?: 'Evet' | 'Hayır'; // Vasi Hizmeti seçeneği

  status: StudentStatus;
  registrationDate: string;
  createdAt: string;
  photoUrl?: string;
}


export interface UserFavorite {
  userId: string;
  universityId: string;
}

// =====================
// Technical Support Types
// =====================

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'bug' | 'feature' | 'question' | 'access' | 'other';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Açık',
  in_progress: 'İşlemde',
  resolved: 'Çözüldü',
  closed: 'Kapatıldı'
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil'
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  bug: 'Hata Bildirimi',
  feature: 'Özellik İsteği',
  question: 'Soru',
  access: 'Erişim Sorunu',
  other: 'Diğer'
};

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  ip?: string;
}

export interface TicketAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: string;
  uploadedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;        // TKT-2025-00001 formatı
  userId: string;              // Talebi oluşturan kullanıcı
  userName: string;            // Kullanıcı adı (cache)
  userRole: UserRole;          // Kullanıcı rolü
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  attachments?: TicketAttachment[]; // Replaces screenshots
  screenshots?: string[];      // Deprecated, kept for backward compatibility
  deviceInfo?: DeviceInfo;
  status: TicketStatus;
  assignedTo?: string;         // Teknik destek user ID
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  isInternal: boolean;         // Sadece teknik ekip görür
  deviceInfo?: DeviceInfo;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;              // Bildirim alacak kullanıcı
  type: 'ticket_response' | 'ticket_status' | 'system';
  title: string;
  message: string;
  relatedTicketId?: string;
  isRead: boolean;
  createdAt: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Yönetici',
  mentor: 'Mentor',
  branch_user: 'Şube Kullanıcısı',
  italy_staff: 'İtalya Görevlisi',
  technical_support: 'Teknik Destek'
};

export const PANEL_ACCESS_OPTIONS = [
  { value: 'admin', label: 'Admin Paneli' },
  { value: 'italy', label: 'İtalya Paneli' },
  { value: 'branch', label: 'Şube Paneli' },
  { value: 'mentor', label: 'Mentor Paneli' },
  { value: 'technical', label: 'Teknik Destek Paneli' }
] as const;

export interface ServiceNote {
  id: string;
  studentId: string;
  serviceType: string;
  note: string;
  updatedAt: string;
}


export interface ServiceUpload {
  id: string;
  studentId: string;
  serviceType: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: string;
}

export interface ScholarshipTracking {
  id: string;
  studentId: string;

  // Bilgilendirme
  infoDocumentList?: 'İletildi' | 'Bekleniyor';

  // Başvuru Bilgileri (Badge/Status fields added)
  applicationTuitionFee?: string;
  applicationTuitionFeeStatus?: 'Tamamlandı' | 'İşleme Alındı' | 'Beklemede';

  applicationIseeStatus?: string;
  applicationIseeStatusStatus?: 'Tamamlandı' | 'İşleme Alındı' | 'Beklemede';

  applicationDormStatus?: string;
  applicationDormStatusStatus?: 'Tamamlandı' | 'İşleme Alındı' | 'Beklemede';

  applicationScholarshipStatus?: string;
  applicationScholarshipStatusStatus?: 'Tamamlandı' | 'İşleme Alındı' | 'Beklemede';

  // Evraklar (New structure with statuses)
  documentsSurvey?: string;
  documentsSurveyStatus?: 'İletildi' | 'Tercümede' | 'Beklemede';

  documentsTurkish?: string;
  documentsTurkishStatus?: 'İletildi' | 'Tercümede' | 'Beklemede';

  documentsItalian?: string;
  documentsItalianStatus?: 'İletildi' | 'Tercümede' | 'Beklemede';

  // Giriş Bilgileri
  credentialsSchoolUsername?: string;
  credentialsSchoolPassword?: string;
  credentialsIseeUsername?: string;
  credentialsIseePassword?: string;

  // Sonuçlar & CAF
  resultRanking?: string;
  resultStatus?: 'Kazandı' | 'Yedek' | 'Kazanamadı';
  resultBlockAccount?: string;
  resultItalyLease?: string;
  resultIban?: string;
  resultNotes?: string;

  cafAppointmentDate?: string;
  cafAppointmentStatus?: string; // Text field for status description if needed, or could be enum if strict

  // Önemli Tarihler
  dateApplication?: string;
  dateIsee?: string;
  dateLeaseUpload?: string;

  createdAt?: string;
  updatedAt?: string;
}
