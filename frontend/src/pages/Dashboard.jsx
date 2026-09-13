import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { 
  Code2, 
  Users, 
  Video, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Play, 
  Layers, 
  BrainCircuit, 
  TrendingUp,
  Clock,
  Compass
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [probRes, solvedRes] = await Promise.allSettled([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser')
        ]);

        if (probRes.status === 'fulfilled' && probRes.value.data) {
          setProblems(probRes.value.data.problems || []);
        }
        if (solvedRes.status === 'fulfilled' && solvedRes.value.data) {
          setSolvedProblems(solvedRes.value.data.problems || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalProblems = problems.length || 0;
  const solvedCount = solvedProblems.length || 0;
  const progressPercent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const easySolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const mediumSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const hardSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

  const totalEasy = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length || 1;
  const totalMedium = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length || 1;
  const totalHard = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length || 1;

  // Unsolved recommended problems
  const recommendedProblems = problems
    .filter(p => !solvedProblems.some(sp => sp._id === p._id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Navbar */}
      <Navbar />

      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-96 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Top Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-white/[0.08] p-6 sm:p-8 overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Level {Math.floor(solvedCount / 3) + 1} Architect</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome back, {user?.FirstName || user?.firstName || 'Engineer'}
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Ready to level up? Continue your DSA practice, collaborate in live study sessions, or run a mock interview.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <NavLink
                to="/problems"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Daily Challenge</span>
              </NavLink>
              <NavLink
                to="/study-groups"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] transition-all"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Join Room</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Progress */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Solved Problems</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono">{solvedCount} <span className="text-xs font-normal text-zinc-500 font-sans">/ {totalProblems}</span></span>
              <span className="text-xs font-bold text-indigo-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Easy breakdown */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Easy Difficulty</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{easySolved}</span>
              <span className="text-xs text-zinc-500 font-mono">{totalEasy} total</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((easySolved / totalEasy) * 100))}%` }}
              />
            </div>
          </div>

          {/* Medium breakdown */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Medium Difficulty</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-400 font-mono">{mediumSolved}</span>
              <span className="text-xs text-zinc-500 font-mono">{totalMedium} total</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((mediumSolved / totalMedium) * 100))}%` }}
              />
            </div>
          </div>

          {/* Hard breakdown */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Hard Difficulty</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-rose-400 font-mono">{hardSolved}</span>
              <span className="text-xs text-zinc-500 font-mono">{totalHard} total</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((hardSolved / totalHard) * 100))}%` }}
              />
            </div>
          </div>

        </div>

        {/* Bento Grid: Main Feature Hubs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Problem Solving Suite */}
          <NavLink
            to="/problems"
            className="group relative rounded-3xl bg-zinc-900/40 border border-white/[0.08] hover:border-indigo-500/40 p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  DSA Problem Explorer
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Browse over 500+ curated problems across Array, Dynamic Programming, Graphs, Trees, and more.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-white/[0.06] mt-6">
              <span className="text-xs font-semibold text-indigo-400">Explore Catalog</span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          </NavLink>

          {/* Card 2: Live Study Groups */}
          <NavLink
            to="/study-groups"
            className="group relative rounded-3xl bg-zinc-900/40 border border-white/[0.08] hover:border-purple-500/40 p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  Study Groups & Rooms
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Join real-time peer coding sessions with synchronized Monaco editors, active cursors, and group chat.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-white/[0.06] mt-6">
              <span className="text-xs font-semibold text-purple-400">Join Live Session</span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
          </NavLink>

          {/* Card 3: Video Mock Interviews */}
          <NavLink
            to="/interview/dashboard"
            className="group relative rounded-3xl bg-zinc-900/40 border border-white/[0.08] hover:border-cyan-500/40 p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  1-on-1 Mock Interviews
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Practice simulated FAANG technical rounds with low-latency WebRTC video and interviewer evaluation rubrics.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-white/[0.06] mt-6">
              <span className="text-xs font-semibold text-cyan-400">Launch Interview</span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </NavLink>

        </div>

        {/* Bottom Section: Recommended Problems & Platform Capabilities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recommended Problems (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-zinc-900/40 border border-white/[0.08] p-6 sm:p-7 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Recommended for You</h3>
              </div>
              <NavLink 
                to="/problems" 
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View all ({totalProblems})
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recommendedProblems.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                🎉 Incredible! You've solved all recommended problems.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recommendedProblems.map((prob) => {
                  const diffColor = 
                    prob.difficulty?.toLowerCase() === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                    prob.difficulty?.toLowerCase() === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                    'text-rose-400 bg-rose-500/10 border-rose-500/20';

                  return (
                    <NavLink
                      key={prob._id}
                      to={`/problem/${prob._id}`}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/40 border border-white/[0.04] hover:border-white/[0.1] hover:bg-zinc-800/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-xs font-mono font-bold text-zinc-400 group-hover:text-white">
                          #
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors">
                            {prob.title}
                          </p>
                          <p className="text-xs text-zinc-500 capitalize">{prob.tags || 'General'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Tutor Assistant Spotlight (1 Col) */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-purple-950/40 border border-indigo-500/20 p-6 sm:p-7 backdrop-blur-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-white">Gemini AI DSA Assistant</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stuck on a tricky edge case or time complexity constraint? Our built-in tutor gives tailored hints without spoiling the solution.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Optimal time & space complexity analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Custom edge-case generation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Socratic debugging hints</span>
                </div>
              </div>
            </div>

            <NavLink
              to="/problems"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Problem with AI</span>
            </NavLink>
          </div>

        </div>

      </main>
    </div>
  );
}

export default Dashboard;