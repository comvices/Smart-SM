import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export function Stats({ leaves, teachers, duties }) {
  const totalLeaves = leaves.length;
  const totalAssigned = duties.length;
  
  const teacherStats = teachers.map(t => {
    const count = duties.filter(d => d.substitute_name === t.teacher_name).length;
    return { name: t.teacher_name, count };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  const max = Math.max(...teacherStats.map(s => s.count), 1);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">รายการลาทั้งหมด</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-800">{totalLeaves}</span>
            <span className="text-slate-400 font-bold">ครั้ง</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">จัดสอนแทนแล้ว</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-emerald-600">{totalAssigned}</span>
            <span className="text-slate-400 font-bold">คาบ</span>
          </div>
        </div>

        <div className="sm:col-span-2 bg-emerald-600 p-8 rounded-[2rem] shadow-xl shadow-emerald-100 text-white relative overflow-hidden">
          <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/10 rotate-12" />
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-2">สรุปภาพรวมระบบ</h4>
            <p className="text-emerald-100 font-medium mb-6">ระบบช่วยจัดครูสอนแทนอัตโนมัติ ช่วยลดภาระงานบริหารวิชาการ</p>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-black">100%</div>
                <div className="text-[10px] uppercase font-bold text-emerald-200">ความครอบคลุม</div>
              </div>
              <div>
                <div className="text-3xl font-black">Real-time</div>
                <div className="text-[10px] uppercase font-bold text-emerald-200">การประมวลผล</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <AlertCircle className="w-5 h-5 text-emerald-600" />
          <h4 className="font-black text-slate-800 uppercase tracking-tight">สถิติการสอนแทนสูงสุด</h4>
        </div>
        
        <div className="space-y-6">
          {teacherStats.length === 0 ? (
            <p className="text-center text-slate-400 py-10 font-bold">ยังไม่มีข้อมูลสถิติ</p>
          ) : (
            teacherStats.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-emerald-600">{s.count} คาบ</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / max) * 100}%` }}
                      className="bg-emerald-500 h-full"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
