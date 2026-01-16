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
  Settings
} from 'lucide-react';

// --- CONSTANTS & LOGIC ---

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

// Asian BMI Classification (WPRO standards)
const getAsianBMIStatus = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 23) return 'Normal range';
  if (bmi < 25) return 'Overweight';
  return 'Obese';
};

// --- MOCK DATA GENERATOR ---
const generateMockData = (currentWeek) => {
  const baseGlucose = currentWeek > 28 ? 105 : 95; 
  const resistanceFactor = currentWeek > 30 ? 1.2 : 1.0;
  
  return {
    fasting: {
      average: currentWeek > 28 ? 98 : 88,
      status: currentWeek > 28 ? 'rising' : 'stable',
      inRangePct: currentWeek > 30 ? 75 : 92
    },
    postMeal: {
      average: Math.floor(baseGlucose * 1.1),
      status: currentWeek > 30 ? 'variable' : 'stable',
      inRangePct: currentWeek > 32 ? 68 : 85
    },
    walkingStats: {
      withWalking: Math.floor(110 * resistanceFactor),
      withoutWalking: Math.floor(140 * resistanceFactor),
      avgDuration: 15
    },
    foods: [
      { name: 'White Rice (1 cup)', status: currentWeek > 28 ? 'Monitor' : 'Stable', impact: currentWeek > 28 ? 'High' : 'Moderate' },
      { name: 'Adobo w/ Brown Rice', status: 'Stable', impact: 'Low' },
      { name: 'Pandesal (2 pcs)', status: currentWeek > 32 ? 'Avoid' : 'Monitor', impact: 'High' }
    ]
  };
};

// --- COMPONENTS ---

// NEW: PROFILE SETTINGS MODAL
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
    // Calculate BMI: weight (kg) / (height (m) ^ 2)
    const heightM = formData.height / 100;
    const calculatedBMI = (formData.weight / (heightM * heightM)).toFixed(1);
    
    onSave({ 
      ...formData, 
      bmi: calculatedBMI 
    });
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
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (cm)</label>
              <input 
                type="number" 
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
              <input 
                type="number" 
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex justify-between items-center text-sm">
               <span className="text-gray-600">Calculated BMI:</span>
               <span className="font-bold text-slate-800">
                 {(formData.weight / ((formData.height/100) ** 2)).toFixed(1)}
               </span>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Diagnosis Week</label>
             <input 
                type="number" 
                name="diagnosisWeek"
                value={formData.diagnosisWeek}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Treatment Type</label>
             <select 
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
             >
               <option value="Diet & Exercise">Diet & Exercise</option>
               <option value="Metformin">Metformin</option>
               <option value="Insulin">Insulin</option>
               <option value="Insulin + Metformin">Insulin + Metformin</option>
             </select>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl mt-4 hover:bg-slate-900 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// LOGGING MODAL COMPONENT
