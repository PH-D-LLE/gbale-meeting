import { AttendanceRecord } from '../types';

export const downloadExcel = (records: AttendanceRecord[]) => {
  // Simple CSV export to avoid heavy dependencies
  // BOM for Excel Korean support
  const BOM = '\uFEFF'; 
  
  let csvContent = BOM + "ID,이름,전화번호,구분,제출시간,위임받는자,서명여부\n";

  records.forEach(r => {
    const typeStr = r.type === 'ATTEND' ? '참석' : '위임장';
    const timeStr = new Date(r.timestamp).toLocaleString('ko-KR');
    const proxyRec = r.proxyReceiverName || '-';
    const signed = r.signature ? 'Y' : 'N';
    
    // Escape commas
    const row = [
      r.id,
      r.name,
      r.phone,
      typeStr,
      timeStr,
      proxyRec,
      signed
    ].map(item => `"${String(item).replace(/"/g, '""')}"`).join(",");
    
    csvContent += row + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `attendance_list_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};