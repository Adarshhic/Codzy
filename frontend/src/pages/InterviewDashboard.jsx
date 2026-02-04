import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { getActiveInterviewSessions, getMyInterviewSessions, createInterviewSession } from '../api/interview';
import axiosClient from '../utils/axiosClient';

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

  // Fetch problems when modal opens
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
      setActiveSessions(activeRes.sessions || []);
      setMySessions(myRes.sessions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      // Try multiple possible endpoints
      let response;
      
      try {
        // First try: /problem/getProblems
        response = await axiosClient.get('/problem/getProblems');
        console.log('Problems response (getProblems):', response.data);
      } catch (err) {
        console.log('Trying alternate endpoint...');
        // Second try: /problem/
        response = await axiosClient.get('/problem/');
        console.log('Problems response (/):', response.data);
      }

      // Handle different response structures
      let problemsData = [];
      
      if (response.data.problems) {
        problemsData = response.data.problems;
      } else if (Array.isArray(response.data)) {
        problemsData = response.data;
      } else if (response.data.data) {
        problemsData = response.data.data;
      }

      console.log('Parsed problems:', problemsData);
      setProblems(problemsData);
      
      if (problemsData.length === 0) {
        console.warn('No problems found. You may need to create problems first.');
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      console.error('Error details:', error.response?.data);
      
      // Show user-friendly error
      alert('Could not load problems. Please make sure problems exist in the system.');
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedProblem) {
      alert('Please select a problem');
      return;
    }

    setCreating(true);
    try {
      const response = await createInterviewSession(selectedProblem, selectedDifficulty);
      console.log('Session created:', response);
      setShowCreateModal(false);
      
      // Reset form
      setSelectedProblem('');
      setSelectedDifficulty('medium');
      
      // Navigate to the session
      navigate(`/interview/session/${response.session._id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert(error.response?.data?.message || 'Failed to create interview session');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading interview sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Interview Dashboard
              </h1>
              <p className="text-gray-400 mt-2">Manage your remote coding interviews</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Session
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Active Sessions */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Active Interview Sessions</h2>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
              {activeSessions.length} available
            </span>
          </div>

          {activeSessions.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Sessions</h3>
              <p className="text-gray-500 mb-4">There are no active interview sessions available to join right now</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition-colors"
              >
                Create First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer group"
                  onClick={() => navigate(`/interview/session/${session._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                      {session.problem?.title || 'Interview Session'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      session.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      session.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {session.difficulty?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Interviewer: {session.interviewer?.name || session.interviewer?.FirstName || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(session.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Sessions */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">My Interview Sessions</h2>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              {mySessions.length} total
            </span>
          </div>

          {mySessions.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Interview History</h3>
              <p className="text-gray-500">You haven't participated in any interviews yet</p>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problem</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {mySessions.map((session) => (
                      <tr key={session._id} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{session.problem?.title || 'Interview Session'}</div>
                          <div className={`text-xs mt-1 ${
                            session.difficulty === 'easy' ? 'text-green-400' :
                            session.difficulty === 'medium' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {session.difficulty?.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {session.interviewer?._id === user?._id || session.interviewer?._id === user?.id ? (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">Interviewer</span>
                          ) : (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">Candidate</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            session.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                            session.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {session.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/interview/session/${session._id}`)}
                            className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Create Interview Session</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Problem
                </label>
                {loadingProblems ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-400">Loading problems...</span>
                  </div>
                ) : problems.length === 0 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 text-center">
                    <p className="text-yellow-400 text-sm mb-2">⚠️ No problems available</p>
                    <p className="text-gray-400 text-xs">Please create problems first from the admin panel.</p>
                  </div>
                ) : (
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Choose a problem...</option>
                    {problems.map((problem) => (
                      <option key={problem._id} value={problem._id}>
                        {problem.title} ({problem.difficulty})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {problems.length} problem(s) available
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        selectedDifficulty === diff
                          ? diff === 'easy' ? 'bg-green-600 text-white ring-2 ring-green-400' :
                            diff === 'medium' ? 'bg-yellow-600 text-white ring-2 ring-yellow-400' :
                            'bg-red-600 text-white ring-2 ring-red-400'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !selectedProblem || loadingProblems}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Session
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