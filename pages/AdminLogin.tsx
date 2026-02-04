import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Storage from '../services/storage';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Fast path for default admin to avoid DB latency
    if (id === 'admin' && pw === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
        return;
    }

    try {
        const admins = await Storage.getAdmins();
        let isAuthenticated = false;

        // Check against DB records
        const matchedAdmin = admins.find(admin => admin.id === id && admin.pw === pw);
        if (matchedAdmin) {
            isAuthenticated = true;
        }

        if (isAuthenticated) {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    } catch (err) {
        console.error(err);
        setError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">관리자 로그인</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="mt-4 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 underline">사용자 화면으로 돌아가기</button>
        </div>
      </div>
    </div>
  );
};