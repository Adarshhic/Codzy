import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { Plus, Users, LogIn } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import useStudyGroupStore from '../store/studyGroupStore';

function StudyGroups() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { groups, setGroups } = useStudyGroupStore();
  
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Create group form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    maxMembers: 50,
    isPrivate: true
  });
  
  // Join group form
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/study-groups/my-groups');
      setGroups(data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.post('/study-groups/create', createForm);
      toast.success('Study group created!');
      setGroups([data.group, ...groups]);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', maxMembers: 50, isPrivate: true });
      navigate(`/study-groups/${data.group._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.post('/study-groups/join', { 
        inviteCode: inviteCode.trim().toUpperCase() 
      });
      toast.success('Joined group successfully!');
      fetchGroups();
      setShowJoinModal(false);
      setInviteCode('');
      navigate(`/study-groups/${data.group._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join group');
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
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="animate-fadeIn">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/50 rounded-full backdrop-blur-sm mb-4">
                <span className="text-purple-400 font-bold text-sm tracking-wider">👥 COLLABORATION HUB</span>
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                STUDY GROUPS
              </h1>
              <p className="text-gray-400 text-lg">
                Collaborate and conquer problems together
              </p>
            </div>
            <div className="flex gap-3 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <button 
                onClick={() => setShowJoinModal(true)}
                className="group px-6 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 font-bold hover:bg-purple-500/20 hover:border-purple-500 transition-all duration-300 flex items-center gap-2"
              >
                <LogIn size={20} className="group-hover:rotate-12 transition-transform" />
                JOIN GROUP
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="group px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  CREATE GROUP
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="relative container mx-auto p-8 max-w-7xl">
        {groups.length === 0 ? (
          <div className="text-center py-32 animate-fadeIn">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/30">
              <Users size={64} className="text-cyan-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">
              NO STUDY GROUPS YET
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Create your first group or join one with an invite code
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowJoinModal(true)}
                className="px-8 py-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 font-bold hover:bg-purple-500/20 transition-all flex items-center gap-2"
              >
                <LogIn size={20} />
                JOIN GROUP
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Plus size={20} />
                CREATE GROUP
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <NavLink
                key={group._id}
                to={`/study-groups/${group._id}`}
                className="group bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl hover:border-purple-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-105 animate-fadeIn"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                      {group.name}
                    </h2>
                    {group.userRole === 'admin' && (
                      <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold border border-yellow-500/50">
                        ADMIN
                      </div>
                    )}
                  </div>
                  
                  {group.description && (
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-bold border border-cyan-500/50">
                      <Users size={14} />
                      {group.memberCount || 0} MEMBERS
                    </div>
                    
                    {group.isPrivate && (
                      <div className="px-3 py-2 bg-gray-500/20 text-gray-400 rounded-lg text-sm font-bold border border-gray-500/50">
                        PRIVATE
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-cyan-500/20">
                    <div className="text-xs text-gray-500 mb-1">INVITE CODE</div>
                    <div className="font-mono font-bold text-cyan-400 text-lg tracking-wider">
                      {group.inviteCode}
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/50 rounded-2xl max-w-md w-full shadow-2xl shadow-cyan-500/20 animate-fadeIn">
            <div className="p-8">
              <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                CREATE STUDY GROUP
              </h3>
              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div>
                  <label className="block text-cyan-400 text-sm font-bold mb-2">
                    GROUP NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., DSA Warriors"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 text-sm font-bold mb-2">
                    DESCRIPTION (OPTIONAL)
                  </label>
                  <textarea
                    placeholder="What's your group about?"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 text-sm font-bold mb-2">
                    MAX MEMBERS
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    value={createForm.maxMembers}
                    onChange={(e) => setCreateForm({...createForm, maxMembers: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-cyan-500/30 rounded-xl">
                  <span className="text-white font-bold">PRIVATE GROUP</span>
                  <button
                    type="button"
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      createForm.isPrivate ? 'bg-cyan-500' : 'bg-gray-700'
                    }`}
                    onClick={() => setCreateForm({...createForm, isPrivate: !createForm.isPrivate})}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                      createForm.isPrivate ? 'translate-x-8' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
                    onClick={() => setShowCreateModal(false)}
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
                  >
                    CREATE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/50 rounded-2xl max-w-md w-full shadow-2xl shadow-purple-500/20 animate-fadeIn">
            <div className="p-8">
              <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                JOIN STUDY GROUP
              </h3>
              <form onSubmit={handleJoinGroup} className="space-y-6">
                <div>
                  <label className="block text-purple-400 text-sm font-bold mb-2">
                    INVITE CODE
                  </label>
                  <input
                    type="text"
                    placeholder="ENTER 8-CHARACTER CODE"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl text-white font-mono text-lg tracking-wider uppercase placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all text-center"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                    maxLength={8}
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Ask your group admin for the invite code
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
                    onClick={() => setShowJoinModal(false)}
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={inviteCode.length !== 8}
                  >
                    JOIN
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
      `}</style>
    </div>
  );
}

export default StudyGroups;