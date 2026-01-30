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
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF5] via-[#F8F9FA] to-[#FFF8F0]">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 px-8 py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-[#7000FF] to-[#2DD4BF] bg-clip-text text-transparent">
                Study Groups
              </h1>
              <p className="text-slate-600 mt-2">
                Collaborate and solve problems together
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowJoinModal(true)}
                className="btn btn-outline gap-2"
              >
                <LogIn size={20} />
                Join Group
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary gap-2"
              >
                <Plus size={20} />
                Create Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="container mx-auto p-8 max-w-7xl">
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <Users size={64} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              No Study Groups Yet
            </h2>
            <p className="text-slate-500 mb-6">
              Create a group or join one with an invite code
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowJoinModal(true)}
                className="btn btn-outline"
              >
                <LogIn size={20} />
                Join Group
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Create Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <NavLink
                key={group._id}
                to={`/study-groups/${group._id}`}
                className="card bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/60"
              >
                <div className="card-body">
                  <h2 className="card-title text-xl font-bold text-slate-800">
                    {group.name}
                  </h2>
                  
                  {group.description && (
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4 text-sm">
                    <div className="badge badge-primary gap-1">
                      <Users size={14} />
                      {group.memberCount || 0} members
                    </div>
                    
                    {group.userRole === 'admin' && (
                      <div className="badge badge-success">Admin</div>
                    )}
                    
                    {group.isPrivate && (
                      <div className="badge badge-ghost">Private</div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                    Invite Code: <span className="font-mono font-bold text-slate-700">{group.inviteCode}</span>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create Study Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Group Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., DSA Warriors"
                  className="input input-bordered"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description (Optional)</span>
                </label>
                <textarea
                  placeholder="What's your group about?"
                  className="textarea textarea-bordered"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  maxLength={500}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Members</span>
                </label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  className="input input-bordered"
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({...createForm, maxMembers: parseInt(e.target.value)})}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Private Group</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={createForm.isPrivate}
                    onChange={(e) => setCreateForm({...createForm, isPrivate: e.target.checked})}
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Join Study Group</h3>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Invite Code</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter 8-character code"
                  className="input input-bordered font-mono uppercase"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  maxLength={8}
                />
                <label className="label">
                  <span className="label-text-alt">
                    Ask your group admin for the invite code
                  </span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={inviteCode.length !== 8}
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