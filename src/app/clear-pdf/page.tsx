"use client";

import { useState } from 'react';

export default function ClearPDFPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClear = async () => {
    if (!confirm('确定要清空所有PDF数据吗？')) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/clear-pdf', { method: 'DELETE' });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setMessage('✅ 所有PDF数据已清空！数据库和本地缓存都已清理。');
    } catch (error) {
      setMessage('❌ 清空失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">清空PDF数据</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          一键清空所有已上传的PDF教材和章节数据
        </p>
        <button
          onClick={handleClear}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? '清空中...' : '🗑️ 清空所有PDF数据'}
        </button>
        {message && (
          <p className={`mt-4 p-3 rounded-lg text-center ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
