import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  ChefHat, 
  Stethoscope, 
  TrendingUp, 
  User, 
  AlertCircle,
  Footprints,
  ChevronRight,
  Info,
  Plus,
  X,
  Clock,
  Save,
  Settings,
  Trash2
} from 'lucide-react';

// --- CONSTANTS ---

const PHASES = {
  EARLY: { label: 'Early Phase', range: [0, 27], description: 'Diagnosis to ~28 weeks' },
  PEAK: { label: 'Peak Resistance', range: [28, 34], description: '~28 to ~34 weeks' },
  LATE: { label: 'Late Phase', range: [35, 42], description: '35 weeks onward' }
};

const getPhase = (week) => {
  if (week <= 27) return PHASES.EARLY;
  if (week <= 34) return PHASES.PEAK;
  return PHASES.LATE;
};

const getAsianBMIStatus = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 23) return 'Normal range';
  if (bmi < 25) return 'Overweight';
  return 'Obese';
};

// --- COMPONENTS ---

const ProfileModal = ({ isOpen, onClose, currentProfile, onSave }) => {
  const [formData, setFormData] = useState(currentProfile);

  useEffect(() => {
    if (isOpen) setFormData(currentProfile);
  }, [isOpen, currentProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const heightM = formData.height / 100;
    const calculatedBMI = (formData.weight / (heightM * heightM)).toFixed(1);
    onSave({ ...formData, bmi: calculatedBMI });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-800 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" /> Personal Profile
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl mt-4 hover:bg-slate-900 transition-colors">Save Profile</button>
        </div>
      </div>
    </div>
  );
};

const LogDataModal = ({ isOpen, onClose, onSave, week }) => {
  const [logType, setLogType] = useState('fasting');
  const [glucose, setGlucose] = useState('');
  const [mealName, setMealName] = useState('');
  const [walkMinutes, setWalkMinutes] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!glucose) return;
    onSave({
      id: Date.now(),
      type: logType,
      glucose: parseInt(glucose),
      meal: logType === 'post-meal' ? mealName : 'Fasting',
      walkMinutes: logType === 'post-meal' ? parseInt(walkMinutes) : 0,
      timestamp: new Date().toISOString(),
      week: week
    });
    setGlucose('');
    setMealName('');
    setWalkMinutes(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2"><Plus className="w-5 h-5" /> Log Reading</h2>
          <button onClick={onClose} className="p-1 hover:bg-teal-700 rounded-full"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-5 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button className={`flex-1 py-2 text-sm font-medium rounded-md ${logType === 'fasting' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`} onClick={() => setLogType('fasting')}>Fasting</button>
            <button className={`flex-1 py-2 text-sm font-medium rounded-md ${logType === 'post-meal' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`} onClick={() => setLogType('post-meal')}>Post-Meal</button>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Glucose Level (mg/dL)</label>
            <input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} className="w-full text-4xl font-bold border-b-2 border-gray-300 focus:border-teal-500 outline-none py-2" placeholder="0" autoFocus />
          </div>
          {logType === 'post-meal' && (
            <>
              <input type="text" placeholder="What did you eat?" value={mealName} onChange={(e) => setMealName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" />
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2"><span className="text-sm text-gray-600">Walk Duration</span><span className="font-bold text-teal-600">{walkMinutes}m</span></div>
                <input type="range" min="0" max="60" step="5" value={walkMinutes} onChange={(e) => setWalkMinutes(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
              </div>
            </>
          )}
          <button onClick={handleSubmit} className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"><Save className="w-5 h-5 inline mr-2" /> Save Entry</button>
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ week, phase }) => {
  let content = {
    EARLY: { title: "Habit Building", msg: "Focus on consistent walking after your heaviest meal.", icon: <TrendingUp className="text-emerald-500"/>, color: "bg-emerald-50" },
    PEAK: { title: "Resistance Alert", msg: "Hormones are peaking (Wk 28-34). Expect numbers to rise even if diet is the same.", icon: <Activity className="text-amber-600"/>, color: "bg-amber-50" },
    LATE: { title: "Home Stretch", msg: "Keep patterns steady. Monitor baby's kicks alongside sugar.", icon: <User className="text-purple-600"/>, color: "bg-purple-50" }
  };
  const active = week <= 27 ? content.EARLY : week <= 34 ? content.PEAK : content.LATE;

  return (
    <div className={`${active.color} p-6 rounded-xl border border-opacity-50 shadow-sm mb-6`}>
      <div className="flex items-start gap-4">
        <div className="bg-white p-2 rounded-full shadow-sm">{active.icon}</div>
        <div>
          <h3 className="font-bold text-gray-800">{active.title}</h3>
          <p className="text-gray-700 text-sm mt-1 leading-relaxed">{active.msg}</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [viewMode, setViewMode] = useState('patient');
  const [week, setWeek] = useState(24);
  const [logs, setLogs] = useState([]); // EMPTY START
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [patientProfile, setPatientProfile] = useState({
    name: 'User', age: 30, height: 160, weight: 60, bmi: 23.4, diagnosisWeek: 24, treatment: 'Diet & Exercise'
  });

  const phase = useMemo(() => getPhase(week), [week]);

  // CALCULATE REAL STATS
  const stats = useMemo(() => {
    const fastingLogs = logs.filter(l => l.type === 'fasting');
    const avgFasting = fastingLogs.length > 0 
      ? Math.round(fastingLogs.reduce((acc, curr) => acc + curr.glucose, 0) / fastingLogs.length) 
      : 0;
    
    return {
      avgFasting,
      totalToday: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length
    };
  }, [logs]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">Pregnancy Week</span>
            <span className="text-sm font-mono text-cyan-400">Week {week}</span>
          </div>
          <input type="range" min="20" max="40" value={week} onChange={(e) => setWeek(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
      </div>

      <div className="flex justify-center my-4">
        <div className="bg-white p-1 rounded-lg shadow-sm border flex">
          <button onClick={() => setViewMode('patient')} className={`px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'patient' ? 'bg-teal-500 text-white shadow' : 'text-gray-500'}`}>Daily Log</button>
          <button onClick={() => setViewMode('history')} className={`px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'history' ? 'bg-slate-700 text-white shadow' : 'text-gray-500'}`}>History</button>
        </div>
      </div>

      <div className="max-w-md mx-auto pb-24 px-4">
        {viewMode === 'patient' ? (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 -mx-4">
              <div className="flex justify-between items-start mb-6">
                <div><h1 className="text-2xl font-bold text-gray-800">Hello, {patientProfile.name}</h1><p className="text-sm text-gray-500">{week} Weeks Pregnant</p></div>
                <button onClick={() => setIsProfileModalOpen(true)} className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"><Settings className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                  <div className="text-[10px] text-orange-600 font-bold uppercase mb-1">Avg Fasting</div>
                  <div className="text-2xl font-bold text-gray-800">{stats.avgFasting || '--'}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                  <div className="text-[10px] text-purple-600 font-bold uppercase mb-1">Today's Logs</div>
                  <div className="text-2xl font-bold text-gray-800">{stats.totalToday}</div>
                </div>
              </div>
            </div>

            <InsightCard week={week} phase={phase} />

            <div className="mt-8">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Tools</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsLogModalOpen(true)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-teal-50 transition-colors">
                  <div className="bg-teal-100 p-3 rounded-full"><Plus className="w-6 h-6 text-teal-600" /></div>
                  <span className="text-sm font-bold text-gray-700">Add Log</span>
                </button>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                  <div className="bg-blue-100 p-3 rounded-full"><Activity className="w-6 h-6 text-blue-600" /></div>
                  <span className="text-sm font-bold text-gray-700">Track BMI</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Recent History</h2>
            {logs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400">No logs recorded yet.</p>
              </div>
            ) : (
              logs.slice().reverse().map(log => (
                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase">{log.type} • Week {log.week}</div>
                    <div className="font-bold text-gray-800">{log.meal}</div>
                    <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${log.glucose > 140 ? 'text-red-500' : 'text-teal-600'}`}>{log.glucose}</div>
                    <div className="text-[10px] text-gray-400">mg/dL</div>
                  </div>
                </div>
              ))
            )}
            {logs.length > 0 && (
              <button onClick={() => setLogs([])} className="w-full text-red-500 text-sm font-bold py-4 flex items-center justify-center gap-2 mt-8">
                <Trash2 className="w-4 h-4" /> Clear All Data
              </button>
            )}
          </div>
        )}
      </div>

      <LogDataModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSave={(log) => setLogs([...logs, log])}
        week={week}
      />
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={patientProfile}
        onSave={setPatientProfile}
      />
    </div>
  );
}