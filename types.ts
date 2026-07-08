
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum StudentType {
  CAO_HOC = 'CAO_HOC',
  NCS = 'NCS'
}

export interface EducationHistory {
  id: string;
  timeRange: string;
  schoolName: string;
  major: string;
  learningType: string; // Hình thức đào tạo
  degree: string; // Văn bằng/Chứng chỉ
}

export interface WorkHistory {
  id: string;
  timeRange: string;
  organization: string;
  position: string;
}

export interface FamilyMember {
  fullName: string;
  birthDate: string;
  phone: string;
  job: string;
  address: string;
  educationLevel: string; // Trình độ học vấn
}

export interface Address {
  details: string; // Địa chỉ chi tiết
  houseNumber: string;
  street: string;
  hamlet: string; // Tổ/Thôn/Xóm
  ward: string;
  district: string;
  city: string;
}

export interface DegreeInfo {
  school: string;
  system: string; // Hệ đào tạo
  degreeNumber: string; // Số hiệu bằng
  bookNumber: string; // Số vào sổ
  signDate: string; // Ngày ký
  gradYear: string; // Năm tốt nghiệp
  major: string; // Ngành
  specialization: string; // Chuyên ngành
  signer: string; // Người ký
  isTransfer?: boolean; // Liên thông
}

export interface StudentProfile {
  id: string; // Mã HV
  cccd: string;
  cccdIssuedDate: string;
  cccdIssuedPlace: string;
  cmnd: string;
  cmndIssuedDate: string;
  cmndIssuedPlace: string;
  fullName: string;
  email: string;
  phone: string;
  major: string;
  className: string;
  studentType: StudentType;
  photoUrl?: string;
  
  birthDate: string;
  gender: string;
  birthPlace: string; // Nơi sinh (Tỉnh/TP)
  nationality: string;
  ethnic: string;
  religion: string;
  disability: boolean;
  disabilityType: string;
  hometown: string; // Quê quán
  socialInsuranceId: string; // Số sổ BHXH
  unionJoinDate: string; // Ngày vào Đoàn
  partyJoinDate: string; // Ngày vào Đảng
  officialPartyJoinDate: string; // Ngày vào Đảng chính thức
  workPlace: string; // Cơ quan công tác
  emergencyContactName: string;
  emergencyContactPhone: string;

  permanentAddress: Address;
  currentAddress: Address;

  uniDegree: DegreeInfo;
  masterDegree?: DegreeInfo; // Chỉ dành cho NCS

  educationHistory: EducationHistory[]; // Quá trình đào tạo
  workHistory: WorkHistory[]; // Quá trình công tác
  scientificWorks: string[]; // Công trình khoa học

  rewards: string; // Khen thưởng
  discipline: string; // Kỷ luật
  
  father: FamilyMember;
  mother: FamilyMember;
  spouse: FamilyMember;
  
  isCommitted: boolean;

  attachments: {
    degreeUniFile?: string;
    degreeMasterFile?: string;
    birthCertFile?: string;
    cccdFrontFile?: string;
    cccdBackFile?: string;
    othersFile?: string;
    [key: string]: string | undefined;
  };
  
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  section: string;
  isVisible: boolean;
  isRequired: boolean;
  appliesTo: 'BOTH' | 'CAO_HOC' | 'NCS';
}

export interface LocationData {
  name: string;
  districts: {
    name: string;
    wards: string[];
  }[];
}

export interface LocationDataTwoLevel {
  name: string;
  wards: string[];
}

export interface ExportSettings {
  marginTop: number; // mm
  marginBottom: number; // mm
  marginLeft: number; // mm
  marginRight: number; // mm
  fontFamily: string;
  baseFontSize: number; // pt (Word)
}

export interface SystemConfig {
  isOpen: boolean;
  openDate: string;
  closeDate: string;
  addressMode: '3_LEVELS' | '2_LEVELS' | 'BOTH'; // Configurable by admin
  requiredFields: string[]; 
  fieldConfigs: FieldConfig[]; 
  printSettings: {
    schoolHeader: string;
    subHeader: string;
    footerNote: string;
  };
  exportSettings: ExportSettings; // New field for customization
}
