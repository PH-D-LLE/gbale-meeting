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
  
  // Notice
  noticeBoxBg: string;
  noticeText: string;
  
  // Manual Proxy Download (New)
  proxyManualInstructions: string;
  proxyDownloadFile: string | null; // Base64 string
  proxyDownloadFileName: string | null;

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

  noticeBoxBg: "bg-amber-50",
  noticeText: "※ 참석이 어려우신 분은 위임장을 제출해주시기 바랍니다.\n※ 위임장 제출 시 전자서명이 필요합니다.",
  
  proxyManualInstructions: "서명이 어려우신가요?\nPC에서 접속하셨거나 전자서명이 어려운 경우, 아래 방법으로 위임장을 제출하실 수 있습니다.\n\n1. 위임장 서식을 다운로드 합니다.\n2. 서식을 작성하고 서명합니다.\n3. 촬영 또는 스캔하여 협회 이메일로 전송합니다.\n4. 협회 메일 gbale0217@naver.com",
  proxyDownloadFile: null,
  proxyDownloadFileName: null,

  contactOrgName: "사단법인 한국평생교육사협회",
  contactPhone: "02-499-0043",
  contactFax: "02-499-0044",
  contactEmail: "kale_2002@hanmail.net",
  contactHours: "10:00~15:00 (12~13시 제외)"
};