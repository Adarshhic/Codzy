import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      dispatch(logoutUser());
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#F8F9FA] to-[#FFF8F0] font-sans">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border-b border-white/20 px-8 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-1">
            <NavLink to="/dashboard" className="text-3xl font-black bg-gradient-to-r from-[#7000FF] to-[#2DD4BF] bg-clip-text text-transparent tracking-tight">
              Codzy
            </NavLink>
          </div>
          <div className="flex items-center gap-6">
            {user && (
              <>
                <span className="text-sm font-semibold text-slate-600 px-4 py-2 bg-white/60 rounded-full backdrop-blur-sm border border-slate-100">
                  Welcome, {user.firstName || user.FirstName}
                </span>
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

      {/* Main Dashboard Content */}
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-slate-800 mb-4">
            Welcome to <span className="bg-gradient-to-r from-[#7000FF] to-[#2DD4BF] bg-clip-text text-transparent">Codzy</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Your gateway to mastering Data Structures & Algorithms
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* DSA Problems Card */}
          <NavLink 
            to="/problems"
            className="group bg-white/90 backdrop-blur-sm p-8 rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-indigo-200/60 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(99,102,241,0.3)] group-hover:shadow-[0_12px_32px_rgba(99,102,241,0.4)] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#7000FF] group-hover:to-[#2DD4BF] group-hover:bg-clip-text transition-all">
                DSA Problems
              </h2>
              <p className="text-slate-600 font-medium">
                Practice coding problems and improve your skills
              </p>
            </div>
          </NavLink>

          {/* Admin Panel Card (Only for Admins) */}
          {user?.role === 'Admin' && (
            <NavLink 
              to="/admin"
              className="group bg-white/90 backdrop-blur-sm p-8 rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-rose-200/60 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-600 rounded-[24px] flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(244,63,94,0.3)] group-hover:shadow-[0_12px_32px_rgba(244,63,94,0.4)] transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-orange-600 group-hover:bg-clip-text transition-all">
                  Admin Panel
                </h2>
                <p className="text-slate-600 font-medium">
                  Manage problems, users, and platform settings
                </p>
              </div>
            </NavLink>
          )}

          {/* Profile/Stats Card (Optional - for future expansion) */}
          <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-emerald-200/60 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-2">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[24px] flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(16,185,129,0.3)] group-hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:bg-clip-text transition-all">
                My Profile
              </h2>
              <p className="text-slate-600 font-medium">
                View your progress and achievements
              </p>
              <p className="text-sm text-slate-400 mt-2 italic">Coming Soon</p>
            </div>
          </div>

          {/* Learning Resources Card (Optional) */}
          <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-amber-200/60 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-2">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-[24px] flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(245,158,11,0.3)] group-hover:shadow-[0_12px_32px_rgba(245,158,11,0.4)] transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-yellow-600 group-hover:bg-clip-text transition-all">
                Resources
              </h2>
              <p className="text-slate-600 font-medium">
                Access tutorials and learning materials
              </p>
              <p className="text-sm text-slate-400 mt-2 italic">Coming Soon</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;