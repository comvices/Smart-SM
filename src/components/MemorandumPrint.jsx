import React from 'react';

function formatThaiDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

export default function MemorandumPrint({ leave, duties, teachers }) {
  const sortedDuties = [...duties].sort((a, b) => a.period - b.period);
  const absentTeacher = teachers.find(t => t.teacher_id === leave.teacher_id);
  let teacherSchedule = [];
  try {
    teacherSchedule = JSON.parse(absentTeacher?.[leave.day_of_week] || '[]');
  } catch (e) {}
  
  return (
    <div className="p-12 text-black leading-relaxed bg-white" style={{ fontFamily: "'Sarabun', 'TH Sarabun New', sans-serif", width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      {/* Header with Garuda */}
      <div className="relative mb-6">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Phra_Krut_Pha.svg/512px-Phra_Krut_Pha.svg.png" 
          alt="Garuda" 
          className="w-20 h-20 absolute left-0 top-0"
          referrerPolicy="no-referrer"
        />
        <h2 className="text-3xl font-bold text-center pt-10">บันทึกข้อความ</h2>
      </div>
      
      <div className="space-y-2 mb-6 mt-12">
        <div className="flex items-baseline">
          <span className="font-bold text-lg mr-2">ส่วนราชการ</span>
          <span className="border-b border-dotted border-black flex-grow text-lg">โรงเรียนอนุบาลหัวหิน(บ้านหนองขอน) สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาประจวบคีรีขันธ์ เขต 2</span>
        </div>
        <div className="flex justify-between items-baseline">
          <div className="flex flex-grow items-baseline">
            <span className="font-bold text-lg mr-2">ที่</span>
            <span className="border-b border-dotted border-black flex-grow text-lg">อว ๐๐๐๐/................................................</span>
          </div>
          <div className="flex flex-grow ml-12 items-baseline">
            <span className="font-bold text-lg mr-2">วันที่</span>
            <span className="border-b border-dotted border-black flex-grow text-lg text-center">{formatThaiDate(leave.leave_date)}</span>
          </div>
        </div>
        <div className="flex items-baseline">
          <span className="font-bold text-lg mr-2">เรื่อง</span>
          <span className="border-b border-dotted border-black flex-grow text-lg">ขออนุมัติจัดครูสอนแทนกรณีครูลาหยุดราชการ</span>
        </div>
      </div>

      <div className="mb-6 text-lg">
        <span className="font-bold">เรียน</span> ผู้อำนวยการโรงเรียนอนุบาลหัวหิน(บ้านหนองขอน)
      </div>

      <div className="text-justify mb-6 indent-16 text-lg">
        ด้วยข้าพเจ้า <span className="font-bold">{leave.teacher_name}</span> ตำแหน่ง ครู มีความประสงค์ขอลาหยุดราชการเนื่องจาก 
        <span className="font-bold"> {leave.reason} </span> ในวันที่ <span className="font-bold">{formatThaiDate(leave.leave_date)}</span> 
        เพื่อให้การเรียนการสอนดำเนินไปด้วยความเรียบร้อย ข้าพเจ้าจึงขอเสนอรายชื่อผู้ปฏิบัติหน้าที่สอนแทน ดังนี้
      </div>

      <table className="w-full border-collapse border border-black mb-8 text-lg">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-black p-2 text-center w-20">คาบที่</th>
            <th className="border border-black p-2 text-center">วิชา/ชั้น</th>
            <th className="border border-black p-2 text-center">ครูผู้สอนแทน</th>
            <th className="border border-black p-2 text-center w-40">ลงชื่อ</th>
          </tr>
        </thead>
        <tbody>
          {sortedDuties.map((d, idx) => {
            const scheduleItem = teacherSchedule.find(s => s.p === d.period);
            return (
              <tr key={idx}>
                <td className="border border-black p-2 text-center">{d.period}</td>
                <td className="border border-black p-2 text-center">
                  {scheduleItem ? `${scheduleItem.s} (${scheduleItem.g})` : '-'}
                </td>
                <td className="border border-black p-2 text-center">{d.substitute_name}</td>
                <td className="border border-black p-2 text-center"></td>
              </tr>
            );
          })}
          {sortedDuties.length === 0 && (
            <tr>
              <td colSpan={4} className="border border-black p-6 text-center text-slate-400 italic">
                ไม่ได้ระบุรายชื่อผู้สอนแทนในระบบ
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="text-justify mb-12 indent-16 text-lg">
        จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ
      </div>

      <div className="flex justify-end mb-16">
        <div className="text-center w-80 text-lg">
          <p className="mb-10">ลงชื่อ...........................................................</p>
          <p>( {leave.teacher_name} )</p>
          <p>ตำแหน่ง ครู</p>
        </div>
      </div>

      <div className="border-t border-black pt-10">
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center text-lg">
            <p className="font-bold mb-6">ความเห็นของหัวหน้ากลุ่มสาระฯ/วิชาการ</p>
            <p className="mb-4 text-slate-300">...........................................................</p>
            <p className="mb-10 text-slate-300">...........................................................</p>
            <p>ลงชื่อ...........................................................</p>
            <p className="mt-2">(...........................................................)</p>
          </div>
          <div className="text-center text-lg">
            <p className="font-bold mb-6">คำสั่ง/ผลการพิจารณา</p>
            <p className="mb-6">( ) อนุมัติ      ( ) ไม่อนุมัติ</p>
            <p className="mb-10 text-slate-300">...........................................................</p>
            <p>ลงชื่อ...........................................................</p>
            <p className="mt-2">(...........................................................)</p>
            <p className="mt-2 text-sm">ผู้อำนวยการโรงเรียนอนุบาลหัวหิน(บ้านหนองขอน)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
