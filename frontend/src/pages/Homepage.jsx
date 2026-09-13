import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Filter, 
  Sparkles, 
  Code2, 
  Flame, 
  SlidersHorizontal,
  X,
  Layers,
  ChevronRight
} from 'lucide-react';

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [probRes, solvedRes] = await Promise.allSettled([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser')
        ]);

        if (probRes.status === 'fulfilled' && probRes.value.data) {
          setProblems(probRes.value.data.problems || []);
        }
        if (solvedRes.status === 'fulfilled' && solvedRes.value.data) {
          setSolvedProblems(solvedRes.value.data.problems || []);
        }
      } catch (error) {
        console.error('Error fetching problems data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const solvedIds = new Set(solvedProblems.map(p => p._id));

  const filteredProblems = problems.filter(problem => {
    const isSolved = solvedIds.has(problem._id);
    
    // Search query filter
    const matchesSearch = !searchQuery.trim() || 
      problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags?.toLowerCase().includes(searchQuery.toLowerCase());

    // Difficulty filter
    const matchesDifficulty = filters.difficulty === 'all' || 
      problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

    // Tag filter
    const matchesTag = filters.tag === 'all' || 
      problem.tags?.toLowerCase() === filters.tag.toLowerCase();

    // Status filter
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'solved' && isSolved) ||
      (filters.status === 'unsolved' && !isSolved);

    return matchesSearch && matchesDifficulty && matchesTag && matchesStatus;
  });

  const totalCount = problems.length;
  const solvedCount = solvedProblems.length;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Extract unique tags for filter pills
  const availableTags = ['all', ...Array.from(new Set(problems.map(p => p.tags).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Header & Progress Card */}
        <div className="rounded-3xl bg-zinc-900/60 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Code2 className="w-3.5 h-3.5" />
                <span>Curated Problem Bank</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                DSA Problem Explorer
              </h1>
              <p className="text-sm text-zinc-400">
                Sharpen your problem-solving intuition across {totalCount} algorithmic challenges.
              </p>
            </div>

            {/* Live Progress Pill */}
            <div className="w-full md:w-80 bg-zinc-950/60 border border-white/[0.08] p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Completion Tracker</span>
                <span className="font-mono font-bold text-indigo-400">{solvedCount} / {totalCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Search Bar & Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
            
            {/* Search input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/60 border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Difficulty Selector */}
            <div className="md:col-span-3">
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full py-2.5 px-3.5 bg-zinc-950/60 border border-white/[0.08] rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="md:col-span-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full py-2.5 px-3.5 bg-zinc-950/60 border border-white/[0.08] rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>

          </div>

          {/* Tag Pills */}
          {availableTags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-zinc-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Tags:
              </span>
              {availableTags.map((tag) => {
                const isSelected = filters.tag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setFilters({ ...filters, tag })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-white/[0.05]'
                    }`}
                  >
                    {tag === 'all' ? 'All Topics' : tag}
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Problems List Table / Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 font-medium">Loading problems catalog...</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="rounded-3xl bg-zinc-900/30 border border-white/[0.06] p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No problems found</h3>
                <p className="text-xs text-zinc-500">
                  Try adjusting your search keywords or clearing active filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-zinc-900/40 border border-white/[0.08] backdrop-blur-xl overflow-hidden divide-y divide-white/[0.05]">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-12 px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-950/40">
                <div className="col-span-1">Status</div>
                <div className="col-span-6">Problem Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {/* Rows */}
              {filteredProblems.map((prob, index) => {
                const isSolved = solvedIds.has(prob._id);
                const diffBadge = 
                  prob.difficulty?.toLowerCase() === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  prob.difficulty?.toLowerCase() === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-rose-400 bg-rose-500/10 border-rose-500/20';

                return (
                  <NavLink
                    key={prob._id}
                    to={`/problem/${prob._id}`}
                    className="grid grid-cols-1 sm:grid-cols-12 items-center px-6 py-4 hover:bg-white/[0.03] transition-all group gap-2 sm:gap-0"
                  >
                    {/* Status */}
                    <div className="col-span-1 flex items-center gap-2">
                      {isSolved ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-800/80 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                          <Circle className="w-3 h-3 text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="col-span-6 pr-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-500 group-hover:text-indigo-400 transition-colors">
                          #{index + 1}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                          {prob.title}
                        </h3>
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2">
                      <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diffBadge}`}>
                        {prob.difficulty}
                      </span>
                    </div>

                    {/* Category Tag */}
                    <div className="col-span-2">
                      <span className="text-xs text-zinc-400 font-medium capitalize bg-zinc-800/50 border border-white/[0.04] px-2.5 py-1 rounded-md">
                        {prob.tags || 'General'}
                      </span>
                    </div>

                    {/* Action Arrow */}
                    <div className="col-span-1 flex justify-end">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800/40 group-hover:bg-indigo-600 group-hover:text-white text-zinc-400 flex items-center justify-center transition-all">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default Homepage;