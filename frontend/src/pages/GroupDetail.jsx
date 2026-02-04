import { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import { Users, Copy, LogOut, Play, Crown, Shield } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import useStudyGroupStore from '../store/studyGroupStore';

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { setCurrentGroup, activeSession, setActiveSession } = useStudyGroupStore();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartSessionModal, setShowStartSessionModal] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupProgress();
    fetchActiveSession();
    fetchProblems();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const { data } = await axiosClient.get(`/study-groups/${groupId}`);
      setGroup(data.group);
      setMembers(data.members);
      setCurrentGroup(data.group);
    } catch (error) {
      toast.error('Failed to load group details');
      navigate('/study-groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupProgress = async () => {
    try {
      const { data } = await axiosClient.get(`/study-groups/${groupId}/progress`);
      setProgress(data.progress);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const { data } = await axiosClient.get(`/study-groups/${groupId}/session/active`);
      setActiveSession(data.session);
    } catch (error) {
      console.error('No active session');
      setActiveSession(null);
    }
  };

  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data.problems || []);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    toast.success('Invite code copied!');
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    
    try {
      await axiosClient.delete(`/study-groups/${groupId}/leave`);
      toast.success('Left the group');
      navigate('/study-groups');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to leave group');
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.post(`/study-groups/${groupId}/session/start`, {
        problemId: selectedProblem
      });
      toast.success('Session started!');
      setActiveSession(data.session);
      setShowStartSessionModal(false);
      navigate(`/study-groups/${groupId}/session/${data.session._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start session');
    }
  };

  const handleJoinSession = () => {
    if (activeSession) {
      navigate(`/study-groups/${groupId}/session/${activeSession._id}`);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-yellow-400" />;
      case 'moderator': return <Shield size={16} className="text-cyan-400" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'hard': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-400 font-bold">LOADING...</div>
        </div>
      </div>
    );
  }

  const canStartSession = group?.userRole === 'admin' || group?.userRole === 'moderator';

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-['Orbitron',sans-serif] relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 255, 0.15), transparent 50%)`,
          }}
        />
        
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
      <div className="relative z-50 bg-black/30 backdrop-blur-sm border-b border-cyan-500/20 px-8 py-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="animate-fadeIn">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {group?.name}
                </h1>
                {group?.userRole === 'admin' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold border border-yellow-500/50">
                    <Crown size={16} />
                    ADMIN
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-lg">{group?.description}</p>
            </div>
            <div className="flex gap-3 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              {activeSession ? (
                <button 
                  onClick={handleJoinSession}
                  className="group px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                  JOIN ACTIVE SESSION
                </button>
              ) : canStartSession && (
                <button 
                  onClick={() => setShowStartSessionModal(true)}
                  className="group px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                  START SESSION
                </button>
              )}
              <button 
                onClick={handleLeaveGroup}
                className="group px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                LEAVE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative container mx-auto p-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info & Members */}
          <div className="space-y-6">
            {/* Invite Code Card */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 shadow-lg animate-fadeIn">
              <h2 className="text-lg font-black text-cyan-400 mb-4 flex items-center gap-2">
                🔐 INVITE CODE
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-900/50 px-4 py-4 rounded-xl border border-cyan-500/20 text-center">
                  <code className="text-2xl font-mono font-black text-cyan-400 tracking-wider">
                    {group?.inviteCode}
                  </code>
                </div>
                <button 
                  onClick={copyInviteCode}
                  className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all group"
                >
                  <Copy size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Members Card */}
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-lg animate-fadeIn" style={{animationDelay: '0.1s'}}>
              <h2 className="text-lg font-black text-purple-400 mb-4 flex items-center gap-2">
                <Users size={20} />
                MEMBERS ({members.length}/{group?.maxMembers})
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {members.map((member) => (
                  <div 
                    key={member._id}
                    className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {getRoleIcon(member.role)}
                      <span className="font-bold text-white">
                        {member.userId.FirstName}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                      member.role === 'moderator' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                    }`}>
                      {member.role.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Progress */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-8 shadow-lg animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <h2 className="text-2xl font-black text-pink-400 mb-6 flex items-center gap-2">
                📊 GROUP PROGRESS
              </h2>
              
              {progress.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-500/30">
                    <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg font-bold mb-2">NO PROBLEMS SOLVED YET</p>
                  <p className="text-gray-500">Start a session to begin solving together!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {progress.map((item, index) => (
                    <div 
                      key={item._id}
                      className="p-6 bg-gray-900/30 rounded-xl border border-pink-500/20 hover:border-pink-500/50 transition-all animate-fadeIn"
                      style={{animationDelay: `${0.1 + index * 0.05}s`}}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black text-white">
                          {item.problemId.title}
                        </h3>
                        <div className="flex gap-2">
                          <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(item.problemId.difficulty)}`}>
                            {item.problemId.difficulty?.toUpperCase()}
                          </div>
                          <div className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/50">
                            {item.problemId.tags?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        ✅ Solved by {item.solvedBy.length} member{item.solvedBy.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.solvedBy.map((solver) => (
                          <div key={solver._id} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/50">
                            {solver.FirstName}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Start Session Modal */}
      {showStartSessionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/50 rounded-2xl max-w-md w-full shadow-2xl shadow-cyan-500/20 animate-fadeIn">
            <div className="p-8">
              <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                START NEW SESSION
              </h3>
              <form onSubmit={handleStartSession} className="space-y-6">
                <div>
                  <label className="block text-cyan-400 text-sm font-bold mb-2">
                    SELECT PROBLEM
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    required
                  >
                    <option value="" className="bg-gray-900">Choose a problem</option>
                    {problems.map((problem) => (
                      <option key={problem._id} value={problem._id} className="bg-gray-900">
                        {problem.title} ({problem.difficulty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
                    onClick={() => setShowStartSessionModal(false)}
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedProblem}
                  >
                    START
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
}

export default GroupDetail;