import { Plus, Edit, Trash2, Video, ShieldCheck, ArrowRight, Activity, Database, Server } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import Navbar from '../components/Navbar';

function Admin() {
  const navigate = useNavigate();

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new challenge to the library with test cases and starter code templates.',
      icon: Plus,
      badge: 'Creation',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'group-hover:border-emerald-500/40',
      route: '/admin/create'
    },
    {
      id: 'delete',
      title: 'Problem Management',
      description: 'Review existing challenges, inspect test sets, and delete outdated problems.',
      icon: Trash2,
      badge: 'Maintenance',
      gradient: 'from-rose-500/20 to-red-500/20',
      iconColor: 'text-rose-400',
      borderColor: 'group-hover:border-rose-500/40',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Solutions',
      description: 'Upload video explanations to Cloudinary and attach them to problem editorials.',
      icon: Video,
      badge: 'Media Content',
      gradient: 'from-indigo-500/20 to-purple-500/20',
      iconColor: 'text-indigo-400',
      borderColor: 'group-hover:border-indigo-500/40',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <ShieldCheck size={14} />
                <span>Superuser Console</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Admin Center
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
                Manage algorithm challenges, test cases, editorial video recordings, and platform content.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <NavLink
                key={option.id}
                to={option.route}
                className="group block"
              >
                <div className={`p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] ${option.borderColor} backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between h-full`}>
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${option.gradient} border border-white/[0.08] flex items-center justify-center ${option.iconColor}`}>
                        <IconComponent size={22} />
                      </div>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                        {option.badge}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                      {option.title}
                    </h2>
                    
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                      {option.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors pt-4 border-t border-zinc-800/60">
                    <span>Access Console</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-indigo-400" />
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Platform Status Diagnostics */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <Activity size={14} className="text-emerald-400" />
            <span>Platform Infrastructure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Database size={18} />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-medium">Database</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PostgreSQL Neon
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Server size={18} />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-medium">Judge0 API</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CE Connected
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Video size={18} />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-medium">Media Storage</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Cloudinary Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;