import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      dispatch(logoutUser());
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
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-sm bg-black/30 border-b border-cyan-500/20">
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

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                <span className="text-cyan-400 text-sm font-bold">
                  👋 {user.firstName || user.FirstName}
                </span>
              </div>
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

      {/* Main Dashboard Content */}
      <div className="relative container mx-auto px-8 py-16 max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-20 animate-fadeIn">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/50 rounded-full backdrop-blur-sm mb-6">
            <span className="text-cyan-400 font-bold text-sm tracking-wider">⚡ MISSION CONTROL</span>
          </div>
          
          <h1 className="text-6xl font-black mb-4">
            <span className="block text-white">Welcome Back,</span>
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-glow">
              {user?.firstName || user?.FirstName || 'Developer'}
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your command center for mastering Data Structures & Algorithms
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* DSA Problems Card */}
          <NavLink 
            to="/problems"
            className="group perspective animate-fadeIn"
            style={{animationDelay: '0.1s'}}
          >
            <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl hover:border-cyan-500 transition-all duration-500 transform-gpu hover:scale-105 card-3d h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/50 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-black mb-4 text-white group-hover:text-cyan-400 transition-colors">
                  DSA PROBLEMS
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Practice coding problems and level up your algorithmic thinking
                </p>

                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <span>START CODING</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className="mt-6 h-1 w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </NavLink>

          {/* Study Groups Card */}
          <NavLink 
            to="/study-groups"
            className="group perspective animate-fadeIn"
            style={{animationDelay: '0.2s'}}
          >
            <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl hover:border-purple-500 transition-all duration-500 transform-gpu hover:scale-105 card-3d h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/50 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-black mb-4 text-white group-hover:text-purple-400 transition-colors">
                  STUDY GROUPS
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Collaborate with peers in real-time coding sessions
                </p>

                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <span>JOIN GROUP</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className="mt-6 h-1 w-full bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </NavLink>

          {/* Remote Interviews Card - NEW */}
          <NavLink 
            to="/interview/dashboard"
            className="group perspective animate-fadeIn"
            style={{animationDelay: '0.3s'}}
          >
            <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl hover:border-blue-500 transition-all duration-500 transform-gpu hover:scale-105 card-3d h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/50 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-black mb-4 text-white group-hover:text-blue-400 transition-colors">
                  INTERVIEWS
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Conduct or join 1-on-1 remote coding interviews with video
                </p>

                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <span>START SESSION</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className="mt-6 h-1 w-full bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </NavLink>

          {/* Admin Panel Card - Only for Admins */}
          {user?.role === 'Admin' && (
            <NavLink 
              to="/admin"
              className="group perspective animate-fadeIn"
              style={{animationDelay: '0.3s'}}
            >
              <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-red-500/30 rounded-2xl hover:border-red-500 transition-all duration-500 transform-gpu hover:scale-105 card-3d h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute inset-0 bg-red-400 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-red-500/50 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl font-black mb-4 text-white group-hover:text-red-400 transition-colors">
                    ADMIN PANEL
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    Manage platform, users, and system configurations
                  </p>

                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <span>CONFIGURE</span>
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  <div className="mt-6 h-1 w-full bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </NavLink>
          )}

          {/* My Profile Card */}
          <div className="group perspective animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-emerald-500/30 rounded-2xl hover:border-emerald-500 transition-all duration-500 transform-gpu hover:scale-105 card-3d h-full cursor-not-allowed opacity-75">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/50 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-black mb-4 text-white group-hover:text-emerald-400 transition-colors">
                  MY PROFILE
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Track your progress and view achievements
                </p>

                <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <span className="text-yellow-400 text-sm font-bold">🚧 COMING SOON</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Card */}
          <div className="group perspective animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-amber-500/30 rounded-2xl hover:border-amber-500 transition-all duration-500 transform-gpu hover:scale-105 card-3d h-full cursor-not-allowed opacity-75">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/50 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-black mb-4 text-white group-hover:text-amber-400 transition-colors">
                  RESOURCES
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Access tutorials and learning materials
                </p>

                <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <span className="text-yellow-400 text-sm font-bold">🚧 COMING SOON</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <div className="inline-block p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl">
            <div className="flex flex-wrap justify-center gap-12">
              <div className="group cursor-pointer">
                <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  500+
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Problems Available</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">AI Assistance</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-4xl font-black bg-gradient-to-r from-pink-400 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  Live
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Interview Sessions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
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

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .perspective {
          perspective: 1000px;
        }

        .card-3d {
          transition: transform 0.5s ease;
        }

        .card-3d:hover {
          transform: rotateY(5deg) rotateX(5deg);
        }
      `}</style>
    </div>
  );
}

export default Dashboard;