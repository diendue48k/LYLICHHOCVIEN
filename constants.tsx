
import { StudentType, SystemConfig, LocationData, LocationDataTwoLevel } from './types';

// *** CẤU HÌNH API GOOGLE SHEETS ***
// 1. Deploy code trong file Hướng dẫn vào Apps Script.
// 2. Chọn "Deploy" > "Web App" > "Who has access: Anyone".
// 3. Copy URL "Web App URL" dán vào biến bên dưới.
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzG_K3Vk4tUw13JgHeGBdGqXCNR7WhAaycLgbEi3yYXGGWBuKTQW5dsKGDN8sDJhWZzAQ/exec'; 

// Link đến file Google Sheet (Dùng để Admin mở nhanh từ Dashboard)
export const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ydcPdLAw3eCN96Ezg367t-mUBTXTy5AedxGtqgZAELM/edit?usp=sharing';

// *** DANH SÁCH CỘT TRÊN GOOGLE SHEET (SHEET: STUDENTS) ***
// Bạn hãy copy dòng này làm tiêu đề (Dòng 1) cho Sheet có tên "STUDENTS" để hệ thống mapping đúng dữ liệu.
// QUAN TRỌNG: Tên Sheet (Tab) trong file Google Sheet BẮT BUỘC phải là "STUDENTS"
export const SHEET_HEADERS = [
  'id', 'cccd', 'fullName', 'email', 'phone', 'studentType', 'status', 'submittedAt', // A-H
  'className', 'major', 'birthDate', 'gender', 'birthPlace', 'nationality', 'ethnic', 'religion', // I-P
  'cccdIssuedDate', 'cccdIssuedPlace', 'cmnd', 'cmndIssuedDate', 'cmndIssuedPlace', // Q-U
  'disability', 'disabilityType', 'hometown', 'socialInsuranceId', // V-Y
  'unionJoinDate', 'partyJoinDate', 'officialPartyJoinDate', // Z-AB
  'workPlace', 'emergencyContactName', 'emergencyContactPhone', // AC-AE
  // Hộ khẩu thường trú (Permanent Address)
  'perm_details', 'perm_house', 'perm_street', 'perm_hamlet', 'perm_ward', 'perm_district', 'perm_city', // AF-AL
  // Địa chỉ hiện tại (Current Address)
  'curr_details', 'curr_house', 'curr_street', 'curr_hamlet', 'curr_ward', 'curr_district', 'curr_city', // AM-AS
  // Bằng Đại học
  'uni_school', 'uni_system', 'uni_number', 'uni_book', 'uni_date', 'uni_year', 'uni_major', 'uni_spec', 'uni_signer', 'uni_transfer', // AT-BC
  // Bằng Thạc sĩ
  'master_school', 'master_system', 'master_number', 'master_book', 'master_date', 'master_year', 'master_major', 'master_spec', 'master_signer', // BD-BL
  // Gia đình
  'father_name', 'father_yob', 'father_job', 'father_phone', 'father_address', // BM-BQ
  'mother_name', 'mother_yob', 'mother_job', 'mother_phone', 'mother_address', // BR-BV
  'spouse_name', 'spouse_yob', 'spouse_job', 'spouse_phone', 'spouse_address', // BW-CA
  // FILE ĐÍNH KÈM (Đã tách riêng)
  'link_degree_uni',    // Link Bằng ĐH
  'link_degree_master', // Link Bằng Thạc sĩ
  'link_birth_cert',    // Link Khai sinh
  'link_cccd_front',    // Link CCCD Mặt trước
  'link_cccd_back',     // Link CCCD Mặt sau
  'link_other',         // Link khác
  // Các trường danh sách động (Vẫn giữ JSON)
  'educationHistory_JSON', 'workHistory_JSON', 'scientificWorks_JSON', 
  'rewards', 'discipline', 'isCommitted', 'photoUrl'
];

// Header cho Sheet: LOCATIONS_3_LEVEL (Nếu sử dụng hệ 3 cấp)
export const LOCATIONS_3_HEADERS = ['city', 'district', 'ward'];

// Header cho Sheet: LOCATIONS_2_LEVEL (Nếu sử dụng hệ 2 cấp)
export const LOCATIONS_2_HEADERS = ['city', 'ward'];

