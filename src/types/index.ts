export type UserRole = 'admin' | 'mentor' | 'branch_user' | 'italy_staff';
export type StudentStatus = 'active' | 'frozen' | 'graduated' | 'cancelled';
export type AssignmentRole = 'primary' | 'support';
export type ServiceStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'returned';
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
}

export interface MentorAssignment {
  id: string;
  mentorId: string;
  studentId: string;
  role: AssignmentRole;
  startDate: string;
  endDate?: string;
  notes?: string;
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
  adminFeedback?: string;
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

export interface University {
  id: string;
  name: string;
  country: string;
  isActive: boolean;
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
  ydtSupport?: 'Evet' | 'Hayır'; // YDT (Yaşam Destek Paketi)

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

  // Consultant Info
  consultantName?: string;
  consultantContact?: string;

  status: StudentStatus;
  registrationDate: string;
  createdAt: string;
}

export interface UserFavorite {
  userId: string;
  universityId: string;
}
