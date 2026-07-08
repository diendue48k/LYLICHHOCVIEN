
import { GOOGLE_SCRIPT_URL, GOOGLE_SHEET_URL, MOCK_ADMIN_SETTINGS, MOCK_LOCATIONS, MOCK_LOCATIONS_2_LEVEL, MOCK_STUDENTS } from '../constants';
import { SystemConfig } from '../types';

// Helper: Extract Spreadsheet ID from URL
const getSpreadsheetId = () => {
    const matches = GOOGLE_SHEET_URL.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : '';
};

const SPREADSHEET_ID = getSpreadsheetId();

// *** CACHING SYSTEM ***
const CACHE_PREFIX = 'DUE_CACHE_';
const CACHE_EXPIRY_LOCATIONS = 24 * 60 * 60 * 1000; // 24 Hours for Static Data
const CACHE_EXPIRY_CONFIG = 5 * 60 * 1000; // 5 Minutes for System Config

const getFromCache = (key: string) => {
    try {
        const record = localStorage.getItem(CACHE_PREFIX + key);
        if (!record) return null;
        
        const { value, timestamp, expiry } = JSON.parse(record);
        if (Date.now() - timestamp > expiry) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return value;
    } catch (e) {
        return null;
    }
};

const setCache = (key: string, value: any, expiry: number) => {
    try {
        const record = {
            value,
            timestamp: Date.now(),
            expiry
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(record));
    } catch (e) {
        console.warn('LocalStorage full or disabled');
    }
};

// Helper: Remove empty keys to reduce payload size (OP-02)
const cleanObject = (obj: any) => {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

// Helper: Flatten Profile for Sheet Columns (DR-02: Mapping Logic)
const flattenProfile = (p: any) => {
  const raw = {
    id: p.id,
    cccd: p.cccd,
    fullName: p.fullName?.trim().toUpperCase(), // OP-02: Normalize
    email: p.email?.trim(),
    phone: p.phone,
    studentType: p.studentType,
    status: p.status,
    submittedAt: p.submittedAt,
    className: p.className,
    major: p.major,
    birthDate: p.birthDate,
    gender: p.gender,
    birthPlace: p.birthPlace,
    nationality: p.nationality,
    ethnic: p.ethnic,
    religion: p.religion,
    cccdIssuedDate: p.cccdIssuedDate,
    cccdIssuedPlace: p.cccdIssuedPlace,
    cmnd: p.cmnd,
    cmndIssuedDate: p.cmndIssuedDate,
    cmndIssuedPlace: p.cmndIssuedPlace,
    disability: p.disability,
    disabilityType: p.disabilityType,
    hometown: p.hometown,
    socialInsuranceId: p.socialInsuranceId,
    unionJoinDate: p.unionJoinDate,
    partyJoinDate: p.partyJoinDate,
    officialPartyJoinDate: p.officialPartyJoinDate,
    workPlace: p.workPlace,
    emergencyContactName: p.emergencyContactName,
    emergencyContactPhone: p.emergencyContactPhone,

    // Permanent Address
    perm_details: p.permanentAddress?.details || '',
    perm_house: p.permanentAddress?.houseNumber || '',
    perm_street: p.permanentAddress?.street || '',
    perm_hamlet: p.permanentAddress?.hamlet || '',
    perm_ward: p.permanentAddress?.ward || '',
    perm_district: p.permanentAddress?.district || '',
    perm_city: p.permanentAddress?.city || '',

    // Current Address
    curr_details: p.currentAddress?.details || '',
    curr_house: p.currentAddress?.houseNumber || '',
    curr_street: p.currentAddress?.street || '',
    curr_hamlet: p.currentAddress?.hamlet || '',
    curr_ward: p.currentAddress?.ward || '',
    curr_district: p.currentAddress?.district || '',
    curr_city: p.currentAddress?.city || '',

    // Uni Degree
    uni_school: p.uniDegree?.school || '',
    uni_system: p.uniDegree?.system || '',
    uni_number: p.uniDegree?.degreeNumber || '',
    uni_book: p.uniDegree?.bookNumber || '',
    uni_date: p.uniDegree?.signDate || '',
    uni_year: p.uniDegree?.gradYear || '',
    uni_major: p.uniDegree?.major || '',
    uni_spec: p.uniDegree?.specialization || '',
    uni_signer: p.uniDegree?.signer || '',
    uni_transfer: p.uniDegree?.isTransfer ? 'Có' : 'Không',

    // Master Degree
    master_school: p.masterDegree?.school || '',
    master_system: p.masterDegree?.system || '',
    master_number: p.masterDegree?.degreeNumber || '',
    master_book: p.masterDegree?.bookNumber || '',
    master_date: p.masterDegree?.signDate || '',
    master_year: p.masterDegree?.gradYear || '',
    master_major: p.masterDegree?.major || '',
    master_spec: p.masterDegree?.specialization || '',
    master_signer: p.masterDegree?.signer || '',

    // Family
    father_name: p.father?.fullName || '',
    father_yob: p.father?.birthDate || '',
    father_job: p.father?.job || '',
    father_phone: p.father?.phone || '',
    father_address: p.father?.address || '',
    
    mother_name: p.mother?.fullName || '',
    mother_yob: p.mother?.birthDate || '',
    mother_job: p.mother?.job || '',
    mother_phone: p.mother?.phone || '',
    mother_address: p.mother?.address || '',

    spouse_name: p.spouse?.fullName || '',
    spouse_yob: p.spouse?.birthDate || '',
    spouse_job: p.spouse?.job || '',
    spouse_phone: p.spouse?.phone || '',
    spouse_address: p.spouse?.address || '',

    // Links
    link_degree_uni: p.attachments?.degreeUniFile || '',
    link_degree_master: p.attachments?.degreeMasterFile || '',
    link_birth_cert: p.attachments?.birthCertFile || '',
    link_cccd_front: p.attachments?.cccdFrontFile || '',
    link_cccd_back: p.attachments?.cccdBackFile || '',
    link_other: p.attachments?.othersFile || '',

    // JSON Fields
    educationHistory_JSON: (p.educationHistory && p.educationHistory.length) ? JSON.stringify(p.educationHistory) : '',
    workHistory_JSON: (p.workHistory && p.workHistory.length) ? JSON.stringify(p.workHistory) : '',
    scientificWorks_JSON: (p.scientificWorks && p.scientificWorks.length) ? JSON.stringify(p.scientificWorks) : '',
    
    rewards: p.rewards || '',
    discipline: p.discipline || '',
    isCommitted: p.isCommitted ? 'TRUE' : 'FALSE',
    photoUrl: p.photoUrl || ''
  };

  return cleanObject(raw);
};

const checkUrl = () => {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PLACEHOLDER')) return false;
    return true;
};

// --- ROBUST FETCH WITH RETRY & CACHE BUSTING (DR-01) ---

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
             const text = await response.text().catch(() => response.statusText);
             throw new Error(`HTTP Error ${response.status}: ${text}`);
        }
        return response;
    } catch (err) {
        if (retries <= 1) throw err;
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
    }
};

interface GASResponse {
    success: boolean;
    data?: any;
    message?: string;
    isNetworkError?: boolean;
}

const fetchGAS = async (url: string, options: RequestInit = {}): Promise<GASResponse> => {
    const headers: any = { ...options.headers };
    if (options.method === 'POST' || options.method === 'PUT') {
        headers['Content-Type'] = 'text/plain;charset=utf-8';
    }

    // Append timestamp to prevent caching for GET requests (SSOT Rule)
    let finalUrl = url;
    if (!options.method || options.method === 'GET') {
        const separator = url.includes('?') ? '&' : '?';
        // Check if _t already exists to avoid duplication
        if (!url.includes('_t=')) {
            finalUrl = `${url}${separator}_t=${Date.now()}`;
        }
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
        redirect: 'follow',
        credentials: 'omit', // Important for GAS Web Apps
        cache: 'no-store', // Force no-cache
        // keepalive removed as it can cause issues with GAS redirect
    };

    try {
        const response = await fetchWithRetry(finalUrl, fetchOptions);
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("GAS API Error (Non-JSON):", text.substring(0, 200));
            if (text.includes("Google Accounts") || text.includes("<!DOCTYPE html>")) {
                 return { success: false, message: "Lỗi xác thực: Script chưa được set quyền 'Anyone'. Vui lòng kiểm tra lại Deployment.", isNetworkError: true };
            }
            return { success: false, message: `Server trả về định dạng không hợp lệ: ${text.substring(0, 50)}...`, isNetworkError: true };
        }
    } catch (error: any) {
        console.warn("API Request Failed:", error);
        return { 
            success: false, 
            message: `Không thể kết nối đến Server: ${error.message || 'Lỗi mạng'}`,
            isNetworkError: true 
        };
    }
};

export const convertFlatLocationsToTree = (flatData: any[], type: '3_LEVELS' | '2_LEVELS') => {
    if (!Array.isArray(flatData)) return [];

    if (type === '3_LEVELS') {
        const tree: Record<string, Record<string, string[]>> = {};

        flatData.forEach(item => {
            const city = item.city || item[0];
            const district = item.district || item[1];
            const ward = item.ward || item[2];

            if (!city) return;
            const c = String(city).trim();
            const d = String(district || '').trim();
            const w = String(ward || '').trim();

            if (!tree[c]) tree[c] = {};
            if (d) {
                if (!tree[c][d]) tree[c][d] = [];
                if (w && !tree[c][d].includes(w)) {
                    tree[c][d].push(w);
                }
            }
        });

        return Object.keys(tree).map(cityName => ({
            name: cityName,
            districts: Object.keys(tree[cityName]).map(distName => ({
                name: distName,
                wards: tree[cityName][distName].sort()
            })).sort((a, b) => a.name.localeCompare(b.name))
        })).sort((a, b) => a.name.localeCompare(b.name));
    } else {
        // 2_LEVELS
        const tree: Record<string, string[]> = {};

        flatData.forEach(item => {
            const city = item.city || item[0];
            const ward = item.ward || item[1];

            if (!city) return;
            const c = String(city).trim();
            const w = String(ward || '').trim();

            if (!tree[c]) tree[c] = [];
            if (w && !tree[c].includes(w)) {
                tree[c].push(w);
            }
        });

        return Object.keys(tree).map(cityName => ({
            name: cityName,
            wards: tree[cityName].sort()
        })).sort((a, b) => a.name.localeCompare(b.name));
    }
};