export const LOGO_URL = 'https://due.udn.vn/portals/_default/skins/dhkt/img/front/logoDUE.png';

export const LEARNING_TYPES = [
  'Chính quy',
  'Tại chức',
  'Từ xa',
  'Vừa làm vừa học',
  'Liên thông'
];

export const EDUCATION_LEVELS = [
  'Sau đại học',
  'Đại học',
  'Cao đẳng',
  'Trung cấp',
  'Phổ thông trung học',
  'Chưa tốt nghiệp PTTH'
];

// --- MOCK DATA FOR FALLBACK ---

export const MOCK_LOCATIONS: LocationData[] = [
  {
    name: 'Thành phố Đà Nẵng',
    districts: [
      { name: 'Quận Hải Châu', wards: ['Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Thạch Thang', 'Phường Thanh Bình'] },
      { name: 'Quận Thanh Khê', wards: ['Phường Tam Thuận', 'Phường Thanh Khê Tây', 'Phường Thanh Khê Đông', 'Phường Xuân Hà'] },
      { name: 'Quận Liên Chiểu', wards: ['Phường Hòa Minh', 'Phường Hòa Khánh Nam', 'Phường Hòa Khánh Bắc'] }
    ]
  },
  {
    name: 'Tỉnh Quảng Nam',
    districts: [
      { name: 'Thành phố Tam Kỳ', wards: ['Phường An Mỹ', 'Phường An Sơn', 'Phường Hòa Hương'] },
      { name: 'Thành phố Hội An', wards: ['Phường Cẩm An', 'Phường Cẩm Châu', 'Phường Cẩm Nam'] }
    ]
  }
];

export const MOCK_LOCATIONS_2_LEVEL: LocationDataTwoLevel[] = [
  {
    name: 'Tỉnh Bình Dương (Mới)',
    wards: ['Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa']
  },
  {
    name: 'Tỉnh Đồng Nai (Mới)',
    wards: ['Phường Bửu Long', 'Phường Tân Phong', 'Phường Tam Hiệp']
  }
];

export const INITIAL_ADDRESS: any = {
  details: '',
  houseNumber: '',
  street: '',
  hamlet: '',
  ward: '',
  district: '',
  city: ''
};

export const INITIAL_DEGREE: any = {
  school: '',
  system: '',
  degreeNumber: '',
  bookNumber: '',
  signDate: '',
  gradYear: '',
  major: '',
  specialization: '',
  signer: '',
  isTransfer: false
};

// Default config structure used before API load
export const MOCK_ADMIN_SETTINGS: SystemConfig = {
  isOpen: true,
  openDate: '2024-01-01',
  closeDate: '2025-12-31',
  addressMode: 'BOTH',
  requiredFields: [],
  fieldConfigs: [
    // ... (Keep existing fields if needed, or rely on API load)
    { id: 'fullName', label: 'Họ và tên', section: 'personal', isVisible: true, isRequired: true, appliesTo: 'BOTH' },
    // Simplified for brevity in this snippet as it's just MOCK data structure
  ],
  printSettings: {
    schoolHeader: 'ĐẠI HỌC ĐÀ NẴNG',
    subHeader: 'TRƯỜNG ĐẠI HỌC KINH TẾ',
    footerNote: 'Tôi xin cam đoan những lời khai trên là đúng sự thật.'
  },
  // NEW: Default Export Settings (Standard A4 Administrative)
  exportSettings: {
    marginTop: 20, // 2cm
    marginBottom: 20, // 2cm
    marginLeft: 30, // 3cm
    marginRight: 15, // 1.5cm
    fontFamily: 'Times New Roman',
    baseFontSize: 13 // 13pt
  }
};

export const MOCK_STUDENTS: any[] = [
  {
    id: 'CH202601',
    cccd: '012345678901',
    fullName: 'NGUYỄN VĂN A',
    email: 'nguyenvana@gmail.com',
    phone: '0905123456',
    studentType: StudentType.CAO_HOC,
    status: 'pending',
    className: 'K29.Quản trị',
    major: 'Quản trị kinh doanh',
    birthDate: '1998-05-20',
    gender: 'Nam',
    birthPlace: 'Thành phố Đà Nẵng',
    nationality: 'Việt Nam',
    ethnic: 'Kinh',
    religion: 'Không',
    cccdIssuedDate: '2021-06-15',
    cccdIssuedPlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
    cmnd: '201234567',
    cmndIssuedDate: '2014-05-10',
    cmndIssuedPlace: 'Công an Thành phố Đà Nẵng',
    disability: false,
    disabilityType: '',
    hometown: 'Quận Hải Châu, Thành phố Đà Nẵng',
    socialInsuranceId: '1234567890',
    unionJoinDate: '2013-03-26',
    partyJoinDate: '',
    officialPartyJoinDate: '',
    workPlace: 'Trường Đại học Kinh tế - ĐHĐN',
    emergencyContactName: 'Nguyễn Văn C',
    emergencyContactPhone: '0905111222',
    permanentAddress: {
      details: '123 Hùng Vương',
      houseNumber: '123',
      street: 'Hùng Vương',
      hamlet: 'Tổ 5',
      ward: 'Phường Hải Châu I',
      district: 'Quận Hải Châu',
      city: 'Thành phố Đà Nẵng'
    },
    currentAddress: {
      details: '123 Hùng Vương',
      houseNumber: '123',
      street: 'Hùng Vương',
      hamlet: 'Tổ 5',
      ward: 'Phường Hải Châu I',
      district: 'Quận Hải Châu',
      city: 'Thành phố Đà Nẵng'
    },
    uniDegree: {
      school: 'Trường Đại học Kinh tế - ĐHĐN',
      system: 'Chính quy',
      degreeNumber: 'B123456',
      bookNumber: 'S001',
      signDate: '2020-07-15',
      gradYear: '2020',
      major: 'Quản trị kinh doanh',
      specialization: 'Quản trị doanh nghiệp',
      signer: 'PGS.TS. Nguyễn Văn D',
      isTransfer: false
    },
    educationHistory: [
      { id: '1', timeRange: '09/2016 - 07/2020', schoolName: 'Trường Đại học Kinh tế - ĐHĐN', major: 'Quản trị kinh doanh', learningType: 'Chính quy', degree: 'Bằng Cử nhân' }
    ],
    workHistory: [
      { id: '1', timeRange: '08/2020 - Nay', organization: 'Trường Đại học Kinh tế - ĐHĐN', position: 'Chuyên viên' }
    ],
    scientificWorks: [
      '1. Nghiên cứu hành vi người tiêu dùng tại Đà Nẵng - Tạp chí Kinh tế 2022.',
      '2. Giải pháp chuyển đổi số cho doanh nghiệp vừa và nhỏ - Kỷ yếu hội thảo 2024.'
    ],
    rewards: 'Chiến sĩ thi đua cơ sở năm 2023',
    discipline: 'Không',
    father: {
      fullName: 'NGUYỄN VĂN C',
      birthDate: '1970',
      phone: '0905222333',
      job: 'Hưu trí',
      address: '123 Hùng Vương, Đà Nẵng',
      educationLevel: 'Đại học'
    },
    mother: {
      fullName: 'LÊ THỊ D',
      birthDate: '1973',
      phone: '0905444555',
      job: 'Giáo viên',
      address: '123 Hùng Vương, Đà Nẵng',
      educationLevel: 'Đại học'
    },
    spouse: {
      fullName: 'PHẠM THỊ E',
      birthDate: '1999',
      phone: '0905666777',
      job: 'Nhân viên ngân hàng',
      address: '123 Hùng Vương, Đà Nẵng',
      educationLevel: 'Đại học'
    },
    isCommitted: true,
    attachments: {}
  },
  {
    id: 'NCS202601',
    cccd: '012345678902',
    fullName: 'TRẦN THỊ B',
    email: 'tranthib@gmail.com',
    phone: '0905987654',
    studentType: StudentType.NCS,
    status: 'pending',
    className: 'K29.Kinh tế',
    major: 'Kinh tế học',
    birthDate: '1995-10-15',
    gender: 'Nữ',
    birthPlace: 'Tỉnh Quảng Nam',
    nationality: 'Việt Nam',
    ethnic: 'Kinh',
    religion: 'Không',
    cccdIssuedDate: '2020-05-12',
    cccdIssuedPlace: 'Cục Cảnh sát QLHC về trật tự xã hội',
    cmnd: '205678901',
    cmndIssuedDate: '2011-09-08',
    cmndIssuedPlace: 'Công an Tỉnh Quảng Nam',
    disability: false,
    disabilityType: '',
    hometown: 'Thành phố Tam Kỳ, Tỉnh Quảng Nam',
    socialInsuranceId: '0987654321',
    unionJoinDate: '2010-03-26',
    partyJoinDate: '2018-05-19',
    officialPartyJoinDate: '2019-05-19',
    workPlace: 'Ngân hàng Nhà nước Việt Nam',
    emergencyContactName: 'Trần Văn F',
    emergencyContactPhone: '0905777888',
    permanentAddress: {
      details: '456 Phan Châu Trinh',
      houseNumber: '456',
      street: 'Phan Châu Trinh',
      hamlet: 'Khối phố 4',
      ward: 'Phường An Mỹ',
      district: 'Thành phố Tam Kỳ',
      city: 'Tỉnh Quảng Nam'
    },
    currentAddress: {
      details: '789 Nguyễn Lương Bằng',
      houseNumber: '789',
      street: 'Nguyễn Lương Bằng',
      hamlet: 'Tổ 12',
      ward: 'Phường Hòa Khánh Bắc',
      district: 'Quận Liên Chiểu',
      city: 'Thành phố Đà Nẵng'
    },
    uniDegree: {
      school: 'Trường Đại học Kinh tế - ĐHĐN',
      system: 'Chính quy',
      degreeNumber: 'B654321',
      bookNumber: 'S002',
      signDate: '2017-07-15',
      gradYear: '2017',
      major: 'Kinh tế phát triển',
      specialization: 'Kinh tế học',
      signer: 'PGS.TS. Trần Văn G',
      isTransfer: false
    },
    masterDegree: {
      school: 'Trường Đại học Kinh tế - ĐHĐN',
      system: 'Chính quy',
      degreeNumber: 'M123456',
      bookNumber: 'MS01',
      signDate: '2020-11-20',
      gradYear: '2020',
      major: 'Kinh tế học',
      specialization: 'Kinh tế học',
      signer: 'PGS.TS. Trần Văn G'
    },
    educationHistory: [
      { id: '1', timeRange: '09/2013 - 07/2017', schoolName: 'Trường Đại học Kinh tế - ĐHĐN', major: 'Kinh tế phát triển', learningType: 'Chính quy', degree: 'Bằng Cử nhân' },
      { id: '2', timeRange: '09/2018 - 11/2020', schoolName: 'Trường Đại học Kinh tế - ĐHĐN', major: 'Kinh tế học', learningType: 'Chính quy', degree: 'Bằng Thạc sĩ' }
    ],
    workHistory: [
      { id: '1', timeRange: '12/2020 - Nay', organization: 'Ngân hàng Nhà nước Việt Nam', position: 'Chuyên viên nghiên cứu' }
    ],
    scientificWorks: [
      '1. Đánh giá tác động của chính sách tiền tệ đến tăng trưởng kinh tế Việt Nam - Tạp chí Ngân hàng 2021.',
      '2. Chuyển đổi số trong hệ thống ngân hàng thương mại - Kỷ yếu hội thảo quốc tế 2023.'
    ],
    rewards: 'Giấy khen của Thống đốc Ngân hàng Nhà nước Việt Nam 2022',
    discipline: 'Không',
    father: {
      fullName: 'TRẦN VĂN F',
      birthDate: '1965',
      phone: '0905777888',
      job: 'Kỹ sư xây dựng',
      address: '456 Phan Châu Trinh, Tam Kỳ, Quảng Nam',
      educationLevel: 'Đại học'
    },
    mother: {
      fullName: 'NGUYỄN THỊ H',
      birthDate: '1968',
      phone: '0905888999',
      job: 'Bác sĩ',
      address: '456 Phan Châu Trinh, Tam Kỳ, Quảng Nam',
      educationLevel: 'Sau đại học'
    },
    spouse: {
      fullName: 'LÊ VĂN I',
      birthDate: '1993',
      phone: '0905999000',
      job: 'Kinh doanh tự do',
      address: '789 Nguyễn Lương Bằng, Đà Nẵng',
      educationLevel: 'Đại học'
    },
    isCommitted: true,
    attachments: {}
  }
];
