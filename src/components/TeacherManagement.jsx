import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { motion } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit,
  Calendar,
  BookOpen,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function TeacherManagement({ teachers, subjects, onRefresh }) {
  const [view, setView] = useState('list');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setView('list')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${view === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            รายชื่อครู
          </button>
          <button 
            onClick={() => setView('add')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${view === 'add' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            เพิ่มครูใหม่
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <TeacherList teachers={teachers} onRefresh={onRefresh} />
      ) : (
        <AddTeacher subjects={subjects} onSuccess={() => { setView('list'); onRefresh(); }} />
      )}
    </div>
  );
}

function TeacherList({ teachers, onRefresh }) {
  const [editingTeacher, setEditingTeacher] = useState(null);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบข้อมูลครูท่านนี้ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {teachers.map(t => (
        <div key={t.teacher_id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingTeacher(t)} className="text-slate-300 hover:text-emerald-600 transition-colors">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(t.teacher_id)} className="text-slate-300 hover:text-red-600 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h4 className="font-bold text-slate-800 text-lg mb-4">{t.teacher_name}</h4>
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day, idx) => {
              let s = [];
              try { s = JSON.parse(t[day] || '[]'); } catch(e) {}
              if (s.length === 0) return null;
              return (
                <div key={day} className="flex gap-2 items-start">
                  <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-lg shrink-0 mt-0.5">
                    {['จ', 'อ', 'พ', 'พฤ', 'ศ'][idx]}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {s.map(x => (
                      <span key={x.p} className="bg-slate-50 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-100">
                        คาบ {x.p}: {x.s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {editingTeacher && (
        <EditTeacherModal 
          teacher={editingTeacher} 
          onClose={() => setEditingTeacher(null)} 
          onSuccess={() => {
            setEditingTeacher(null);
            onRefresh();
          }} 
        />
      )}
    </motion.div>
  );
}

function EditTeacherModal({ teacher, onClose, onSuccess }) {
  const [name, setName] = useState(teacher.teacher_name);
  const [schedule, setSchedule] = useState({
    monday: JSON.parse(teacher.monday || '[]'),
    tuesday: JSON.parse(teacher.tuesday || '[]'),
    wednesday: JSON.parse(teacher.wednesday || '[]'),
    thursday: JSON.parse(teacher.thursday || '[]'),
    friday: JSON.parse(teacher.friday || '[]'),
  });
  const [editing, setEditing] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(setSubjects);
  }, []);

  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayLabels = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];

  const handleSave = async () => {
    if (!name) return alert('กรุณาระบุชื่อ');
    const payload = {
      teacher_name: name,
      monday: JSON.stringify(schedule.monday || []),
      tuesday: JSON.stringify(schedule.tuesday || []),
      wednesday: JSON.stringify(schedule.wednesday || []),
      thursday: JSON.stringify(schedule.thursday || []),
      friday: JSON.stringify(schedule.friday || [])
    };
    await fetch(`/api/teachers/${teacher.teacher_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    Swal.fire({
      icon: 'success',
      title: 'แก้ไขข้อมูลสำเร็จ',
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
        className="bg-white rounded-[2rem] p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-black text-slate-800 mb-6">แก้ไขข้อมูลคุณครู</h3>
        <div className="space-y-8">
          <div className="max-w-md mx-auto">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">ข้อมูลบุคลากร</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ชื่อ-นามสกุลคุณครู"
              className="w-full border-2 border-slate-100 rounded-2xl p-5 focus:border-emerald-500 bg-slate-50 outline-none shadow-inner text-lg text-center"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-emerald-600 pl-4">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h4 className="font-black text-slate-800 uppercase tracking-tight">ตารางสอน</h4>
            </div>

            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="grid grid-cols-5 min-w-[800px] gap-3">
                {dayLabels.map(d => <div key={d} className="text-center font-black text-emerald-400 text-xs uppercase tracking-widest py-2">{d}</div>)}
                {Array.from({ length: 8 }).map((_, pIdx) => {
                  const p = pIdx + 1;
                  return dayKeys.map(day => {
                    const item = schedule[day]?.find(s => s.p === p);
                    return (
                      <div 
                        key={`${day}-${p}`}
                        onClick={() => setEditing({ day, p })}
                        className={`h-24 border-2 rounded-2xl p-3 flex flex-col justify-center items-center cursor-pointer transition-all ${
                          item ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-300'
                        }`}
                      >
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-1">คาบ {p}</span>
                        {item ? (
                          <>
                            <div className="text-[10px] font-bold text-emerald-600 text-center leading-tight">{item.s}</div>
                            <div className="text-[9px] text-slate-400 font-medium">{item.g}</div>
                          </>
                        ) : (
                          <Plus className="w-4 h-4 text-slate-200" />
                        )}
                      </div>
                    );
                  });
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-12 py-4 rounded-[2rem] font-bold text-slate-400 hover:bg-slate-50 transition">ยกเลิก</button>
            <button onClick={handleSave} className="bg-emerald-600 text-white px-16 py-4 rounded-[2rem] font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition active:scale-95">บันทึกการแก้ไข</button>
          </div>
        </div>

        {editing && (
          <ScheduleModal 
            day={editing.day} 
            period={editing.p} 
            subjects={subjects}
            onClose={() => setEditing(null)}
            onSave={(data) => {
              const current = schedule[editing.day] || [];
              const filtered = current.filter(s => s.p !== editing.p);
              if (data) {
                setSchedule({ ...schedule, [editing.day]: [...filtered, data] });
              } else {
                setSchedule({ ...schedule, [editing.day]: filtered });
              }
              setEditing(null);
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

function AddTeacher({ subjects, onSuccess }) {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState({});
  const [editing, setEditing] = useState(null);

  const [days, setDays] = useState([
    { id: 'monday', label: 'จันทร์' },
    { id: 'tuesday', label: 'อังคาร' },
    { id: 'wednesday', label: 'พุธ' },
    { id: 'thursday', label: 'พฤหัสบดี' },
    { id: 'friday', label: 'ศุกร์' }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDays((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!name) {
      return Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาระบุชื่อคุณครู',
        confirmButtonColor: '#059669'
      });
    }
    const payload = {
      teacher_id: `ID-${Date.now()}`,
      teacher_name: name,
      monday: JSON.stringify(schedule.monday || []),
      tuesday: JSON.stringify(schedule.tuesday || []),
      wednesday: JSON.stringify(schedule.wednesday || []),
      thursday: JSON.stringify(schedule.thursday || []),
      friday: JSON.stringify(schedule.friday || [])
    };
    await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    Swal.fire({
      icon: 'success',
      title: 'บันทึกข้อมูลสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    });
    onSuccess();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <div className="max-w-md mx-auto">
        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">ข้อมูลบุคลากร</label>
        <input 
          type="text" 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ชื่อ-นามสกุลคุณครู"
          className="w-full border-2 border-slate-100 rounded-2xl p-5 focus:border-emerald-500 bg-slate-50 outline-none shadow-inner text-lg text-center"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-emerald-600 pl-4">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h4 className="font-black text-slate-800 uppercase tracking-tight">กำหนดตารางสอน</h4>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[800px]">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={days.map(d => d.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-3">
                  {days.map((day) => (
                    <SortableDay 
                      key={day.id} 
                      day={day} 
                      schedule={schedule[day.id] || []}
                      onEdit={(p) => setEditing({ day: day.id, p })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleSave}
          className="bg-emerald-600 text-white px-16 py-4 rounded-[2rem] font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition active:scale-95"
        >
          บันทึกข้อมูลครู
        </button>
      </div>

      {editing && (
        <ScheduleModal 
          day={editing.day} 
          period={editing.p} 
          subjects={subjects}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            const current = schedule[editing.day] || [];
            const filtered = current.filter(s => s.p !== editing.p);
            if (data) {
              setSchedule({ ...schedule, [editing.day]: [...filtered, data] });
            } else {
              setSchedule({ ...schedule, [editing.day]: filtered });
            }
            setEditing(null);
          }}
        />
      )}
    </motion.div>
  );
}

function SortableDay({ day, schedule, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex-1 flex flex-col gap-3 ${isDragging ? 'opacity-50' : ''}`}>
      <div 
        {...attributes} 
        {...listeners}
        className="bg-emerald-50 rounded-2xl p-3 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-emerald-100 transition-colors"
      >
        <span className="font-black text-emerald-600 text-xs uppercase tracking-widest">{day.label}</span>
        <GripVertical className="w-4 h-4 text-emerald-300" />
      </div>
      
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, pIdx) => {
          const p = pIdx + 1;
          const item = schedule.find(s => s.p === p);
          return (
            <div 
              key={p}
              onClick={() => onEdit(p)}
              className={`h-24 border-2 rounded-2xl p-3 flex flex-col justify-center items-center cursor-pointer transition-all ${
                item ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-300'
              }`}
            >
              <span className="text-[9px] font-black text-slate-300 uppercase mb-1">คาบ {p}</span>
              {item ? (
                <>
                  <div className="text-[10px] font-bold text-emerald-600 text-center leading-tight">{item.s}</div>
                  <div className="text-[9px] text-slate-400 font-medium">{item.g}</div>
                </>
              ) : (
                <Plus className="w-4 h-4 text-slate-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleModal({ day, period, subjects, onClose, onSave }) {
  const [s, setS] = useState(subjects[0]);
  const [l, setL] = useState('ป.1');
  const [r, setR] = useState('1');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
      >
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span>คาบที่ {period}</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วิชา</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
              value={s}
              onChange={e => setS(e.target.value)}
            >
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชั้น</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
                value={l}
                onChange={e => setL(e.target.value)}
              >
                {[1,2,3,4,5,6].map(v => <option key={v} value={`ป.${v}`}>ป.{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ห้อง</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500"
                value={r}
                onChange={e => setR(e.target.value)}
              >
                {[1,2,3,4,5,6,7,8].map(v => <option key={v} value={v}>ห้อง {v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => onSave(null)} className="flex-1 p-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 transition">ลบคาบ</button>
            <button onClick={() => onSave({ p: period, s, g: `${l}/${r}` })} className="flex-1 bg-emerald-600 text-white p-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition">บันทึก</button>
          </div>
          <button onClick={onClose} className="w-full p-2 text-slate-300 text-xs font-bold hover:text-slate-500 transition">ปิดหน้าต่าง</button>
        </div>
      </motion.div>
    </div>
  );
}
