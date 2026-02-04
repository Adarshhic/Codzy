import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data.problems || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setProblems([]);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data.problems || []);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
        setSolvedProblems([]);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      dispatch(logoutUser());
      setSolvedProblems([]);
      setProblems([]);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutUser());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || 
                           problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  const solvedCount = solvedProblems.length;
  const totalCount = problems.length;
  const progressPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-['Orbitron',sans-serif] relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Mesh */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 255, 0.15), transparent 50%)`,
          }}
        />
        
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-sm bg-black/30 border-b border-cyan-500/20 sticky top-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z"/>
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/>
              </svg>
            </div>
            <NavLink to="/dashboard" className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              CODZY
            </NavLink>
          </div>
          
          {/* Study Groups Link */}
          <NavLink 
            to="/study-groups" 
            className={({ isActive }) => `text-sm font-bold transition-all duration-200 flex items-center gap-2 px-4 py-2 rounded-lg ${
              isActive 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 border border-transparent'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            STUDY GROUPS
          </NavLink>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                <span className="text-cyan-400 text-sm font-bold">
                  👋 {user.firstName || user.FirstName}
                </span>
              </div>
              {user.role === 'Admin' && (
                <NavLink 
                  to="/admin" 
                  className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all"
                >
                  ADMIN
                </NavLink>
              )}
              <button 
                onClick={handleLogout} 
                className="group px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg font-bold hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">LOGOUT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container mx-auto px-8 py-12 max-w-7xl">
        
        {/* Stats Card - Progress Tracker */}
        <div className="mb-12 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-md border border-cyan-500/30 p-8 rounded-2xl shadow-2xl shadow-cyan-500/10 animate-fadeIn">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-xs font-black tracking-[0.2em] text-cyan-400 uppercase">⚡ Your Progress</span>
              <h2 className="text-4xl font-black text-white flex items-center gap-4 mt-2">
                <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-xl text-2xl shadow-lg shadow-cyan-500/50">
                  XP
                </span> 
                LEVEL {Math.floor(solvedCount / 5) + 1}
              </h2>
            </div>
            <span className="font-mono text-2xl bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent font-black">
              {solvedCount} / {totalCount}
            </span>
          </div>
          
          <div className="relative w-full h-6 bg-gray-800/50 rounded-full overflow-hidden border border-cyan-500/20">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_24px_rgba(6,182,212,0.6)] transition-all duration-1000 ease-out relative overflow-hidden" 
              style={{width: `${progressPercentage}%`}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            {progressPercentage.toFixed(1)}% Complete • {totalCount - solvedCount} problems remaining
          </div>
        </div>

        {/* Filters - Futuristic Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          <select 
            className="px-6 py-4 bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all" className="bg-gray-900">🎯 ALL PROBLEMS</option>
            <option value="solved" className="bg-gray-900">✅ SOLVED</option>
          </select>

          <select 
            className="px-6 py-4 bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl text-sm font-bold text-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all" className="bg-gray-900">📊 ALL DIFFICULTY</option>
            <option value="easy" className="bg-gray-900">🟢 EASY</option>
            <option value="medium" className="bg-gray-900">🟡 MEDIUM</option>
            <option value="hard" className="bg-gray-900">🔴 HARD</option>
          </select>

          <select 
            className="px-6 py-4 bg-gray-900/50 backdrop-blur-sm border border-pink-500/30 rounded-xl text-sm font-bold text-pink-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all shadow-lg hover:shadow-pink-500/20 cursor-pointer"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all" className="bg-gray-900">🏷️ ALL TAGS</option>
            <option value="array" className="bg-gray-900">ARRAY</option>
            <option value="linkedList" className="bg-gray-900">LINKED LIST</option>
            <option value="graph" className="bg-gray-900">GRAPH</option>
            <option value="dp" className="bg-gray-900">DYNAMIC PROGRAMMING</option>
          </select>
        </div>

        {/* Problems List - Cyberpunk Cards */}
        <div className="grid gap-4">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-20 animate-fadeIn">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-2xl font-bold text-gray-400 mb-2">NO PROBLEMS FOUND</div>
              <div className="text-gray-500">Try adjusting your filters</div>
            </div>
          ) : (
            filteredProblems.map((problem, index) => (
              <div 
                key={problem._id} 
                className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn"
                style={{animationDelay: `${0.1 + index * 0.05}s`}}
              >
                <div className="flex items-center justify-between mb-4">
                  <NavLink 
                    to={`/problem/${problem._id}`} 
                    className="flex-1"
                  >
                    <h2 className="text-xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 flex items-center gap-3">
                      <span className="text-cyan-400 text-sm">#{index + 1}</span>
                      {problem.title}
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </h2>
                  </NavLink>
                  
                  {solvedProblems.some(sp => sp._id === problem._id) && (
                    <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-black border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      SOLVED
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <div className={`px-4 py-2 rounded-lg text-xs font-black shadow-md ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty?.toUpperCase()}
                  </div>
                  <div className="px-4 py-2 rounded-lg text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-md">
                    {problem.tags?.toUpperCase()}
                  </div>
                </div>

                {/* Glow line at bottom */}
                <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>

        {/* Bottom Stats */}
        {filteredProblems.length > 0 && (
          <div className="mt-12 text-center animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <div className="inline-block px-8 py-4 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">SHOWING</div>
              <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                {filteredProblems.length} PROBLEM{filteredProblems.length !== 1 ? 'S' : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': 
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50';
    case 'medium': 
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/50';
    case 'hard': 
      return 'bg-rose-500/20 text-rose-400 border border-rose-500/50';
    default: 
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/50';
  }
};

export default Homepage;