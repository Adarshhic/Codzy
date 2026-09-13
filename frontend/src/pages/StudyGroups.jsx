import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { Plus, Users, LogIn, Lock, Globe, Sparkles, ArrowRight, X, Shield } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import useStudyGroupStore from '../store/studyGroupStore';
import Navbar from '../components/Navbar';

function StudyGroups() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { groups, setGroups } = useStudyGroupStore();
  
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
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
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/study-groups/my-groups');
      setGroups(data.groups || []);
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

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <Navbar />

      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Header Hero Banner */}
        <div className="rounded-3xl bg-zinc-900/60 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Collaboration</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Study Groups & Live Rooms
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Collaborate in synchronized coding rooms, share algorithm insights, and solve challenging problems together.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-white/[0.08] transition-all"
            >
              <LogIn className="w-4 h-4 text-purple-400" />
              <span>Join with Code</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {/* Groups Grid */}
        <div>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 font-medium">Loading your study groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-3xl bg-zinc-900/30 border border-white/[0.06] p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No active study groups</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Create a new study group or enter an invite code from your peer to start live pair programming.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] transition-all"
                >
                  Enter Invite Code
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all"
                >
                  Create First Group
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <NavLink
                  key={group._id}
                  to={`/study-groups/${group._id}`}
                  className="group rounded-3xl bg-zinc-900/40 border border-white/[0.08] hover:border-purple-500/40 p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      {group.userRole === 'admin' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {group.description || 'Live peer group for algorithmic problem solving.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-mono font-medium">
                        {group.memberCount || 1} members
                      </span>
                      {group.isPrivate ? (
                        <Lock className="w-3.5 h-3.5 text-zinc-500" title="Private Group" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-zinc-500" title="Public Group" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/[0.1] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Create Study Group</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g., Dynamic Programming Squad"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Description (Optional)</label>
                <textarea
                  placeholder="Focus topics, meeting schedule, or goals..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Max Member Capacity</label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) || 50 })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-500/20 transition-all"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/[0.1] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Join Study Group</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">8-Character Invite Code</label>
                <input
                  type="text"
                  placeholder="e.g., A7X9Q2K1"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  maxLength={12}
                  className="w-full px-3.5 py-3 bg-zinc-950 border border-white/[0.08] rounded-xl text-sm text-center font-mono font-bold tracking-widest text-purple-400 uppercase placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[11px] text-zinc-500">Ask your group host for the unique invite code.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inviteCode.trim()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 transition-all"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudyGroups;