import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { 
  Users, Copy, LogOut, Play, Crown, Shield, CheckCircle2, 
  Sparkles, Code2, ArrowLeft, Clock, Check, ChevronRight,
  Radio, BookOpen, AlertCircle
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import useStudyGroupStore from '../store/studyGroupStore';
import Navbar from '../components/Navbar';

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
  const [copied, setCopied] = useState(false);

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
      setMembers(data.members || []);
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
      setProgress(data.progress || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const { data } = await axiosClient.get(`/study-groups/${groupId}/session/active`);
      setActiveSession(data.session);
    } catch (error) {
      setActiveSession(null);
    }
  };

  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      let problemsData = [];
      if (data.message && Array.isArray(data.message)) {
        problemsData = data.message;
      } else if (data.problems) {
        problemsData = data.problems;
      } else if (Array.isArray(data)) {
        problemsData = data;
      }
      setProblems(problemsData);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const copyInviteCode = () => {
    if (!group?.inviteCode) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    toast.success('Invite code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this study group?')) return;
    
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
      toast.success('Live session started!');
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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Crown size={12} /> Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shield size={12} /> Mod
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            Member
          </span>
        );
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm font-medium">Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  const canStartSession = group?.userRole === 'admin' || group?.userRole === 'moderator';

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
          <button 
            onClick={() => navigate('/study-groups')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Study Groups</span>
          </button>
          <span>/</span>
          <span className="text-zinc-200 font-medium">{group?.name}</span>
        </div>

        {/* Group Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {group?.name}
                </h1>
                {group?.userRole === 'admin' && (
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Crown size={14} /> You're Admin
                  </span>
                )}
                {activeSession && (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <Radio size={14} /> Live Session Active
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-base leading-relaxed">
                {group?.description || 'Collaborate, solve problems together, and level up your data structures & algorithms skills.'}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-indigo-400" />
                  {members.length} / {group?.maxMembers || 10} members
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  {progress.length} solved
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeSession ? (
                <button
                  onClick={handleJoinSession}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Play size={18} fill="currentColor" />
                  Join Live Session
                </button>
              ) : canStartSession ? (
                <button
                  onClick={() => setShowStartSessionModal(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Play size={18} fill="currentColor" />
                  Start Live Session
                </button>
              ) : null}

              <button
                onClick={handleLeaveGroup}
                className="px-5 py-3 rounded-2xl bg-zinc-900/80 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 font-medium text-sm transition-all flex items-center gap-2"
              >
                <LogOut size={16} />
                Leave
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Invite Code & Members */}
          <div className="space-y-6">
            {/* Invite Code Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Group Invite Code</span>
                <span className="text-xs text-indigo-400">Share with peers</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                <code className="flex-1 font-mono text-center font-bold text-lg text-indigo-300 tracking-widest px-3 py-2">
                  {group?.inviteCode}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center"
                  title="Copy code"
                >
                  {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                Friends can use this code in the Study Groups hub to join instantly.
              </p>
            </div>

            {/* Members List */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-indigo-400" />
                  <h2 className="font-bold text-white text-base">Members</h2>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/50 rounded-full text-zinc-300">
                  {members.length} / {group?.maxMembers || 10}
                </span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {members.map((member) => {
                  const firstName = member.userId?.FirstName || 'User';
                  const initials = firstName.slice(0, 2).toUpperCase();
                  const isCurrentUser = member.userId?._id === user?._id || member.userId?.id === user?.id;

                  return (
                    <div 
                      key={member._id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isCurrentUser 
                          ? 'bg-indigo-500/5 border-indigo-500/20' 
                          : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                            <span>{firstName}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] text-zinc-500 font-normal">(You)</span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500">
                            Joined {new Date(member.joinedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Group Solved Progress */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-400" />
                    Group Problem Progress
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Problems solved collectively during live group sessions
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {progress.length} Solved
                </span>
              </div>

              {progress.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-zinc-950/30 border border-dashed border-zinc-800">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-300 mb-1">No group solves yet</h3>
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                    Start a live session to solve LeetCode problems together with real-time code sharing.
                  </p>
                  {canStartSession && !activeSession && (
                    <button
                      onClick={() => setShowStartSessionModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
                    >
                      <Play size={16} fill="currentColor" /> Start First Session
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {progress.map((item) => (
                    <div 
                      key={item._id}
                      className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.problemId?.title || 'Coding Problem'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyBadge(item.problemId?.difficulty)}`}>
                            {item.problemId?.difficulty || 'Medium'}
                          </span>
                          {item.problemId?.tags && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {item.problemId.tags}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          Solved by {item.solvedBy?.length || 0} member{item.solvedBy?.length !== 1 ? 's' : ''}:
                        </span>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {item.solvedBy?.map((solver) => (
                            <span 
                              key={solver._id || solver.id}
                              className="px-2.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 font-medium"
                            >
                              {solver.FirstName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Start Session Modal */}
      {showStartSessionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Start Live Session</h3>
                <p className="text-xs text-zinc-400 mt-1">Select a challenge for the room to solve collaboratively.</p>
              </div>
              <button
                onClick={() => setShowStartSessionModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Problem
                </label>
                <select
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  value={selectedProblem}
                  onChange={(e) => setSelectedProblem(e.target.value)}
                  required
                >
                  <option value="" className="bg-zinc-900">Choose a problem from library</option>
                  {problems.map((problem) => (
                    <option key={problem._id} value={problem._id} className="bg-zinc-900">
                      {problem.title} ({problem.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium text-sm transition-all"
                  onClick={() => setShowStartSessionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedProblem}
                >
                  Launch Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;