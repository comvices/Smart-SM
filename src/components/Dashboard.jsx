import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { motion } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit,
  Printer
} from 'lucide-react';

export function Dashboard({ leaves, teachers, duties, onRefresh, setPrintData, onPrint, onDownloadPDF }) {
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  const handleDeleteLeave = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบรายการลานี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
      onRefresh();
      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800">รายการจัดสอนแทน</h3>
          <p className="text-sm text-slate-400 font-medium">จัดการและมอบหมายภาระงานสอนแทนรายวัน</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>บันทึกรายการจัดสอนแทน</span>
        </button>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] py-20 text-center">
          <p className="text-slate-400 font-bold">ยังไม่มีรายการการลาในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leaves.map(lv => (
            <LeaveCard 
              key={lv.leave_id} 
              leave={lv} 
              teachers={teachers} 
              duties={duties}
              onEdit={() => setEditingLeave(lv)}
              onDelete={() => handleDeleteLeave(lv.leave_id)}
              onRefresh={onRefresh}
              onPrint={onPrint}
              onDownloadPDF={onDownloadPDF}
            />
          ))}
        </div>
      )}

      {showModal && (
        <LeaveModal 
          teachers={teachers} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            onRefresh();
          }}
        />
      )}

      {editingLeave && (
        <EditLeaveModal 
          leave={editingLeave}
          teachers={teachers}
          onClose={() => setEditingLeave(null)}
          onSuccess={() => {
            setEditingLeave(null);
            onRefresh();
          }}
        />
      )}
    </motion.div>
  );
}

function LeaveCard({ leave, teachers, duties, onEdit, onDelete, onRefresh, onPrint, onDownloadPDF }) {
  const absentTeacher = teachers.find(t => t.teacher_id === leave.teacher_id);
  let schedule = [];
  try {
    schedule = JSON.parse(absentTeacher?.[leave.day_of_week] || '[]');
  } catch (e) {}

  const handleAssign = async (period, subName) => {
    const existingDuty = duties.find(d => d.leave_id === leave.leave_id && d.period === period);
    const isCurrentlyAssigned = existingDuty?.substitute_name === subName;

    if (isCurrentlyAssigned) {
      const result = await Swal.fire({
        title: 'ยกเลิกการมอบหมาย',
        text: `คุณต้องการยกเลิกการสอนแทนของคุณครู ${subName} ในคาบที่ ${period} ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'ยืนยันการยกเลิก',
        cancelButtonText: 'ปิด'
      });

      if (result.isConfirmed) {
        await fetch('/api/duties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leave_id: leave.leave_id,
            period,
            substitute_name: null 
          })
        });
        onRefresh();
      }
      return;
    }

    const result = await Swal.fire({
      title: 'มอบหมายงาน',
      text: existingDuty 
        ? `เปลี่ยนผู้สอนแทนจากคุณครู ${existingDuty.substitute_name} เป็นคุณครู ${subName} ในคาบที่ ${period} ใช่หรือไม่?`
        : `มอบหมายให้คุณครู ${subName} สอนแทนในคาบที่ ${period} ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await fetch('/api/duties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duty_id: `D-${Date.now()}-${period}`,
          leave_id: leave.leave_id,
          substitute_name: subName,
          absent_name: leave.teacher_name,
          date: leave.leave_date,
          period
        })
      });
      onRefresh();
      Swal.fire({
        icon: 'success',
        title: 'มอบหมายสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all border-t-4 border-t-emerald-500">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg text-slate-800">{leave.teacher_name}</h4>
              <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{leave.reason}</span>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              {leave.leave_date} | {leave.day_of_week}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onDownloadPDF(leave)}
            title="ดาวน์โหลด PDF"
            className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button onClick={onEdit} title="แก้ไข" className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"><Edit className="w-5 h-5" /></button>
          <button onClick={onDelete} title="ลบ" className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="space-y-3">
        {schedule.map(item => {
          const assigned = duties.find(d => d.leave_id === leave.leave_id && d.period === item.p);
          const available = teachers
            .filter(t => t.teacher_id !== leave.teacher_id)
            .filter(t => {
              try {
                const s = JSON.parse(t[leave.day_of_week] || '[]');
                return !s.some((si) => si.p === item.p);
              } catch(e) { return true; }
            });

          return (
            <div key={item.p} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-emerald-600 uppercase">คาบที่ {item.p}: {item.s} ({item.g})</span>
                <span className="text-[10px] text-slate-400 font-bold">ว่าง {available.length} ท่าน</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {available.map(t => {
                  const isAssigned = assigned?.substitute_name === t.teacher_name;
                  return (
                    <button 
                      key={t.teacher_id}
                      onClick={() => handleAssign(item.p, t.teacher_name)}
                      className={`text-[10px] px-3 py-1.5 rounded-xl border-2 font-bold transition-all ${
                        isAssigned 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      {t.teacher_name} {isAssigned && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeaveModal({ teachers, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    teacher_id: teachers[0]?.teacher_id || '',
    leave_date: '',
    reason: 'ไปราชการ'
  });

  const handleSubmit = async () => {
    if (!formData.leave_date) {
      return Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาเลือกวันที่ลา',
        confirmButtonColor: '#059669'
      });
    }
    const date = new Date(formData.leave_date);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[date.getDay()];
    
    if (dayName === 'sunday' || dayName === 'saturday') {
      return Swal.fire({
        icon: 'info',
        title: 'เลือกวันไม่ถูกต้อง',
        text: 'กรุณาเลือกวันจันทร์-ศุกร์',
        confirmButtonColor: '#059669'
      });
    }

    const teacher = teachers.find(t => t.teacher_id === formData.teacher_id);
    await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leave_id: `LV-${Date.now()}`,
        teacher_id: formData.teacher_id,
        teacher_name: teacher?.teacher_name,
        leave_date: formData.leave_date,
        day_of_week: dayName,
        reason: formData.reason
      })
    });
    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-xl font-black text-slate-800 mb-6">บันทึกรายการลา</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ครูที่ลา</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
              value={formData.teacher_id}
              onChange={e => setFormData({...formData, teacher_id: e.target.value})}
            >
              {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.teacher_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่ลา</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
              value={formData.leave_date}
              onChange={e => setFormData({...formData, leave_date: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เหตุผล</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            >
              <option>ไปราชการ</option>
              <option>ลาป่วย</option>
              <option>ลากิจ</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 p-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition">ยกเลิก</button>
            <button onClick={handleSubmit} className="flex-1 bg-emerald-600 text-white p-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition">บันทึก</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EditLeaveModal({ leave, teachers, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    teacher_id: leave.teacher_id,
    leave_date: leave.leave_date,
    reason: leave.reason
  });

  const handleSubmit = async () => {
    if (!formData.leave_date) {
      return Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาเลือกวันที่ลา',
        confirmButtonColor: '#059669'
      });
    }
    const date = new Date(formData.leave_date);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[date.getDay()];
    
    if (dayName === 'sunday' || dayName === 'saturday') {
      return Swal.fire({
        icon: 'info',
        title: 'เลือกวันไม่ถูกต้อง',
        text: 'กรุณาเลือกวันจันทร์-ศุกร์',
        confirmButtonColor: '#059669'
      });
    }

    const teacher = teachers.find(t => t.teacher_id === formData.teacher_id);
    await fetch(`/api/leaves/${leave.leave_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacher_id: formData.teacher_id,
        teacher_name: teacher?.teacher_name,
        leave_date: formData.leave_date,
        day_of_week: dayName,
        reason: formData.reason
      })
    });
    Swal.fire({
      icon: 'success',
      title: 'แก้ไขสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-xl font-black text-slate-800 mb-6">แก้ไขรายการลา</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ครูที่ลา</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
              value={formData.teacher_id}
              onChange={e => setFormData({...formData, teacher_id: e.target.value})}
            >
              {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.teacher_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่ลา</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
              value={formData.leave_date}
              onChange={e => setFormData({...formData, leave_date: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เหตุผล</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            >
              <option>ไปราชการ</option>
              <option>ลาป่วย</option>
              <option>ลากิจ</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 p-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition">ยกเลิก</button>
            <button onClick={handleSubmit} className="flex-1 bg-emerald-600 text-white p-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition">บันทึกการแก้ไข</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
