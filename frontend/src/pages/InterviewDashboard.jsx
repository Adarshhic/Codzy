import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { 
  Video, Plus, Users, Clock, Calendar, CheckCircle2, 
  ArrowRight, Shield, Sparkles, Radio, Play, ChevronRight,
  AlertCircle, BookOpen, Layers
} from 'lucide-react';
import { getActiveInterviewSessions, getMyInterviewSessions, createInterviewSession } from '../api/interview';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const InterviewDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeSessions, setActiveSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (showCreateModal && problems.length === 0) {
      fetchProblems();
    }
  }, [showCreateModal]);

  const fetchSessions = async () => {
    try {
      const [activeRes, myRes] = await Promise.all([
        getActiveInterviewSessions(),
        getMyInterviewSessions(),
      ]);
      setActiveSessions(activeRes?.sessions || []);
      setMySessions(myRes?.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load interview sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const response = await axiosClient.get('/problem/getAllProblem');
      let problemsData = [];
      
      if (response.data.message && Array.isArray(response.data.message)) {
        problemsData = response.data.message;
      } else if (response.data.problems) {
        problemsData = response.data.problems;
      } else if (Array.isArray(response.data)) {
        problemsData = response.data;
      }

      setProblems(problemsData);
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Could not load problems library');
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedProblem) {
      toast.error('Please select a problem');
      return;
    }

    setCreating(true);
    try {
      const response = await createInterviewSession(selectedProblem, selectedDifficulty);
      toast.success('Interview session created!');
      setShowCreateModal(false);
      setSelectedProblem('');
      setSelectedDifficulty('medium');
      navigate(`/interview/session/${response.session._id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.response?.data?.message || 'Failed to create interview session');
    } finally {
      setCreating(false);
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

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'active':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm font-medium">Loading interview dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentUserId = user?._id || user?.id;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Video size={13} />
                <span>1-on-1 Mock Interviews</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Interview Arena
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
                Practice realistic technical mock interviews with peers, integrated video calls, and synchronized code editors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Create Session
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Active Interview Rooms */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl font-bold text-white">Active Sessions</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {activeSessions.length} Available
              </span>
            </div>
          </div>

          {activeSessions.length === 0 ? (
            <div className="p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                <Video size={24} />
              </div>
              <h3 className="text-base font-semibold text-zinc-200 mb-1">No active interview rooms</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-5">
                There are no open peer interview rooms right now. Create a room to start practicing.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus size={16} /> Create Interview Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => navigate(`/interview/session/${session._id}`)}
                  className="p-6 rounded-3xl bg-zinc-900/60 border border-white/[0.08] hover:border-indigo-500/40 transition-all backdrop-blur-xl shadow-lg hover:shadow-indigo-500/10 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {session.problem?.title || 'Technical Interview Session'}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${getDifficultyBadge(session.difficulty)}`}>
                        {session.difficulty?.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-400 mb-6">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-indigo-400" />
                        <span>Host: {session.interviewer?.name || session.interviewer?.FirstName || 'Peer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-zinc-500" />
                        <span>Created {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-zinc-800 group-hover:bg-indigo-600 text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Join Workspace</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: My Interview History */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Layers size={18} className="text-indigo-400" />
              <h2 className="text-xl font-bold text-white">My Interview History</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {mySessions.length} Total
              </span>
            </div>
          </div>

          {mySessions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/60 text-center">
              <p className="text-sm text-zinc-500">You haven't participated in any interview sessions yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950/80 border-b border-white/[0.08] text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Problem</th>
                      <th className="px-6 py-4">Your Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {mySessions.map((session) => {
                      const isHost = session.interviewer?._id === currentUserId || session.interviewer?.id === currentUserId;
                      return (
                        <tr key={session._id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{session.problem?.title || 'Coding Problem'}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getDifficultyBadge(session.difficulty)}`}>
                              {session.difficulty?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isHost ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Interviewer
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Candidate
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(session.status)}`}>
                              {session.status?.toUpperCase() || 'COMPLETED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-400 font-mono">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate(`/interview/session/${session._id}`)}
                              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                            >
                              <span>View Session</span>
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Create Interview Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Create Interview Session</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure the problem and difficulty for your peer mock interview.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Problem
                </label>
                {loadingProblems ? (
                  <div className="flex items-center justify-center py-6 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="text-xs text-zinc-400">Loading problems library...</span>
                  </div>
                ) : problems.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                    No problems found in library.
                  </div>
                ) : (
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="">Choose a problem from library</option>
                    {problems.map((p) => (
                      <option key={p._id} value={p._id} className="bg-zinc-900">
                        {p.title} ({p.difficulty})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-zinc-500 mt-1.5">{problems.length} problem(s) available</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Target Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                        selectedDifficulty === diff
                          ? diff === 'easy'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : diff === 'medium'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !selectedProblem || loadingProblems}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Video size={16} />
                      <span>Launch Room</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDashboard;