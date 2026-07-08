import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { StudentProfile, StudentType, SystemConfig } from "../types";

const clean = (val: any) => (val === null || val === undefined) ? "" : String(val);

const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const generateStudentDocx = async (data: StudentProfile, config: SystemConfig) => {
    const isNCS = data.studentType === StudentType.NCS;
    
    // Fetch the customized template file from public directory
    const templateUrl = isNCS 
        ? `${import.meta.env.BASE_URL}4_Template_Mailing_NCS.docx` 
        : `${import.meta.env.BASE_URL}1_Template_Mailing_v4.docx`;
    const response = await fetch(templateUrl);
    if (!response.ok) {
        throw new Error(`Không thể tải file mẫu từ ${templateUrl}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    
    const docData = {
        fullName: clean(data.fullName).toUpperCase(),
        birthDate_formatted: formatDate(data.birthDate),
        gender_nam: data.gender === "Nam" ? "☑" : "☐",
        gender_nu: data.gender === "Nữ" ? "☑" : "☐",
        birthPlace: clean(data.birthPlace),
        nationality: clean(data.nationality),
        ethnic: clean(data.ethnic),
        religion: clean(data.religion),
        cccd: clean(data.cccd),
        cccdIssuedDate_formatted: formatDate(data.cccdIssuedDate),
        cccdIssuedPlace: clean(data.cccdIssuedPlace),
        cmnd: clean(data.cmnd),
        cmndIssuedDate_formatted: formatDate(data.cmndIssuedDate),
        cmndIssuedPlace: clean(data.cmndIssuedPlace),
        disability_co: data.disability ? "☑" : "☐",
        disability_khong: !data.disability ? "☑" : "☐",
        disabilityType: clean(data.disabilityType),
        hometown: clean(data.hometown),
        socialInsuranceId: clean(data.socialInsuranceId),
        unionJoinDate_formatted: formatDate(data.unionJoinDate),
        partyJoinDate_formatted: formatDate(data.partyJoinDate),
        officialPartyJoinDate_formatted: formatDate(data.officialPartyJoinDate),
        workPlace: clean(data.workPlace),
        phone: clean(data.phone),
        email: clean(data.email),
        emergencyContactName: clean(data.emergencyContactName),
        emergencyContactPhone: clean(data.emergencyContactPhone),
        
        perm_house: clean(data.permanentAddress?.houseNumber),
        perm_street: clean(data.permanentAddress?.street),
        perm_hamlet: clean(data.permanentAddress?.hamlet),
        perm_ward: clean(data.permanentAddress?.ward),
        perm_district: clean(data.permanentAddress?.district),
        perm_city: clean(data.permanentAddress?.city),
        
        curr_house: clean(data.currentAddress?.houseNumber),
        curr_street: clean(data.currentAddress?.street),
        curr_hamlet: clean(data.currentAddress?.hamlet),
        curr_ward: clean(data.currentAddress?.ward),
        curr_district: clean(data.currentAddress?.district),
        curr_city: clean(data.currentAddress?.city),
        
        uni_school: clean(data.uniDegree?.school),
        uni_system: clean(data.uniDegree?.system),
        uni_number: clean(data.uniDegree?.degreeNumber),
        uni_book: clean(data.uniDegree?.bookNumber),
        uni_date_formatted: formatDate(data.uniDegree?.signDate),
        uni_year: clean(data.uniDegree?.gradYear),
        uni_major: clean(data.uniDegree?.major),
        uni_spec: clean(data.uniDegree?.specialization),
        uni_signer: clean(data.uniDegree?.signer),
        uni_transfer_co: data.uniDegree?.isTransfer ? "☑" : "☐",
        uni_transfer_khong: !data.uniDegree?.isTransfer ? "☑" : "☐",
        
        master_school: clean(data.masterDegree?.school),
        master_system: clean(data.masterDegree?.system),
        master_number: clean(data.masterDegree?.degreeNumber),
        master_book: clean(data.masterDegree?.bookNumber),
        master_date_formatted: formatDate(data.masterDegree?.signDate),
        master_year: clean(data.masterDegree?.gradYear),
        master_major: clean(data.masterDegree?.major),
        master_spec: clean(data.masterDegree?.specialization),
        master_signer: clean(data.masterDegree?.signer),
        
        father_name: clean(data.father?.fullName).toUpperCase(),
        father_yob: clean(data.father?.birthDate),
        father_phone: clean(data.father?.phone),
        father_job: clean(data.father?.job),
        father_address: clean(data.father?.address),
        father_edu_sdh: data.father?.educationLevel === "Sau đại học" ? "☑" : "☐",
        father_edu_dh: data.father?.educationLevel === "Đại học" ? "☑" : "☐",
        father_edu_cd: data.father?.educationLevel === "Cao đẳng" ? "☑" : "☐",
        father_edu_tc: data.father?.educationLevel === "Trung cấp" ? "☑" : "☐",
        father_edu_ptth: data.father?.educationLevel === "Phổ thông trung học" ? "☑" : "☐",
        father_edu_chuatn: data.father?.educationLevel === "Chưa tốt nghiệp PTTH" ? "☑" : "☐",
        
        mother_name: clean(data.mother?.fullName).toUpperCase(),
        mother_yob: clean(data.mother?.birthDate),
        mother_phone: clean(data.mother?.phone),
        mother_job: clean(data.mother?.job),
        mother_address: clean(data.mother?.address),
        mother_edu_sdh: data.mother?.educationLevel === "Sau đại học" ? "☑" : "☐",
        mother_edu_dh: data.mother?.educationLevel === "Đại học" ? "☑" : "☐",
        mother_edu_cd: data.mother?.educationLevel === "Cao đẳng" ? "☑" : "☐",
        mother_edu_tc: data.mother?.educationLevel === "Trung cấp" ? "☑" : "☐",
        mother_edu_ptth: data.mother?.educationLevel === "Phổ thông trung học" ? "☑" : "☐",
        mother_edu_chuatn: data.mother?.educationLevel === "Chưa tốt nghiệp PTTH" ? "☑" : "☐",
        
        spouse_name: clean(data.spouse?.fullName).toUpperCase(),
        spouse_yob: clean(data.spouse?.birthDate),
        spouse_phone: clean(data.spouse?.phone),
        spouse_job: clean(data.spouse?.job),
        spouse_address: clean(data.spouse?.address),
        spouse_edu_sdh: data.spouse?.educationLevel === "Sau đại học" ? "☑" : "☐",
        spouse_edu_dh: data.spouse?.educationLevel === "Đại học" ? "☑" : "☐",
        spouse_edu_cd: data.spouse?.educationLevel === "Cao đẳng" ? "☑" : "☐",
        spouse_edu_tc: data.spouse?.educationLevel === "Trung cấp" ? "☑" : "☐",
        spouse_edu_ptth: data.spouse?.educationLevel === "Phổ thông trung học" ? "☑" : "☐",
        spouse_edu_chuatn: data.spouse?.educationLevel === "Chưa tốt nghiệp PTTH" ? "☑" : "☐",
        
        className: clean(data.className),
        major: clean(data.major),
        
        footer_date: isNCS ? "................, ngày ......... tháng ......... năm 20....." : "…..………......, ngày .......... tháng …... năm 20.....",
        footer_sig_dots: isNCS ? "" : "…………………………….",
        
        educationHistory: (data.educationHistory || []).map((item: any) => ({
            timeRange: clean(item.timeRange),
            schoolName: clean(item.schoolName),
            major: clean(item.major),
            learningType: clean(item.learningType),
            degree: clean(item.degree)
        })),
        workHistory: (data.workHistory || []).map((item: any) => ({
            timeRange: clean(item.timeRange),
            organization: clean(item.organization),
            position: clean(item.position)
        })),
        rewards: clean(data.rewards),
        discipline: clean(data.discipline),
        scientificWorks: data.scientificWorks || []
    };
    
    doc.setData(docData);
    
    try {
        doc.render();
    } catch (error) {
        console.error("Lỗi khi render docxtemplater:", error);
        throw error;
    }
    
    const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    
    // Trigger download
    const url = window.URL.createObjectURL(out);
    const a = document.createElement("a");
    a.href = url;
    a.download = isNCS 
        ? `Phieu_Ly_lich_NCS_${data.id}_${data.fullName.replace(/\s+/g, '_')}.docx`
        : `Phieu_Ly_lich_Hoc_vien_${data.id}_${data.fullName.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
