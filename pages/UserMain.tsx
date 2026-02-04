import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { AttendanceType, AttendanceRecord } from '../types';
import { Modal } from '../components/Modal';

export const UserMain: React.FC = () => {
  const navigate = useNavigate();
  const { settings, addRecord, records, setTempUser, tempUser } = useGlobal();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'SUCCESS' | 'CONFIRM_ATTEND' | 'CONFIRM_PROXY_REDIRECT' | 'ERROR';
  }>({ isOpen: false, title: '', message: '', type: 'SUCCESS' });

  useEffect(() => {
    if (tempUser) {
      setName(tempUser.name);
      setPhone(tempUser.phone);
    }
  }, [tempUser]);

  const validateInput = () => {
    const nameRegex = /^[a-zA-Z가-힣]+$/;
    const phoneRegex = /^[0-9]+$/;

    if (!name || !nameRegex.test(name)) {
      setModalConfig({
        isOpen: true,
        title: "입력 오류",
        message: settings.msgNameValidationError,
        type: 'ERROR'
      });
      return false;
    }
    if (!phone || !phoneRegex.test(phone)) {
       setModalConfig({
        isOpen: true,
        title: "입력 오류",
        message: settings.msgPhoneValidationError,
        type: 'ERROR'
      });
      return false;
    }
    if (!privacyAgreed) {
        setModalConfig({
            isOpen: true,
            title: "동의 필요",
            message: settings.msgPrivacyError,
            type: 'ERROR'
        });
        return false;
    }
    return true;
  };

  const checkExisting = (): AttendanceRecord | undefined => {
    return records.find(r => r.name === name && r.phone === phone);
  };

  const handleAttendClick = () => {
    if (!validateInput()) return;

    const existing = checkExisting();
    if (existing) {
       setModalConfig({
        isOpen: true,
        title: "중복 제출",
        message: settings.msgDuplicateAttendConfirm,
        type: 'CONFIRM_ATTEND'
      });
    } else {
      processAttend();
    }
  };

  const processAttend = () => {
    // If existing, reuse ID to update
    const existing = checkExisting();
    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : crypto.randomUUID(),
      name,
      phone,
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
    // For proxy, strictly validating name/phone and privacy first
    if (!validateInput()) return;

    const existing = checkExisting();
    if (existing) {
      const isAttend = existing.type === AttendanceType.ATTEND;
      const msg = isAttend 
        ? settings.msgDuplicateProxyConfirmFromAttend
        : settings.msgDuplicateProxyConfirmFromProxy;

      setModalConfig({
        isOpen: true,
        title: "중복 제출",
        message: msg,
        type: 'CONFIRM_PROXY_REDIRECT'
      });
    } else {
      setTempUser({ name, phone });
      navigate('/proxy');
    }
  };

  const handleModalConfirm = () => {
    if (modalConfig.type === 'CONFIRM_ATTEND') {
      processAttend();
    } else if (modalConfig.type === 'CONFIRM_PROXY_REDIRECT') {
      setTempUser({ name, phone });
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
            
            <div className={`mt-4 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${settings.noticeBoxBg} text-gray-700 border border-black/5`}>
              {settings.noticeText}
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
                  onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
                  placeholder="홍길동 (띄어쓰기 없이 입력)"
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">전화번호</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="숫자만 입력 (예: 01012345678)"
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                />
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
            <h3 className="font-bold text-gray-700">{settings.contactOrgName}</h3>
            <div className="text-sm text-gray-500 space-y-1 bg-white/50 p-4 rounded-lg inline-block">
              <p>전화: {settings.contactPhone} | FAX: {settings.contactFax}</p>
              <p>이메일: {settings.contactEmail}</p>
              <p className="text-gray-400 mt-2 text-xs">상담시간: {settings.contactHours}</p>
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