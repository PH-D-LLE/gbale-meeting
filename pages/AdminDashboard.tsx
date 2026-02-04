import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { downloadExcel } from '../utils/excel';
import { AppSettings, AttendanceType, AttendanceRecord, AdminUser } from '../types';
import * as Storage from '../services/storage';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { records, settings, updateSettings, refreshRecords, isLoading } = useGlobal();
  const [activeTab, setActiveTab] = useState<'DATA' | 'SETTINGS' | 'ADMINS'>('DATA');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  // Admin Management State
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [editAdminId, setEditAdminId] = useState<string | null>(null); // docId if editing
  const [adminForm, setAdminForm] = useState({ id: '', pw: '', name: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Load admins when tab changes to ADMINS
  useEffect(() => {
    if (activeTab === 'ADMINS') {
        fetchAdmins();
    }
  }, [activeTab]);

  const fetchAdmins = async () => {
      setAdminLoading(true);
      const list = await Storage.getAdmins();
      setAdminList(list);
      setAdminLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    alert('설정이 저장되었습니다.');
  };

  const handleChangeSetting = (key: keyof AppSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChangeSetting('bannerImageUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleOpenUserView = () => {
      const url = `${window.location.origin}${window.location.pathname}#/`;
      window.open(url, '_blank');
  };

  // --- Admin Management Functions ---
  const handleAdminSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminForm.id || !adminForm.pw || !adminForm.name) {
          alert("모든 필드를 입력해주세요.");
          return;
      }
      
      try {
          const newAdmin: AdminUser = {
              ...adminForm,
              docId: editAdminId || undefined
          };
          
          await Storage.saveAdmin(newAdmin);
          alert(editAdminId ? "관리자 정보가 수정되었습니다." : "새 관리자가 추가되었습니다.");
          
          // Reset form
          setAdminForm({ id: '', pw: '', name: '' });
          setEditAdminId(null);
          fetchAdmins();
      } catch (err) {
          console.error(err);
          alert("저장 중 오류가 발생했습니다.");
      }
  };

  const handleEditAdmin = (admin: AdminUser) => {
      setEditAdminId(admin.docId || null);
      setAdminForm({ id: admin.id, pw: admin.pw, name: admin.name });
  };

  const handleDeleteAdmin = async (docId?: string) => {
      if (!docId) return;
      if (!window.confirm("정말 이 관리자를 삭제하시겠습니까?")) return;
      
      try {
          await Storage.deleteAdmin(docId);
          fetchAdmins();
      } catch (err) {
          console.error(err);
          alert("삭제 중 오류가 발생했습니다.");
      }
  };
  
  const cancelEdit = () => {
      setEditAdminId(null);
      setAdminForm({ id: '', pw: '', name: '' });
  };

  if (isLoading && records.length === 0) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <nav className="bg-white shadow-sm z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">관리자 페이지</h1>
              <div className="ml-10 space-x-4">
                <button
                  onClick={() => setActiveTab('DATA')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'DATA' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  참석 현황
                </button>
                <button
                  onClick={() => setActiveTab('SETTINGS')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'SETTINGS' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  화면 설정 (CMS)
                </button>
                <button
                  onClick={() => setActiveTab('ADMINS')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ADMINS' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  관리자 관리
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={handleOpenUserView} className="text-sm text-blue-600 hover:underline font-semibold">사용자 화면 보기 ↗</button>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">로그아웃</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'DATA' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-gray-700">총 {records.length}명 제출</span>
              <div className="flex gap-2">
                  <button
                    onClick={() => refreshRecords()}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm font-bold shadow-sm"
                  >
                    새로고침
                  </button>
                  <button
                    onClick={() => downloadExcel(records)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm flex items-center gap-2 font-bold shadow-sm"
                  >
                    <span>엑셀 다운로드</span>
                  </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">동의</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.type === AttendanceType.ATTEND 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {record.type === AttendanceType.ATTEND ? '참석' : '위임장'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {record.agreedToTerms ? 'Y' : 'N'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.type === AttendanceType.PROXY && (
                           <div className="flex flex-col">
                               <span>수임인: {record.proxyReceiverName}</span>
                               {record.signature && (
                                   <span className="text-xs text-blue-500 cursor-pointer group relative font-semibold mt-1 inline-block">
                                       [서명확인]
                                       <img src={record.signature} alt="sig" className="absolute bottom-full left-0 w-48 bg-white border-2 border-gray-200 shadow-xl rounded hidden group-hover:block z-50 p-2"/>
                                   </span>
                               )}
                           </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                      <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500">데이터가 없습니다.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">사용자 화면 텍스트 및 스타일 수정</h2>
                <button 
                    onClick={handleSaveSettings}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-bold shadow-md transition-all active:scale-95"
                >
                    설정 저장하기
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Visuals */}
                <div className="border border-gray-200 p-5 rounded-xl bg-gray-50">
                    <h3 className="font-bold text-indigo-700 mb-4 border-b border-gray-200 pb-2 text-lg">상단 디자인</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">배너 이미지 (파일 첨부)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">배너 이미지 (URL 직접 입력)</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.bannerImageUrl} onChange={e => handleChangeSetting('bannerImageUrl', e.target.value)} placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">배너 높이 (px)</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.bannerHeight} onChange={e => handleChangeSetting('bannerHeight', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">배경 그라데이션 (Tailwind)</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded font-mono text-sm bg-white text-gray-900" value={localSettings.primaryColor} onChange={e => handleChangeSetting('primaryColor', e.target.value)} />
                            <div className={`mt-2 h-8 rounded w-full bg-gradient-to-r ${localSettings.primaryColor}`}></div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Text Info */}
                <div className="border border-gray-200 p-5 rounded-xl bg-gray-50">
                    <h3 className="font-bold text-indigo-700 mb-4 border-b border-gray-200 pb-2 text-lg">텍스트 정보</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">제목</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.title} onChange={e => handleChangeSetting('title', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">부제목</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.subtitle} onChange={e => handleChangeSetting('subtitle', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">일시</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.dateTime} onChange={e => handleChangeSetting('dateTime', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">장소</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.location} onChange={e => handleChangeSetting('location', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Section 3: Messages & Notice (EXPANDED) */}
                <div className="border border-gray-200 p-5 rounded-xl bg-gray-50 col-span-1 md:col-span-2">
                    <h3 className="font-bold text-indigo-700 mb-4 border-b border-gray-200 pb-2 text-lg">메시지 및 알림 설정</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Notice & Success */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-600 text-sm uppercase">기본 공지 및 완료 메시지</h4>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">공지 박스 텍스트</label>
                                <textarea className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.noticeText} onChange={e => handleChangeSetting('noticeText', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">참석 완료 팝업 메시지</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.attendSuccessMsg} onChange={e => handleChangeSetting('attendSuccessMsg', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">위임장 완료 팝업 메시지</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.proxySuccessMsg} onChange={e => handleChangeSetting('proxySuccessMsg', e.target.value)} />
                            </div>
                        </div>

                        {/* Validations & Errors */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-600 text-sm uppercase">오류 및 확인 메시지</h4>
                             <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">중복 확인 (참석)</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 text-sm" value={localSettings.msgDuplicateAttendConfirm} onChange={e => handleChangeSetting('msgDuplicateAttendConfirm', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">중복 확인 (참석 -> 위임)</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 text-sm" value={localSettings.msgDuplicateProxyConfirmFromAttend} onChange={e => handleChangeSetting('msgDuplicateProxyConfirmFromAttend', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">중복 확인 (위임 -> 위임)</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 text-sm" value={localSettings.msgDuplicateProxyConfirmFromProxy} onChange={e => handleChangeSetting('msgDuplicateProxyConfirmFromProxy', e.target.value)} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-700">이름 유효성 오류</label>
                                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 text-xs" value={localSettings.msgNameValidationError} onChange={e => handleChangeSetting('msgNameValidationError', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-700">전화번호 유효성 오류</label>
                                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 text-xs" value={localSettings.msgPhoneValidationError} onChange={e => handleChangeSetting('msgPhoneValidationError', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-700">개인정보 동의 오류</label>
                                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 text-xs" value={localSettings.msgPrivacyError} onChange={e => handleChangeSetting('msgPrivacyError', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-700">서명 미입력 오류</label>
                                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 text-xs" value={localSettings.msgSignatureError} onChange={e => handleChangeSetting('msgSignatureError', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Contact */}
                <div className="border border-gray-200 p-5 rounded-xl bg-gray-50 md:col-span-2">
                    <h3 className="font-bold text-indigo-700 mb-4 border-b border-gray-200 pb-2 text-lg">하단 문의 정보</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">기관명</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.contactOrgName} onChange={e => handleChangeSetting('contactOrgName', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">전화</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.contactPhone} onChange={e => handleChangeSetting('contactPhone', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-700">FAX</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.contactFax} onChange={e => handleChangeSetting('contactFax', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">이메일</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.contactEmail} onChange={e => handleChangeSetting('contactEmail', e.target.value)} />
                        </div>
                         <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">운영 시간</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" value={localSettings.contactHours} onChange={e => handleChangeSetting('contactHours', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'ADMINS' && (
             <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-900">관리자 계정 관리</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="md:col-span-2">
                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이디</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {adminList.map(admin => (
                                        <tr key={admin.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditAdmin(admin)} className="text-indigo-600 hover:text-indigo-900 mr-4">수정</button>
                                                <button onClick={() => handleDeleteAdmin(admin.docId)} className="text-red-600 hover:text-red-900">삭제</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {adminList.length === 0 && (
                                        <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">등록된 관리자가 없습니다. (기본값 admin/admin 사용중)</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4">{editAdminId ? '관리자 수정' : '새 관리자 추가'}</h3>
                            <form onSubmit={handleAdminSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">이름</label>
                                    <input 
                                        type="text" 
                                        value={adminForm.name} 
                                        onChange={e => setAdminForm({...adminForm, name: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                                        placeholder="관리자 이름"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">아이디</label>
                                    <input 
                                        type="text" 
                                        value={adminForm.id} 
                                        onChange={e => setAdminForm({...adminForm, id: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                                        placeholder="로그인 ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">비밀번호</label>
                                    <input 
                                        type="text" 
                                        value={adminForm.pw} 
                                        onChange={e => setAdminForm({...adminForm, pw: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                                        placeholder="비밀번호"
                                    />
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 text-sm"
                                    >
                                        {editAdminId ? '수정 저장' : '추가'}
                                    </button>
                                    {editAdminId && (
                                        <button 
                                            type="button" 
                                            onClick={cancelEdit}
                                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold hover:bg-gray-300 text-sm"
                                        >
                                            취소
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
             </div>
        )}
      </main>
    </div>
  );
};