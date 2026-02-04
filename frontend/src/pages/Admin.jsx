import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Video } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const adminOptions = [
    {
      id: 'create',
      title: 'CREATE PROBLEM',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      gradient: 'from-emerald-500 to-teal-600',
      borderColor: 'emerald-500',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'UPDATE PROBLEM',
      description: 'Edit existing problems and their details',
      icon: Edit,
      gradient: 'from-amber-500 to-orange-600',
      borderColor: 'amber-500',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'DELETE PROBLEM',
      description: 'Remove problems from the platform',
      icon: Trash2,
      gradient: 'from-rose-500 to-red-600',
      borderColor: 'rose-500',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'VIDEO MANAGEMENT',
      description: 'Upload and delete problem solution videos',
      icon: Video,
      gradient: 'from-purple-500 to-pink-600',
      borderColor: 'purple-500',
      route: '/admin/video'
    }
  ];

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

      {/* Header */}
      <div className="relative z-50 bg-black/30 backdrop-blur-sm border-b border-red-500/20 px-8 py-12">
        <div className="container mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-600/20 border border-red-500/50 rounded-full backdrop-blur-sm mb-6 animate-fadeIn">
            <span className="text-red-400 font-bold text-sm tracking-wider">⚙️ SYSTEM CONTROL</span>
          </div>
          
          <h1 className="text-6xl font-black mb-4 animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <span className="bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              ADMIN PANEL
            </span>
          </h1>
          
          <p className="text-gray-400 text-xl max-w-2xl mx-auto animate-fadeIn" style={{animationDelay: '0.2s'}}>
            Manage coding problems and platform content
          </p>
        </div>
      </div>

      {/* Admin Options Grid */}
      <div className="relative container mx-auto px-8 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <NavLink
                key={option.id}
                to={option.route}
                className="group perspective animate-fadeIn"
                style={{animationDelay: `${0.1 + index * 0.1}s`}}
              >
                <div className={`relative p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-${option.borderColor}/30 rounded-2xl hover:border-${option.borderColor} shadow-lg hover:shadow-2xl hover:shadow-${option.borderColor}/20 transition-all duration-500 transform-gpu hover:scale-105 card-3d h-full`}>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${option.borderColor}/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-${option.borderColor}/50 group-hover:scale-110 transition-transform`}>
                      <IconComponent size={32} className="text-white" />
                    </div>
                    
                    {/* Title */}
                    <h2 className={`text-xl font-black mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${option.gradient} group-hover:bg-clip-text transition-all`}>
                      {option.title}
                    </h2>
                    
                    {/* Description */}
                    <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                      {option.description}
                    </p>

                    {/* Action Button */}
                    <div className={`flex items-center gap-2 text-${option.borderColor}-400 font-bold text-sm`}>
                      <span>ACCESS</span>
                      <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>

                    {/* Glow line at bottom */}
                    <div className={`mt-6 h-[2px] w-full bg-gradient-to-r from-transparent via-${option.borderColor}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Back to Dashboard Link */}
        <div className="text-center mt-16 animate-fadeIn" style={{animationDelay: '0.5s'}}>
          <NavLink
            to="/dashboard"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-cyan-400 font-bold hover:bg-cyan-500/10 hover:border-cyan-500 transition-all"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            BACK TO DASHBOARD
          </NavLink>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-2">
              SECURE
            </div>
            <div className="text-sm text-gray-400">Admin Access Only</div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
              LIVE
            </div>
            <div className="text-sm text-gray-400">Real-time Updates</div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-pink-400 to-red-600 bg-clip-text text-transparent mb-2">
              FAST
            </div>
            <div className="text-sm text-gray-400">Instant Operations</div>
          </div>
        </div>
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

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
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

export default Admin;