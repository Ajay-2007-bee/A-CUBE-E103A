import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { 
  Activity, Zap, Users, Trophy, TrendingUp, AlertCircle, 
  LayoutDashboard, Search, Bell, Filter
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    axios.get('http://127.0.0.1:8000/team-stats')
      .then(response => {
        
        const teamOnly = response.data.filter(user => !user.name.includes("Ajay"));
        setStats(teamOnly);
        setLoading(false);
      })
      .catch(error => {
        console.error("Backend offline", error);
        
        setStats([]); 
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-slate-400">Calculating Impact Scores...</p>
    </div>
  );

 
  const mvp = stats.length > 0 ? stats[0] : { name: "N/A", impact_score: 0 };
  const totalImpact = stats.reduce((acc, curr) => acc + curr.impact_score, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR (Simplified) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 h-screen fixed left-0 top-0 z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ImpactGraph</h1>
            <p className="text-[10px] text-blue-400 font-medium tracking-widest uppercase">Workforce Monitor</p>
          </div>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white">
            <Users className="w-5 h-5" /> My Team
          </button>
        </nav>
      </aside>

      <main className="md:ml-64 p-6 md:p-8 min-h-screen">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Performance Overview</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Real-Time Analysis
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-sm text-slate-400">
               <span className="w-2 h-2 bg-green-500 rounded-full"></span> Impact
               <span className="w-2 h-2 bg-red-500 rounded-full ml-2"></span> Activity (Noise)
            </div>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-24 h-24 text-yellow-500" />
            </div>
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold uppercase tracking-wider">Top Silent Architect</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mvp.name}</div>
            <div className="text-sm text-green-400 font-mono">Score: {mvp.impact_score}</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold uppercase tracking-wider">Total Impact Generated</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalImpact.toFixed(1)}</div>
            <div className="text-sm text-slate-400">Across {stats.length} Engineers</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Activity className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold uppercase tracking-wider">System Status</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">Active</div>
            <div className="text-sm text-slate-400">Monitoring GitHub & Slack</div>
          </div>
        </div>

        {/* --- THE GAP ANALYSIS CHART (CRITICAL REQUEST) --- */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  The Gap Analysis: Impact vs. Activity
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Visualizing the disparity between <span className="text-red-400">Perceived Activity (Volume)</span> and <span className="text-green-400">Actual Impact (Value)</span>.
                  <br/>Users where <span className="text-green-400">Green Line</span> {'>'} <span className="text-red-400">Red Line</span> are the undervalued "Silent Architects".
                </p>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  
                  {/* RED LINE = PERCEIVED ACTIVITY (NOISE) */}
                  <Area 
                    type="monotone" 
                    dataKey="activity_count" 
                    name="Perceived Activity (Volume)" 
                    stroke="#f87171" 
                    fillOpacity={1} 
                    fill="url(#colorActivity)" 
                    strokeWidth={3}
                  />

                  {/* GREEN LINE = ACTUAL IMPACT (VALUE) */}
                  <Area 
                    type="monotone" 
                    dataKey="impact_score" 
                    name="Actual Impact (Value)" 
                    stroke="#4ade80" 
                    fillOpacity={1} 
                    fill="url(#colorImpact)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- LEADERBOARD & METRIC EXPLANATION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEADERBOARD */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
             <h3 className="text-lg font-bold text-white mb-6">Impact Leaderboard</h3>
             <div className="space-y-4">
              {stats.map((user, index) => (
                <div key={user.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-sm text-white">{user.name}</span>
                      <span className="text-xs font-mono text-green-400">{user.impact_score} pts</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${(user.impact_score / (mvp.impact_score || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULA EXPLANATION CARD */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              How It Works (The Formula)
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 text-sm font-mono text-slate-400 mb-4">
              ImpactScore = (W_code × Q_code) + (W_review × Q_review) + (W_collab × Q_collab)
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">•</span>
                <span><strong>Code Quality (Q_code):</strong> Refactoring (-500 lines) {'>'} Bloat (+500 lines). Complexity is measured by critical file touches.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Unblocking (Q_collab):</strong> Slack NLP detects "Thanks" + Technical keywords. Helping others {'>'} sending random messages.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-400 font-bold">•</span>
                <span><strong>Mentorship (Q_review):</strong> Code reviews that result in changes are weighted 3x higher than simple "LGTM".</span>
              </li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;