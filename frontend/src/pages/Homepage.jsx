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
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

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
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutUser());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#F8F9FA] to-[#FFF8F0] font-sans">
      {/* Navigation Bar - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border-b border-white/20 px-8 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-1">
            <NavLink to="/" className="text-3xl font-black bg-gradient-to-r from-[#7000FF] to-[#2DD4BF] bg-clip-text text-transparent tracking-tight">
              Codzy
            </NavLink>
          </div>
          <div className="flex items-center gap-6">
            {user && (
              <>
                <span className="text-sm font-semibold text-slate-600 px-4 py-2 bg-white/60 rounded-full backdrop-blur-sm border border-slate-100">
                  Welcome, {user.firstName || user.FirstName}
                </span>
                {user.role=='Admin'&&(
                  <NavLink to="/admin" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Admin
                  </NavLink>
                )}
                <button 
                  onClick={handleLogout} 
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold rounded-full hover:shadow-[0_8px_24px_rgba(239,68,68,0.3)] transform hover:scale-105 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8 max-w-7xl">
        
        {/* Stats Card - Glassmorphism with 3D effect */}
        <div className="mb-8 bg-white/80 backdrop-blur-md border border-white/40 p-8 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">Your Progress</span>
              <h2 className="text-4xl font-black text-slate-800 flex items-center gap-4 mt-2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-2xl text-2xl shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
                  XP
                </span> 
                LEVEL {Math.floor(solvedCount / 5) + 1}
              </h2>
            </div>
            <span className="font-mono text-lg text-transparent bg-gradient-to-r from-[#7000FF] to-[#2DD4BF] bg-clip-text font-black">
              {solvedCount} / {totalCount}
            </span>
          </div>
          
          <div className="w-full h-5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full overflow-hidden p-1 border border-slate-200/50 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#7000FF] via-[#9333EA] to-[#2DD4BF] rounded-full shadow-[0_0_24px_rgba(112,0,255,0.5),0_0_48px_rgba(45,212,191,0.3)] transition-all duration-1000 ease-out" 
              style={{width: `${progressPercentage}%`}}
            ></div>
          </div>
        </div>

        {/* Filters - Bento Grid Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select 
            className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-[20px] text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-pointer"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">🎯 All Problems</option>
            <option value="solved">✅ Solved Problems</option>
          </select>

          <select 
            className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-[20px] text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-pointer"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">📊 All Difficulties</option>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>

          <select 
            className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-[20px] text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-pointer"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">🏷️ All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>
        </div>

        {/* Problems List - Premium Cards */}
        <div className="grid gap-5">
          {filteredProblems.length === 0 ? (
            <div className="text-center text-lg text-slate-400 mt-16 font-bold">
              <div className="text-6xl mb-4">🔍</div>
              No problems found matching your filters.
            </div>
          ) : (
            filteredProblems.map(problem => (
              <div 
                key={problem._id} 
                className="group bg-white/90 backdrop-blur-sm p-7 rounded-[28px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-indigo-200/60 transition-all duration-300 transform hover:scale-[1.01] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black">
                    <NavLink 
                      to={`/problem/${problem._id}`} 
                      className="text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#7000FF] group-hover:to-[#2DD4BF] group-hover:bg-clip-text transition-all duration-300"
                    >
                      {problem.title}
                    </NavLink>
                  </h2>
                  {solvedProblems.some(sp => sp._id === problem._id) && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 px-4 py-2 rounded-[16px] text-sm font-black border border-emerald-100 shadow-[0_4px_16px_rgba(16,185,129,0.15)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Solved
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <div className={`px-4 py-2 rounded-[14px] text-xs font-black shadow-sm ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                  <div className="px-4 py-2 rounded-[14px] text-xs font-black bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100 shadow-sm">
                    {problem.tags}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-100';
    case 'medium': return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 border border-amber-100';
    case 'hard': return 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 border border-rose-100';
    default: return 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-600 border border-slate-100';
  }
};

export default Homepage;