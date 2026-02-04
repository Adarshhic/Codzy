import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axiosClient.get('/problem/getAllProblem');
      
  
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setProblems(data);
      } else if (data && Array.isArray(data.problems)) {
        setProblems(data.problems);
      } else if (typeof data === 'string') {
        // Backend returned string like "Problem is Missing"
        setProblems([]);
        setError(data);
      } else {
        setProblems([]);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      
      if (err.response?.status === 404) {
        setError('No problems found');
        setProblems([]);
      } else {
        setError('Failed to fetch problems');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      // Remove the deleted problem from state
      setProblems(problems.filter(problem => problem._id !== id));
      
      // Show success message
      alert('Problem deleted successfully!');
    } catch (err) {
      console.error('Error deleting problem:', err);
      setError('Failed to delete problem');
      alert('Failed to delete problem: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && problems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error shadow-lg my-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Safety check - ensure problems is always an array
  const problemsArray = Array.isArray(problems) ? problems : [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delete Problems</h1>
        <button 
          className="btn btn-primary btn-sm"
          onClick={fetchProblems}
        >
          Refresh
        </button>
      </div>

      {problemsArray.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No problems available. Create some problems first!</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="w-1/12">#</th>
                <th className="w-4/12">Title</th>
                <th className="w-2/12">Difficulty</th>
                <th className="w-3/12">Tags</th>
                <th className="w-2/12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problemsArray.map((problem, index) => (
                <tr key={problem._id || index}>
                  <th>{index + 1}</th>
                  <td>{problem.title || 'Untitled'}</td>
                  <td>
                    <span className={`badge ${
                      problem.difficulty === 'Easy' 
                        ? 'badge-success' 
                        : problem.difficulty === 'Medium' 
                          ? 'badge-warning' 
                          : 'badge-error'
                    }`}>
                      {problem.difficulty || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-outline">
                      {problem.tags || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDelete(problem._id)}
                        className="btn btn-sm btn-error"
                        disabled={!problem._id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <p className="mt-4 text-sm text-gray-500">
            Showing {problemsArray.length} problem{problemsArray.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDelete;