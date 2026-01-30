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
      case 'admin': return <Crown size={16} className="text-yellow-500" />;
      case 'moderator': return <Shield size={16} className="text-blue-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const canStartSession = group?.userRole === 'admin' || group?.userRole === 'moderator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#F8F9FA] to-[#FFF8F0]">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 px-8 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-slate-800">
                  {group?.name}
                </h1>
                {group?.userRole === 'admin' && (
                  <div className="badge badge-warning gap-1">
                    <Crown size={14} />
                    Admin
                  </div>
                )}
              </div>
              <p className="text-slate-600">{group?.description}</p>
            </div>
            <div className="flex gap-3">
              {activeSession ? (
                <button 
                  onClick={handleJoinSession}
                  className="btn btn-success gap-2"
                >
                  <Play size={20} />
                  Join Active Session
                </button>
              ) : canStartSession && (
                <button 
                  onClick={() => setShowStartSessionModal(true)}
                  className="btn btn-primary gap-2"
                >
                  <Play size={20} />
                  Start Session
                </button>
              )}
              <button 
                onClick={handleLeaveGroup}
                className="btn btn-error btn-outline gap-2"
              >
                <LogOut size={20} />
                Leave Group
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info & Invite */}
          <div className="space-y-6">
            {/* Invite Code Card */}
            <div className="card bg-white/90 backdrop-blur-sm shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg">Invite Code</h2>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-100 px-4 py-3 rounded-lg font-mono text-xl font-bold text-center">
                    {group?.inviteCode}
                  </code>
                  <button 
                    onClick={copyInviteCode}
                    className="btn btn-square btn-ghost"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Members Card */}
            <div className="card bg-white/90 backdrop-blur-sm shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Users size={20} />
                  Members ({members.length}/{group?.maxMembers})
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {members.map((member) => (
                    <div 
                      key={member._id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span className="font-medium">
                          {member.userId.FirstName}
                        </span>
                      </div>
                      <div className="badge badge-sm">
                        {member.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Progress */}
          <div className="lg:col-span-2">
            <div className="card bg-white/90 backdrop-blur-sm shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">Group Progress</h2>
                
                {progress.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>No problems solved yet</p>
                    <p className="text-sm">Start a session to begin solving together!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {progress.map((item) => (
                      <div 
                        key={item._id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">
                            {item.problemId.title}
                          </h3>
                          <div className="flex gap-2">
                            <div className={`badge ${
                              item.problemId.difficulty === 'easy' ? 'badge-success' :
                              item.problemId.difficulty === 'medium' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {item.problemId.difficulty}
                            </div>
                            <div className="badge badge-outline">
                              {item.problemId.tags}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600">
                          Solved by {item.solvedBy.length} member{item.solvedBy.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.solvedBy.map((solver) => (
                            <div key={solver._id} className="badge badge-sm badge-primary">
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
      </div>

      {/* Start Session Modal */}
      {showStartSessionModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Start New Session</h3>
            <form onSubmit={handleStartSession} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Problem</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedProblem}
                  onChange={(e) => setSelectedProblem(e.target.value)}
                  required
                >
                  <option value="">Choose a problem</option>
                  {problems.map((problem) => (
                    <option key={problem._id} value={problem._id}>
                      {problem.title} ({problem.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowStartSessionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!selectedProblem}
                >
                  Start Session
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