export const api = {
  checkConnection: async () => {
      if (!GOOGLE_SCRIPT_URL.endsWith('/exec')) {
          return { success: false, message: 'URL không hợp lệ! Phải kết thúc bằng "/exec".' };
      }
      return await fetchGAS(`${GOOGLE_SCRIPT_URL}?action=getConfig&ssid=${SPREADSHEET_ID}`);
  },

  getConfig: async (): Promise<SystemConfig | null> => {
    if (!checkUrl()) return MOCK_ADMIN_SETTINGS;
    
    // Cache Check
    const cached = getFromCache('CONFIG');
    if (cached) return cached;

    const result = await fetchGAS(`${GOOGLE_SCRIPT_URL}?action=getConfig&ssid=${SPREADSHEET_ID}`);
    if (result.success) {
        setCache('CONFIG', result.data, CACHE_EXPIRY_CONFIG);
        return result.data;
    }
    
    console.warn("Using MOCK config due to API error:", result.message);
    return MOCK_ADMIN_SETTINGS;
  },

  getLocations: async (type: '3_LEVELS' | '2_LEVELS') => {
    // Cache Check (Locations are heavy and static, cache aggressively)
    const cacheKey = type === '3_LEVELS' ? 'LOCATIONS_3' : 'LOCATIONS_2';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    if (type === '3_LEVELS') {
        try {
            // First attempt to load from local static JSON generated from Excel
            const res = await fetch('/locations.json');
            if (res.ok) {
                const data = await res.json();
                setCache(cacheKey, data, CACHE_EXPIRY_LOCATIONS);
                return data;
            }
        } catch (e) {
            console.error("Failed to fetch locations.json", e);
        }
    }

    if (!checkUrl()) return type === '3_LEVELS' ? MOCK_LOCATIONS : MOCK_LOCATIONS_2_LEVEL;

    const result = await fetchGAS(`${GOOGLE_SCRIPT_URL}?action=getLocations&type=${type}&ssid=${SPREADSHEET_ID}`);
    if (result.success && Array.isArray(result.data)) {
        const treeData = convertFlatLocationsToTree(result.data, type);
        setCache(cacheKey, treeData, CACHE_EXPIRY_LOCATIONS);
        return treeData;
    }
    return type === '3_LEVELS' ? MOCK_LOCATIONS : MOCK_LOCATIONS_2_LEVEL;
  },

  saveLocations: async (type: '3_LEVELS' | '2_LEVELS', flatData: any[], sheetName?: string) => {
     if (!checkUrl()) return { success: true, message: 'Đã lưu địa điểm giả lập (Demo)' };
     const targetSheetName = sheetName || (type === '3_LEVELS' ? 'LOCATIONS_3_LEVEL' : 'LOCATIONS_2_LEVEL');
     const url = `${GOOGLE_SCRIPT_URL}?action=saveLocations&ssid=${SPREADSHEET_ID}&sheetName=${targetSheetName}`;
     const payload = { action: 'saveLocations', type, data: flatData, spreadsheetId: SPREADSHEET_ID, sheetName: targetSheetName };
     
     // Invalidate cache on save
     localStorage.removeItem(CACHE_PREFIX + (type === '3_LEVELS' ? 'LOCATIONS_3' : 'LOCATIONS_2'));
     
     return await fetchGAS(url, { method: 'POST', body: JSON.stringify(payload) });
  },

  // DR-01: SSOT - Always fetch fresh data on login
  studentLogin: async (id: string) => {
    if (!checkUrl()) {
        const student = MOCK_STUDENTS.find(s => s.id === id || s.cccd === id);
        return student 
            ? { success: true, role: 'STUDENT', data: student, message: undefined }
            : { success: false, message: 'Chưa kết nối Database (Chế độ Demo)' };
    }
    return await fetchGAS(`${GOOGLE_SCRIPT_URL}?action=login&id=${id}&ssid=${SPREADSHEET_ID}`);
  },

  // DR-01 & SR-02: Get fresh student data (for Preview/Sync)
  getStudent: async (id: string) => {
    if (!checkUrl()) return null;
    const result = await fetchGAS(`${GOOGLE_SCRIPT_URL}?action=login&id=${id}&ssid=${SPREADSHEET_ID}`);
    return result.success ? result.data : null;
  },

  // SR-01: Sync Data from Form -> Sheet
  saveStudent: async (profile: any) => {
    if (!checkUrl()) return { success: true, message: 'Đã lưu giả lập (Demo)' };
    
    // Validate: Don't save if no ID
    if (!profile.id) return { success: false, message: 'Thiếu Mã học viên (Primary Key).' };

    const url = `${GOOGLE_SCRIPT_URL}?action=saveStudent&ssid=${SPREADSHEET_ID}&sheetName=STUDENTS`;
    const flatData = flattenProfile(profile);
    const payload = {
        action: 'saveStudent',
        spreadsheetId: SPREADSHEET_ID,
        sheetName: 'STUDENTS',
        data: flatData
    };

    return await fetchGAS(url, {
        method: 'POST',
        body: JSON.stringify(payload), 
    });
  },

  saveStudentsBulk: async (profiles: any[], sheetName: string = 'STUDENTS', onProgress?: (current: number, total: number) => void) => {
    if (!checkUrl()) return { success: true, message: 'Đã lưu giả lập (Demo)' };
    const flatProfiles = profiles.map(flattenProfile);
    const CHUNK_SIZE = 5; // OP-01: Batching
    let globalSuccess = true;
    let errors: string[] = [];
    let isNetworkErrorGlobal = false;
    const url = `${GOOGLE_SCRIPT_URL}?action=saveStudentsBulk&ssid=${SPREADSHEET_ID}&sheetName=${sheetName}`;
    const total = flatProfiles.length;
    let processed = 0;

    for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = flatProfiles.slice(i, i + CHUNK_SIZE);
        const payload = { action: 'saveStudentsBulk', spreadsheetId: SPREADSHEET_ID, sheetName: sheetName, data: chunk };
        const result = await fetchGAS(url, { method: 'POST', body: JSON.stringify(payload) });
        processed += chunk.length;
        if (onProgress) onProgress(Math.min(processed, total), total);

        if (!result.success) {
            globalSuccess = false;
            if (result.isNetworkError) isNetworkErrorGlobal = true;
            if (result.message) errors.push(result.message);
        }
    }
    
    if (globalSuccess) return { success: true, message: 'Đã lưu thành công.' };
    return { success: false, isNetworkError: isNetworkErrorGlobal, message: errors.length > 0 ? errors[0] : 'Lỗi không xác định' };
  },

  getAllStudents: async (sheetName: string = 'STUDENTS') => {
    if (!checkUrl()) return MOCK_STUDENTS;
    const result = await fetchGAS(`${GOOGLE_SCRIPT_URL}?action=getAllStudents&ssid=${SPREADSHEET_ID}&sheetName=${sheetName}`);
    return result.success ? result.data : [];
  },

  saveConfig: async (config: SystemConfig) => {
    if (!checkUrl()) return { success: true, message: 'Đã lưu cấu hình giả lập (Demo)' };
    const url = `${GOOGLE_SCRIPT_URL}?action=saveConfig&ssid=${SPREADSHEET_ID}`;
    const payload = { action: 'saveConfig', spreadsheetId: SPREADSHEET_ID, config };
    
    // Invalidate config cache
    localStorage.removeItem(CACHE_PREFIX + 'CONFIG');
    
    return await fetchGAS(url, { method: 'POST', body: JSON.stringify(payload) });
  }
};
