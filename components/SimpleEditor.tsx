import React, { useRef, useEffect } from 'react';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange, height = "h-32", placeholder }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
       // Only update if content is significantly different to avoid cursor jumping
       // Simple check: if empty and value is present
       if (!contentRef.current.innerHTML && value) {
           contentRef.current.innerHTML = value;
       } else if (value !== contentRef.current.innerHTML) {
           // For external updates (like initial load or reset)
           // Warning: This might reset cursor if typing fast, but in this app settings update is explicit save.
           contentRef.current.innerHTML = value;
       }
    }
  }, [value]);

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    handleInput(); // Trigger update
    if (contentRef.current) contentRef.current.focus();
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200 items-center">
        <select onChange={(e) => exec('fontSize', e.target.value)} className="p-1 border rounded text-xs bg-white cursor-pointer" title="글자 크기">
          <option value="3">크기(보통)</option>
          <option value="1">아주 작게</option>
          <option value="2">작게</option>
          <option value="4">크게</option>
          <option value="5">더 크게</option>
          <option value="6">아주 크게</option>
          <option value="7">최대</option>
        </select>
        
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        
        <button type="button" onClick={() => exec('bold')} className="p-1 w-6 hover:bg-gray-200 rounded font-bold text-xs" title="굵게">B</button>
        <button type="button" onClick={() => exec('italic')} className="p-1 w-6 hover:bg-gray-200 rounded italic text-serif text-xs" title="기울임">I</button>
        <button type="button" onClick={() => exec('underline')} className="p-1 w-6 hover:bg-gray-200 rounded underline text-xs" title="밑줄">U</button>
        <button type="button" onClick={() => exec('strikeThrough')} className="p-1 w-6 hover:bg-gray-200 rounded line-through text-xs" title="취소선">S</button>
        
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        
        <div className="flex items-center gap-1 bg-white border rounded px-1" title="글자 색상">
            <span className="text-xs text-gray-500">글자</span>
            <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="w-6 h-6 p-0 border-0 cursor-pointer" />
        </div>
        <div className="flex items-center gap-1 bg-white border rounded px-1" title="배경 색상">
            <span className="text-xs text-gray-500">배경</span>
            <input type="color" onChange={(e) => exec('hiliteColor', e.target.value)} className="w-6 h-6 p-0 border-0 cursor-pointer" defaultValue="#ffffff"/>
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        <button type="button" onClick={() => exec('justifyLeft')} className="p-1 w-6 hover:bg-gray-200 rounded text-xs" title="왼쪽 정렬">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mx-auto"><path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/></svg>
        </button>
        <button type="button" onClick={() => exec('justifyCenter')} className="p-1 w-6 hover:bg-gray-200 rounded text-xs" title="가운데 정렬">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mx-auto"><path d="M3 4h18v2H3V4zm4 7h10v2H7v-2zm-4 7h18v2H3v-2z"/></svg>
        </button>
        <button type="button" onClick={() => exec('justifyRight')} className="p-1 w-6 hover:bg-gray-200 rounded text-xs" title="오른쪽 정렬">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mx-auto"><path d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z"/></svg>
        </button>
      </div>
      
      {/* Content */}
      <div
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        className={`w-full p-3 outline-none overflow-auto ${height} text-sm prose max-w-none`}
        style={{ minHeight: '80px' }}
        data-placeholder={placeholder}
      />
    </div>
  );
};