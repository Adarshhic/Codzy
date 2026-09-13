import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink, useNavigate } from 'react-router';
import { 
  Video, Upload, Trash2, ArrowLeft, Search, RefreshCw, 
  Film, Sparkles, CheckCircle2
} from 'lucide-react';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

const AdminVideo = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.problems)) {
        list = data.problems;
      } else if (data && Array.isArray(data.message)) {
        list = data.message;
      }
      setProblems(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch problems');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the video solution for "${title || 'this problem'}"?`)) return;
    
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      toast.success('Video solution deleted');
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Failed to delete video');
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

  const filteredProblems = problems.filter((p) => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Admin Center</span>
          </button>
          <span>/</span>
          <span className="text-zinc-200 font-medium">Video Management</span>
        </div>

        {/* Header Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl mb-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Film size={14} />
              <span>Editorial Content</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Solution Video Management</h1>
            <p className="text-zinc-400 text-sm">
              Upload video walkthroughs directly to Cloudinary or remove attached explanations.
            </p>
          </div>

          <button
            onClick={fetchProblems}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search problem title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Loading problem catalog...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800">
            <p className="text-zinc-400 text-sm">No problems found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/80 border-b border-white/[0.08] text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-16">#</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredProblems.map((problem, index) => {
                    const probId = problem._id || problem.id;
                    return (
                      <tr key={probId || index} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          {problem.title || 'Untitled Problem'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyBadge(problem.difficulty)}`}>
                            {problem.difficulty || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50 text-xs font-mono">
                            {problem.tags || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <NavLink
                              to={`/admin/upload/${probId}`}
                              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                            >
                              <Upload size={13} />
                              <span>Upload Video</span>
                            </NavLink>
                            <button
                              onClick={() => handleDelete(probId, problem.title)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                            >
                              <Trash2 size={13} />
                              <span>Delete Video</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminVideo;