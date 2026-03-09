import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut,
  Sparkles,
  ShieldCheck,
  Lock
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Import components
import { Dashboard } from './components/Dashboard';
import { Stats } from './components/Stats';
import { TeacherManagement } from './components/TeacherManagement';
import MemorandumPrint from './components/MemorandumPrint';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password === '1234') {
      onLogin();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'กรุณาลองใหม่อีกครั้ง',
        confirmButtonColor: '#059669'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-100 border border-emerald-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-32 h-32 text-emerald-600" />
          </div>
          
          <div className="relative z-10">
            <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-200">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Smart Substitution</h1>
            <p className="text-slate-400 font-medium mb-10">ระบบบริหารจัดการการสอนแทนอัจฉริยะ</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">รหัสผ่านเข้าใช้งาน</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-emerald-500 transition-all text-lg"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center mt-8 text-slate-400 text-sm font-medium">© 2024 Smart Substitution System v2.0</p>
      </motion.div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all ${
        active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden md:block">{label}</span>
    </button>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teachers, setTeachers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [duties, setDuties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [printData, setPrintData] = useState(null);
  const printRef = useRef(null);

  const fetchData = async () => {
    const [t, l, d, s] = await Promise.all([
      fetch('/api/teachers').then(r => r.json()),
      fetch('/api/leaves').then(r => r.json()),
      fetch('/api/duties').then(r => r.json()),
      fetch('/api/subjects').then(r => r.json())
    ]);
    setTeachers(t);
    setLeaves(l);
    setDuties(d);
    setSubjects(s);
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const handleDownloadPDF = (leave) => {
    const leaveDuties = duties.filter(d => d.leave_id === leave.leave_id);
    setPrintData({ leave, duties: leaveDuties });
    
    setTimeout(() => {
      const element = printRef.current;
      if (!element) return;
      
      const opt = {
        margin: 0,
        filename: `บันทึกข้อความ_สอนแทน_${leave.teacher_name}_${leave.leave_date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        setPrintData(null);
      });
    }, 500);
  };

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight hidden sm:block">Smart Substitution</span>
          </div>
          
          <div className="flex items-center gap-2">
            <TabButton 
              active={activeTab === 'dashboard'} 
              icon={LayoutDashboard} 
              label="หน้าแรก" 
              onClick={() => setActiveTab('dashboard')} 
            />
            <TabButton 
              active={activeTab === 'teachers'} 
              icon={Users} 
              label="จัดการครู" 
              onClick={() => setActiveTab('teachers')} 
            />
            <TabButton 
              active={activeTab === 'stats'} 
              icon={BarChart3} 
              label="สถิติ" 
              onClick={() => setActiveTab('stats')} 
            />
            <div className="w-px h-8 bg-slate-100 mx-2" />
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="p-3 text-slate-300 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <Dashboard 
              key="dashboard"
              leaves={leaves} 
              teachers={teachers} 
              duties={duties}
              onRefresh={fetchData}
              setPrintData={setPrintData}
              onDownloadPDF={handleDownloadPDF}
            />
          )}
          {activeTab === 'teachers' && (
            <TeacherManagement 
              key="teachers"
              teachers={teachers} 
              subjects={subjects}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'stats' && (
            <Stats 
              key="stats"
              leaves={leaves} 
              teachers={teachers} 
              duties={duties} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Hidden Print Area */}
      <div className="hidden">
        <div ref={printRef}>
          {printData && (
            <MemorandumPrint 
              leave={printData.leave} 
              duties={printData.duties} 
              teachers={teachers} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