const LogDataModal = ({ isOpen, onClose, week }) => {
  const [logType, setLogType] = useState('fasting'); // fasting or post-meal
  const [glucose, setGlucose] = useState('');
  const [walkMinutes, setWalkMinutes] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" /> Log Reading
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-teal-700 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Time Context */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${logType === 'fasting' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
              onClick={() => setLogType('fasting')}
            >
              Fasting
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${logType === 'post-meal' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
              onClick={() => setLogType('post-meal')}
            >
              After Meal
            </button>
          </div>

          {/* Glucose Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Glucose Level (mg/dL)
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="0" 
                className="w-full text-4xl font-bold text-gray-800 border-b-2 border-gray-300 focus:border-teal-500 focus:outline-none py-2 px-1 placeholder-gray-200"
                autoFocus
              />
              <span className="absolute right-0 bottom-3 text-gray-400 text-sm font-medium">mg/dL</span>
            </div>
          </div>

          {/* Meal Details (Only if Post-Meal) */}
          {logType === 'post-meal' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  What did you eat?
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Sinigang and 1/2 cup rice"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Did you walk after eating?
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm flex items-center gap-2">
                      <Footprints className="w-4 h-4" /> Duration
                    </span>
                    <span className="font-bold text-teal-600">{walkMinutes} mins</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="60" 
                    step="5"
                    value={walkMinutes}
                    onChange={(e) => setWalkMinutes(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>None</span>
                    <span>30m</span>
                    <span>1h</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Note based on Week */}
          <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 flex gap-2 items-start">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Week {week} Note: We are currently tracking how walking affects your numbers during this phase.
            </p>
          </div>

          {/* Save Button */}
          <button 
            onClick={onClose}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Save Entry
          </button>

        </div>
      </div>
    </div>
  );
};

// 1. INSIGHT ENGINE COMPONENT
const InsightCard = ({ week, phase, data }) => {
  let title = "";
  let message = "";
  let icon = <Info className="w-6 h-6 text-blue-500" />;
  let bgColor = "bg-blue-50";

  if (phase === PHASES.EARLY) {
    title = "Building Healthy Habits";
    message = "Your body is responding well to walking. Small changes in your diet now will set a strong foundation for the coming weeks.";
    icon = <TrendingUp className="w-6 h-6 text-emerald-500" />;
    bgColor = "bg-emerald-50";
  } else if (phase === PHASES.PEAK) {
    title = "Peak Resistance Phase";
    message = "At this stage (28-34 weeks), insulin resistance naturally increases due to placental hormones. Your trend is being closely monitored. Fluctuations are expected.";
    icon = <Activity className="w-6 h-6 text-amber-600" />;
    bgColor = "bg-amber-50";
  } else {
    title = "Late Pregnancy Phase";
    message = "You are in the home stretch. Previously stable foods may need closer monitoring now. We focus on keeping you steady until delivery.";
    icon = <User className="w-6 h-6 text-purple-600" />;
    bgColor = "bg-purple-50";
  }

  return (
    <div className={`${bgColor} p-6 rounded-xl border border-opacity-50 shadow-sm mb-6`}>
      <div className="flex items-start gap-4">
        <div className="mt-1 bg-white p-2 rounded-full shadow-sm">{icon}</div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <p className="text-gray-700 mt-1 leading-relaxed">{message}</p>
          <div className="mt-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Current Focus: {phase === PHASES.PEAK ? 'Management & Adaptation' : 'Consistency'}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. WALKING IMPACT COMPONENT
const WalkingImpactCard = ({ week, data }) => {
  const reduction = data.walkingStats.withoutWalking - data.walkingStats.withWalking;
  
  let analysisText = "";
  if (week < 28) {
    analysisText = `Walking is highly effective right now, dropping your sugar by ~${reduction} points per session.`;
  } else if (week < 35) {
    analysisText = `Walking continues to help, though its effect naturally changes later in pregnancy. It currently lowers levels by ~${reduction} points.`;
  } else {
    analysisText = `Walking remains a key tool for stability, helping moderate post-meal spikes by ~${reduction} points.`;
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Footprints className="w-5 h-5 text-teal-600" />
        <h3 className="font-bold text-gray-800">Activity Impact</h3>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">Avg Without Walk</p>
          <p className="text-xl font-bold text-red-500">{data.walkingStats.withoutWalking}</p>
        </div>
        <div className="h-px w-8 bg-gray-300"></div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Avg With Walk</p>
          <p className="text-xl font-bold text-emerald-600">{data.walkingStats.withWalking}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 italic border-l-2 border-teal-500 pl-3">
        "{analysisText}"
      </p>
    </div>
  );
};

// 3. OB SUMMARY VIEW
const OBSummaryView = ({ week, phase, data, patient }) => {
  return (
    <div className="bg-slate-50 min-h-screen p-4 pb-20">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-none md:rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Stethoscope className="w-5 h-5" /> Clinical Summary
          </h2>
          <span className="text-xs bg-slate-600 px-2 py-1 rounded">OB Mode</span>
        </div>

        <div className="p-5 space-y-6">
          
          {/* 1. Maternal Snapshot */}
          <section className="border-b border-gray-100 pb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Maternal Snapshot</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{patient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Age</span>
                <span className="font-medium">{patient.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gestational Age</span>
                <span className="font-bold text-blue-700">{week} Weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pre-Preg BMI</span>
                <span className="font-medium">{patient.bmi} ({getAsianBMIStatus(patient.bmi)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Diagnosis</span>
                <span className="font-medium">Week {patient.diagnosisWeek}</span>
              </div>
              <div className="col-span-2 mt-1 bg-slate-100 p-2 rounded flex justify-between items-center">
                <span className="text-gray-600">Current Rx</span>
                <span className="font-bold text-slate-800">{patient.treatment}</span>
              </div>
            </div>
          </section>

          {/* 2. Glucose Control Overview */}
          <section className="border-b border-gray-100 pb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Control Overview</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded">
                <div className="text-xl font-bold text-slate-800">{data.fasting.inRangePct}%</div>
                <div className="text-[10px] text-slate-500 uppercase">In Range</div>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <div className="text-sm font-semibold text-slate-800 mt-1">{data.fasting.status}</div>
                <div className="text-[10px] text-slate-500 uppercase">Fasting Trend</div>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <div className="text-sm font-semibold text-slate-800 mt-1">{data.postMeal.status}</div>
                <div className="text-[10px] text-slate-500 uppercase">Post-Meal</div>
              </div>
            </div>
          </section>

          {/* 3. Stage-Aware Note */}
          <section className="bg-blue-50 border-l-4 border-blue-500 p-3">
            <p className="text-sm text-blue-900">
              <strong>Clinical Context:</strong> Currently at {week} weeks gestation, 
              {phase === PHASES.PEAK 
                ? ' when insulin resistance typically peaks. Higher insulin demands expected.' 
                : ' monitoring for late-stage stability.'}
            </p>
          </section>

          {/* 4. Food Response Summary */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Food Response Patterns</h3>
            <div className="space-y-2">
              {data.foods.map((food, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-1 last:border-0">
                  <span className="text-gray-700">{food.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    food.status === 'Stable' ? 'bg-green-100 text-green-700' :
                    food.status === 'Monitor' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {food.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              * "Previously stable foods may need closer monitoring at this stage."
            </p>
          </section>

          {/* 5. Walking Impact */}
          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Activity Efficacy</h3>
             <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-800">
                   <span className="block font-bold">Lifestyle efficacy:</span>
                   Walking {data.walkingStats.avgDuration} min lowers post-meal BG by ~{data.walkingStats.withoutWalking - data.walkingStats.withWalking} mg/dL.
                </div>
             </div>
          </section>

          {/* 6. Clinical Flag */}
          {(data.fasting.status === 'rising' || data.postMeal.inRangePct < 70) && (
             <section className="bg-red-50 p-3 rounded border border-red-100 mt-4">
                <h4 className="text-sm font-bold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Clinical Flag
                </h4>
                <p className="text-xs text-red-700 mt-1">
                  Patterns suggest lifestyle measures may be reaching limits at this gestational stage. Consider review of pharmacologic support.
                </p>
             </section>
          )}

        </div>
      </div>
    </div>
  );
};

// 4. MAIN APP CONTAINER
export default function App() {
  const [viewMode, setViewMode] = useState('patient'); // 'patient' or 'ob'
  const [week, setWeek] = useState(24);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // STATEFUL PATIENT PROFILE
  const [patientProfile, setPatientProfile] = useState({
    name: 'Maria',
    age: 32,
    height: 160, // cm
    weight: 62, // kg
    bmi: 24.1, 
    diagnosisWeek: 24,
    treatment: 'Diet & Exercise'
  });

  const phase = useMemo(() => getPhase(week), [week]);
  const currentData = useMemo(() => generateMockData(week), [week]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* SIMULATION CONTROLS (For Demo Purposes) */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Simulation Control</span>
            <span className="text-sm font-mono text-cyan-400">Week: {week} ({phase.label})</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="38" 
            value={week} 
            onChange={(e) => setWeek(parseInt(e.target.value))} 
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>20w</span>
            <span>28w (Peak Start)</span>
            <span>38w</span>
          </div>
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex justify-center my-4">
        <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
          <button 
            onClick={() => setViewMode('patient')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'patient' ? 'bg-teal-500 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Patient View
          </button>
          <button 
            onClick={() => setViewMode('ob')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'ob' ? 'bg-slate-700 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            OB Summary
          </button>
        </div>
      </div>

      {/* RENDER VIEW */}
      {viewMode === 'ob' ? (
        <OBSummaryView 
          week={week} 
          phase={phase} 
          data={currentData} 
          patient={patientProfile} 
        />
      ) : (
        <div className="max-w-md mx-auto pb-20 relative min-h-[80vh]">
          
          {/* Patient Header */}
          <div className="bg-white p-6 rounded-b-3xl shadow-sm mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hello, {patientProfile.name}</h1>
                <p className="text-sm text-gray-500">{week} Weeks Pregnant</p>
              </div>
              <div className="flex gap-2">
                <button 
                   onClick={() => setIsProfileModalOpen(true)}
                   className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                  {patientProfile.name.charAt(0)}
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-3 rounded-xl">
                <div className="text-xs text-orange-600 font-bold uppercase">Avg Fasting</div>
                <div className="text-2xl font-bold text-gray-800 mt-1">{currentData.fasting.average}</div>
                <div className="text-xs text-gray-500">mg/dL</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                 <div className="text-xs text-purple-600 font-bold uppercase">Today's Meals</div>
                 <div className="text-2xl font-bold text-gray-800 mt-1">4</div>
                 <div className="text-xs text-gray-500">Recorded</div>
              </div>
            </div>
          </div>

          <div className="px-4">
            
            {/* THE CORE LOGIC: Dynamic Insight */}
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Your Body This Week</h2>
            <InsightCard week={week} phase={phase} data={currentData} />

            {/* Walking Analysis */}
            <WalkingImpactCard week={week} data={currentData} />

            {/* Evolving Food List */}
            <div className="mt-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Food Insights</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {currentData.foods.map((item, i) => (
                  <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <ChefHat className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.impact} Impact</p>
                      </div>
                    </div>
                    {/* Dynamic Label changing based on week */}
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      item.status === 'Stable' ? 'bg-green-100 text-green-700' :
                      item.status === 'Monitor' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                Note: Food responses change as pregnancy advances.
              </p>
            </div>
          </div>

          {/* FLOATING LOG BUTTON */}
          <div className="fixed bottom-6 right-6 sm:absolute sm:bottom-6 sm:right-4">
            <button 
              onClick={() => setIsLogModalOpen(true)}
              className="bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 hover:scale-105 transition-all focus:ring-4 focus:ring-teal-200"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>

          {/* LOG MODAL */}
          <LogDataModal 
            isOpen={isLogModalOpen} 
            onClose={() => setIsLogModalOpen(false)} 
            week={week}
          />
          
          {/* PROFILE MODAL */}
          <ProfileModal 
            isOpen={isProfileModalOpen} 
            onClose={() => setIsProfileModalOpen(false)}
            currentProfile={patientProfile}
            onSave={setPatientProfile}
          />

        </div>
      )}
    </div>
  );
}