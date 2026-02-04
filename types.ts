export enum AttendanceType {
  ATTEND = 'ATTEND',
  PROXY = 'PROXY',
}

export interface AttendanceRecord {
  id: string;
  name: string;
  phone: string;
  type: AttendanceType;
  timestamp: string; // ISO string
  
  // Proxy specific fields
  proxyReceiver?: string; // 'PRESIDENT' | 'OTHER'
  proxyReceiverName?: string;
  signature?: string; // Base64 string
  agreedToTerms?: boolean; // Privacy agreement
}

export interface AdminUser {
  docId?: string;
  id: string;
  pw: string;
  name: string;
}

export interface AppSettings {
  // Texts
  title: string;
  subtitle: string;
  dateTime: string;
  location: string;
  
  // Visuals
  bannerImageUrl: string; // URL for the top banner image
  bannerHeight: string; // e.g. "h-48" or pixel value
  primaryColor: string; // Header background gradient
  
  // Styles
  attendButtonColor: string;
  proxyButtonColor: string;
  
  // Success Messages
  attendSuccessMsg: string;
  proxySuccessMsg: string;
  
  // Confirmation Messages (New)
  msgDuplicateAttendConfirm: string;
  msgDuplicateProxyConfirmFromAttend: string;
  msgDuplicateProxyConfirmFromProxy: string;
  
  // Error Messages (New)
  msgNameValidationError: string;
  msgPhoneValidationError: string;
  msgPrivacyError: string;
  msgSignatureError: string;
  msgProxyNameError: string;
  
  // Notice
  noticeBoxBg: string;
  noticeText: string;
  
  // Contact Info
  contactOrgName: string;
  contactPhone: string;
  contactFax: string;
  contactEmail: string;
  contactHours: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  title: "2026년 제25차 (사)한국평생교육사",
  subtitle: "협회 정기총회",
  dateTime: "2026. 2. 21.(토) 10:30",
  location: "온라인(Zoom) 운영",
  bannerImageUrl: "", // Default empty
  bannerHeight: "200", // px
  primaryColor: "from-slate-800 to-slate-900", 
  attendButtonColor: "bg-emerald-600 hover:bg-emerald-700",
  proxyButtonColor: "bg-blue-600 hover:bg-blue-700",
  
  attendSuccessMsg: "참석 정보가 정상적으로 되었습니다. 감사합니다.",
  proxySuccessMsg: "위임장 제출이 정상적으로 되었습니다. 감사합니다.",
  
  msgDuplicateAttendConfirm: "이미 의사가 등록되어 있습니다. 참석으로 변경(또는 갱신)하시겠습니까?",
  msgDuplicateProxyConfirmFromAttend: "이미 참석 제출하였습니다. 위임장으로 제출하시겠습니까?",
  msgDuplicateProxyConfirmFromProxy: "이미 의사가 등록되어 있습니다. 위임장 제출로 변경하시겠습니까?",
  
  msgNameValidationError: "이름은 한글 또는 영문(대소문자)만 입력 가능하며 공백이 없어야 합니다.",
  msgPhoneValidationError: "전화번호는 숫자만 입력해주세요.",
  msgPrivacyError: "개인정보 수집 및 이용에 동의해주셔야 제출이 가능합니다.",
  msgSignatureError: "서명이 필요합니다.",
  msgProxyNameError: "위임받을 회원의 이름을 입력해주세요.",

  noticeBoxBg: "bg-amber-50",
  noticeText: "※ 참석이 어려우신 분은 위임장을 제출해주시기 바랍니다.\n※ 위임장 제출 시 전자서명이 필요합니다.",
  contactOrgName: "사단법인 한국평생교육사협회",
  contactPhone: "02-499-0043",
  contactFax: "02-499-0044",
  contactEmail: "kale_2002@hanmail.net",
  contactHours: "10:00~15:00 (12~13시 제외)"
};