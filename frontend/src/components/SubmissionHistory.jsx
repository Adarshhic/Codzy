import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        
        console.log('Submission response:', response.data); // Debug log
        
        // Handle different response formats from backend
        if (typeof response.data === 'string') {
          // Backend returned string like "No Submission is present"
          console.log('Backend returned string:', response.data);
          setSubmissions([]);
        } else if (Array.isArray(response.data)) {
          // Backend returned array directly
          console.log('Backend returned array:', response.data);
          setSubmissions(response.data);
        } else if (response.data && Array.isArray(response.data.submissions)) {
          // Backend returned object with submissions property
          console.log('Backend returned object with submissions:', response.data.submissions);
          setSubmissions(response.data.submissions);
        } else if (response.data && response.data.message) {
          // Backend returned message object
          console.log('Backend returned message:', response.data.message);
          setSubmissions([]);
        } else {
          // Unknown format
          console.warn('Unknown response format:', response.data);
          setSubmissions([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        
        // Better error handling
        if (err.response?.status === 500) {
          setError('Server error: Please make sure Submission model is imported in backend.');
        } else if (err.response?.status === 404) {
          setError('No submissions found');
        } else {
          setError('Failed to fetch submission history');
        }
        
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'badge-success';
      case 'wrong': return 'badge-error';
      case 'error': return 'badge-warning';
      case 'pending': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-bold">{error}</span>
            {error.includes('Server error') && (
              <p className="text-sm mt-1">Add: const Submission = require("../models/Submission"); to userProblem.js</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check - ensure submissions is always an array
  const submissionsArray = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Submission History</h2>
      
      {submissionsArray.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>No submissions found for this problem. Submit your solution to see it here!</span>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Test Cases</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissionsArray.map((sub, index) => (
                  <tr key={sub._id || index}>
                    <td>{index + 1}</td>
                    <td className="font-mono">{sub.language || 'N/A'}</td>
                    <td>
                      <span className={`badge ${getStatusColor(sub.status)}`}>
                        {sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    
                    <td className="font-mono">{sub.runtime || 0} sec</td>
                    <td className="font-mono">{formatMemory(sub.memory)}</td>
                    <td className="font-mono">{sub.testCasesPassed || 0}/{sub.testCasesTotal || 0}</td>
                    <td>{formatDate(sub.createdAt)}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing {submissionsArray.length} submission{submissionsArray.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-lg mb-4">
              Submission Details: {selectedSubmission.language}
            </h3>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`badge ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <span className="badge badge-outline">
                  Runtime: {selectedSubmission.runtime || 0}s
                </span>
                <span className="badge badge-outline">
                  Memory: {formatMemory(selectedSubmission.memory)}
                </span>
                <span className="badge badge-outline">
                  Passed: {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                </span>
              </div>
              
              {selectedSubmission.errorMessage && (
                <div className="alert alert-error mt-2">
                  <div>
                    <span>{selectedSubmission.errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
            
            <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto">
              <code>{selectedSubmission.code || 'No code available'}</code>
            </pre>
            
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;