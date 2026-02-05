import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { AttendanceType, AttendanceRecord } from '../types';
import { Modal } from '../components/Modal';

const PHONE_PREFIXES = [
  '010', '011', '016', '017', '018', '019', // Mobile
  '02', // Seoul
  '031', '032', '033', // Gyeonggi, Incheon, Gangwon
  '041', '042', '043', '044', // Chungcheong
  '051', '052', '053', '054', '055', // Gyeongsang
  '061', '062', '063', '064' // Jeolla, Jeju
];

export const UserMain: React.FC = () => {
  const navigate = useNavigate();
  const { settings, addRecord, records, setTempUser, tempUser } = useGlobal();
  
  // State for inputs
  const [name, setName] = useState('');
  
  // Split Phone State
  const [phone1, setPhone1] = useState('010');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');

  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // Refs for auto-focus
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'SUCCESS' | 'CONFIRM_ATTEND' | 'CONFIRM_PROXY_REDIRECT' | 'ERROR';
  }>({ isOpen: false, title: '', message: '', type: 'SUCCESS' });

  useEffect(() => {
    if (tempUser) {
      setName(tempUser.name);
      // Try to parse existing phone number if coming back
      // Assuming format is continuous numbers
      if (tempUser.phone.startsWith('010') && tempUser.phone.length === 11) {
          setPhone1(tempUser.phone.substring(0,3));
          setPhone2(tempUser.phone.substring(3,7));
          setPhone3(tempUser.phone.substring(7,11));
      } else {
          // Fallback parsing or just leave as is if complex
      }
    }
  }, [tempUser]);

  // Handle phone input with auto-focus
  const handlePhone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length <= 4) {
          setPhone2(val);
          if (val.length === 4 && phone3Ref.current) {
              phone3Ref.current.focus();
          }
      }
  };

  const handlePhone3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length <= 4) {
          setPhone3(val);
      }
  };

  const getFullPhone = () => `${phone1}${phone2}${phone3}`;

  const validateInput = () => {
    const trimmedName = name.trim();
    const fullPhone = getFullPhone();
    
    // 1. Name Validation (Length & Regex)
    const nameRegex = /^[a-zA-Z가-힣]+$/; // Allows Hangul and English
    
    if (trimmedName.length < 2) {
        setModalConfig({
            isOpen: true,
            title: "입력 오류",
            message: "이름은 최소 2글자 이상 입력해주세요.",
            type: 'ERROR'
        });
        return false;
    }

    if (!nameRegex.test(trimmedName)) {
      setModalConfig({
        isOpen: true,
        title: "입력 오류",
        message: "이름은 한글 또는 영문만 입력 가능하며 공백이나 특수문자는 사용할 수 없습니다.",
        type: 'ERROR'
      });
      return false;
    }

    // 2. Phone Validation
    if (phone2.length < 3 || phone3.length < 4) {
       setModalConfig({
        isOpen: true,
        title: "입력 오류",
        message: "전화번호 형식이 올바르지 않습니다. 번호를 모두 입력해주세요.",
        type: 'ERROR'
      });
      return false;
    }

    // 3. Privacy Agreement
    if (!privacyAgreed) {
        setModalConfig({
            isOpen: true,
            title: "동의 필요",
            message: "개인정보 수집 및 이용에 동의해주셔야 제출이 가능합니다.",
            type: 'ERROR'
        });
        return false;
    }

    return true;
  };

  const checkExisting = (targetName: string, targetPhone: string): AttendanceRecord | undefined => {
    return records.find(r => r.name === targetName && r.phone === targetPhone);
  };

  const handleAttendClick = () => {
    if (!validateInput()) return;

    const finalName = name.trim();
    const finalPhone = getFullPhone();

    const existing = checkExisting(finalName, finalPhone);
    if (existing) {
       setModalConfig({
        isOpen: true,
        title: "중복 제출",
        message: "이미 위임장 제출이 등록되어 있습니다. 참석으로 변경(또는 갱신)하시겠습니까?",
        type: 'CONFIRM_ATTEND'
      });
    } else {
      processAttend(finalName, finalPhone);
    }
  };

  const processAttend = (finalName: string, finalPhone: string) => {
    // If existing, reuse ID to update
    const existing = checkExisting(finalName, finalPhone);
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : crypto.randomUUID(),
      name: finalName,
      phone: finalPhone,
      type: AttendanceType.ATTEND,
      timestamp: new Date().toISOString(),
      agreedToTerms: true
    };
    addRecord(newRecord);
    setModalConfig({
      isOpen: true,
      title: "완료",
      message: settings.attendSuccessMsg,
      type: 'SUCCESS'
    });
  };

  const handleProxyClick = () => {
    if (!validateInput()) return;

    const finalName = name.trim();
    const finalPhone = getFullPhone();

    const existing = checkExisting(finalName, finalPhone);
    if (existing) {
      const isAttend = existing.type === AttendanceType.ATTEND;
      const msg = isAttend 
        ? "이미 참석 제출하였습니다. 위임장으로 제출하시겠습니까?"
        : "이미 참석 제출로 등록되어 있습니다. 위임장 제출로 변경하시겠습니까?";

      setModalConfig({
        isOpen: true,
        title: "중복 제출",
        message: msg,
        type: 'CONFIRM_PROXY_REDIRECT'
      });
    } else {
      setTempUser({ name: finalName, phone: finalPhone });
      navigate('/proxy');
    }
  };

  const handleModalConfirm = () => {
    const finalName = name.trim();
    const finalPhone = getFullPhone();

    if (modalConfig.type === 'CONFIRM_ATTEND') {
      processAttend(finalName, finalPhone);
    } else if (modalConfig.type === 'CONFIRM_PROXY_REDIRECT') {
      setTempUser({ name: finalName, phone: finalPhone });
      navigate('/proxy');
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <header className={`relative w-full bg-gradient-to-br ${settings.primaryColor} text-white shadow-lg overflow-hidden`}>
        {settings.bannerImageUrl && (
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
                style={{ backgroundImage: `url(${settings.bannerImageUrl})` }}
            ></div>
        )}
        <div className="relative z-10 container mx-auto px-6 pt-12 pb-20 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-md">
            {settings.title}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-white/90 drop-shadow-sm">
            {settings.subtitle}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-10 mb-12 relative z-20 max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-100">
          
          {/* Info Section */}
          <div className="bg-gray-50 border-b border-gray-100 p-6">
            <div className="space-y-3 text-sm md:text-base text-gray-700">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-16 font-bold text-indigo-600">일시</span>
                <span>{settings.dateTime}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-16 font-bold text-indigo-600">장소</span>
                <span>{settings.location}</span>
              </div>
            </div>
            
            <div 
                className={`mt-4 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${settings.noticeBoxBg} text-gray-700 border border-black/5 break-words`}
                dangerouslySetInnerHTML={{ __html: settings.noticeText }}
            >
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-3">회원 정보 입력</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="성명 (2글자 이상)"
                  minLength={2}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">전화번호</label>
                <div className="flex gap-2">
                    <select
                        value={phone1}
                        onChange={(e) => setPhone1(e.target.value)}
                        className="w-[28%] px-2 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center appearance-none"
                        style={{ textAlignLast: 'center' }}
                    >
                        {PHONE_PREFIXES.map(prefix => (
                            <option key={prefix} value={prefix}>{prefix}</option>
                        ))}
                    </select>
                    <input
                        ref={phone2Ref}
                        type="tel"
                        value={phone2}
                        onChange={handlePhone2Change}
                        placeholder="1234"
                        maxLength={4}
                        className="w-[36%] px-3 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-center tracking-widest"
                    />
                    <input
                        ref={phone3Ref}
                        type="tel"
                        value={phone3}
                        onChange={handlePhone3Change}
                        placeholder="5678"
                        maxLength={4}
                        className="w-[36%] px-3 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-center tracking-widest"
                    />
                </div>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-2">개인정보 수집 및 이용 동의</h3>
                <div className="text-xs text-slate-600 mb-3 space-y-1 leading-relaxed h-24 overflow-y-auto pr-2 custom-scrollbar border border-slate-100 bg-white p-2 rounded">
                    <p>회의 준비를 위해 개인정보를 수집·이용할 목적으로 개인정보보호법 제15조, 제17조 및 제22조에 따라 귀하의 동의를 받고자 합니다.</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li><strong>수집항목:</strong> 이름, 전화번호</li>
                        <li><strong>수집 및 이용 목적:</strong> 회의 준비 및 안내</li>
                        <li><strong>보유 및 이용기간:</strong> 회의 종료일로부터 5년간 보유</li>
                    </ul>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 bg-white"
                    />
                    <span className="text-sm font-bold text-gray-800">위 내용에 동의합니다. (필수)</span>
                </label>
            </div>

            <div className="pt-2 grid grid-cols-1 gap-3">
              <button
                onClick={handleAttendClick}
                className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-md transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${settings.attendButtonColor}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                참석 제출하기
              </button>
              <button
                onClick={handleProxyClick}
                className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-md transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${settings.proxyButtonColor}`}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                위임장 작성하기
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-4">
            <div dangerouslySetInnerHTML={{ __html: settings.contactOrgName }} className="font-bold text-gray-700"></div>
            <div className="text-sm text-gray-500 space-y-1 bg-white/50 p-4 rounded-lg inline-block">
              <div className="flex flex-wrap justify-center items-center gap-2">
                  <span>전화:</span> <span dangerouslySetInnerHTML={{ __html: settings.contactPhone }} />
                  <span className="text-gray-300">|</span>
                  <span>FAX:</span> <span dangerouslySetInnerHTML={{ __html: settings.contactFax }} />
              </div>
              <div className="flex justify-center items-center gap-2">
                  <span>이메일:</span> <span dangerouslySetInnerHTML={{ __html: settings.contactEmail }} />
              </div>
              <div className="flex justify-center items-center gap-2 text-gray-400 mt-2 text-xs">
                  <span>상담시간:</span> <span dangerouslySetInnerHTML={{ __html: settings.contactHours }} />
              </div>
            </div>
        </div>

        {/* Admin Link */}
        <div className="mt-8 mb-4 text-center">
           <button onClick={() => navigate('/admin/login')} className="text-xs text-gray-400 hover:text-gray-600 px-4 py-2 opacity-50 hover:opacity-100 transition-opacity">관리자 접속</button>
        </div>
      </main>

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={handleModalConfirm}
        onCancel={
          (modalConfig.type === 'CONFIRM_ATTEND' || modalConfig.type === 'CONFIRM_PROXY_REDIRECT') 
          ? () => setModalConfig({ ...modalConfig, isOpen: false }) 
          : undefined
        }
        confirmText={
            modalConfig.type === 'CONFIRM_ATTEND' ? '변경' : 
            modalConfig.type === 'CONFIRM_PROXY_REDIRECT' ? '이동' : '확인'
        }
      />
    </div>
  );
};