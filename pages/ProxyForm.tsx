import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { AttendanceType, AttendanceRecord } from '../types';
import { Modal } from '../components/Modal';
import { SignaturePad } from '../components/SignaturePad';

export const ProxyForm: React.FC = () => {
  const navigate = useNavigate();
  const { settings, addRecord, tempUser, setTempUser, records } = useGlobal();

  const [proxyType, setProxyType] = useState<'PRESIDENT' | 'OTHER'>('PRESIDENT');
  const [proxyName, setProxyName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!tempUser) {
      navigate('/');
    }
  }, [tempUser, navigate]);

  const handleCancel = () => {
    navigate('/');
  };

  const handleSubmit = async () => {
    if (!signature) {
      alert(settings.msgSignatureError);
      return;
    }
    if (proxyType === 'OTHER' && !proxyName.trim()) {
        alert(settings.msgProxyNameError);
        return;
    }

    if (tempUser) {
        setIsSubmitting(true);
        
        try {
            // Find existing record to update (Critical for preventing duplicates)
            // Using records from context which should be up to date
            const existingRecord = records.find(r => r.name === tempUser.name && r.phone === tempUser.phone);
            const recordId = existingRecord ? existingRecord.id : crypto.randomUUID();

            const newRecord: AttendanceRecord = {
                id: recordId,
                name: tempUser.name,
                phone: tempUser.phone,
                type: AttendanceType.PROXY,
                timestamp: new Date().toISOString(),
                proxyReceiver: proxyType,
                proxyReceiverName: proxyType === 'PRESIDENT' ? '협회장' : proxyName,
                signature: signature,
                agreedToTerms: true
            };

            await addRecord(newRecord);
            setModalOpen(true);
        } catch (error) {
            console.error("Error submitting proxy:", error);
            alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const onModalClose = () => {
      setModalOpen(false);
      setTempUser(null);
      navigate('/');
  }

  if (!tempUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="py-5 px-4 bg-white border-b border-gray-200 text-center shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-gray-900">위 임 장</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 md:p-6 space-y-6 pb-20">
        
        {/* User Info Card */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-gray-400 rounded-full"></span>위임인 정보
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <span className="font-semibold text-gray-700 col-span-1">이름</span>
              <span className="col-span-2 text-gray-900 font-medium">{tempUser.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-700 col-span-1">전화번호</span>
              <span className="col-span-2 text-gray-900 font-medium">{tempUser.phone}</span>
            </div>
          </div>
        </section>

        {/* Declaration */}
        <section className={`p-5 rounded-xl ${settings.noticeBoxBg} text-gray-800 text-sm leading-relaxed border border-black/5 shadow-inner`}>
            상기 본인은 아래와 같이 소집된 총회에 참석할 수 없어 총회 안건과 관련된 의결권을 위임합니다.
        </section>

        {/* Meeting Info */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-gray-400 rounded-full"></span>총회 정보
            </h2>
            <div className="border border-gray-200 rounded-lg text-sm overflow-hidden">
                <div className="grid grid-cols-4 border-b border-gray-200">
                    <div className="col-span-1 p-3 bg-gray-50 font-semibold border-r border-gray-200 flex items-center justify-center text-gray-600">일시</div>
                    <div className="col-span-3 p-3 text-gray-900">{settings.dateTime}</div>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-200">
                    <div className="col-span-1 p-3 bg-gray-50 font-semibold border-r border-gray-200 flex items-center justify-center text-gray-600">장소</div>
                    <div className="col-span-3 p-3 text-gray-900">{settings.location}</div>
                </div>
                <div className="grid grid-cols-4">
                    <div className="col-span-1 p-3 bg-gray-50 font-semibold border-r border-gray-200 flex items-center justify-center text-gray-600">안건</div>
                    <div className="col-span-3 p-3 text-xs text-gray-700 leading-relaxed bg-white">
                        1. 2025년 사업 및 결산 승인의 건<br/>
                        2. 2026년 사업계획(안) 및 예산(안) 승인의 건<br/>
                        3. 감사연임의 건<br/>
                        4. 정관개정의 건
                    </div>
                </div>
            </div>
        </section>

        {/* Proxy Receiver */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>위임받을 회원
             </h2>
             <div className="space-y-3">
                 <label className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${proxyType === 'PRESIDENT' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                     <input 
                        type="radio" 
                        name="proxyType" 
                        checked={proxyType === 'PRESIDENT'}
                        onChange={() => setProxyType('PRESIDENT')}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 bg-white border-gray-300"
                    />
                     <span className="text-gray-900 font-medium">{settings.contactOrgName} 회장에게 위임</span>
                 </label>
                 
                 <div className={`p-4 border rounded-xl transition-all ${proxyType === 'OTHER' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
                    <label className="flex items-center space-x-3 cursor-pointer mb-2">
                        <input 
                            type="radio" 
                            name="proxyType" 
                            checked={proxyType === 'OTHER'}
                            onChange={() => setProxyType('OTHER')}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 bg-white border-gray-300"
                        />
                        <span className="text-gray-900 font-medium">다른 회원에게 위임</span>
                    </label>
                    
                    {proxyType === 'OTHER' && (
                        <input
                            type="text"
                            value={proxyName}
                            onChange={(e) => setProxyName(e.target.value)}
                            placeholder="위임받을 회원의 이름을 입력하세요"
                            className="w-full mt-2 p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                        />
                    )}
                 </div>
             </div>
        </section>

        {/* Signature */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>위임인 서명
            </h2>
            <SignaturePad onEnd={setSignature} onClear={() => setSignature(null)} />
            <p className="text-xs text-gray-400 mt-2">* 회색 박스 안에 서명해주세요.</p>
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
            <button 
                onClick={handleCancel}
                className="flex-1 py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                disabled={isSubmitting}
            >
                취소
            </button>
            <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 py-4 px-4 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 ${settings.proxyButtonColor.replace('bg-blue-500', 'bg-blue-600')} ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isSubmitting ? '제출 중...' : '제출하기'}
            </button>
        </div>

      </main>

      <Modal 
        isOpen={modalOpen}
        title="제출 완료"
        message={settings.proxySuccessMsg}
        onConfirm={onModalClose}
      />
    </div>
  );
};