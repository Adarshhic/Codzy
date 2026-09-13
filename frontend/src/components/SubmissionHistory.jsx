import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { CheckCircle2, XCircle, AlertCircle, Clock, Code, X, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        
        if (typeof response.data === 'string') {
          setSubmissions([]);
        } else if (Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else if (response.data && Array.isArray(response.data.submissions)) {
          setSubmissions(response.data.submissions);
        } else {
          setSubmissions([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to fetch submission history');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId]);

  const handleCopyCode = async (code) => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Accepted
        </span>
      );
    }
    if (s === 'wrong') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" />
          Wrong Answer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" />
        {status || 'Error'}
      </span>
    );
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    if (memory < 1024) return `${memory} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
        {error}
      </div>
    );
  }

  const submissionsArray = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Submission History</h3>
        <span className="text-xs text-zinc-500 font-mono">{submissionsArray.length} submissions</span>
      </div>

      {submissionsArray.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900/40 border border-white/[0.06] p-8 text-center space-y-2">
          <Clock className="w-6 h-6 text-zinc-500 mx-auto" />
          <p className="text-xs font-semibold text-zinc-300">No submissions yet</p>
          <p className="text-[11px] text-zinc-500">Run and submit your code to see your performance timeline here.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900/40 border border-white/[0.08] overflow-hidden divide-y divide-white/[0.05]">
          <div className="grid grid-cols-12 px-4 py-2.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950/60">
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Lang</div>
            <div className="col-span-2">Runtime</div>
            <div className="col-span-3">Submitted</div>
            <div className="col-span-2 text-right">View</div>
          </div>

          {submissionsArray.map((sub, idx) => (
            <div
              key={sub._id || idx}
              className="grid grid-cols-12 items-center px-4 py-3 text-xs text-zinc-300 hover:bg-white/[0.02] transition-colors"
            >
              <div className="col-span-3">{getStatusBadge(sub.status)}</div>
              <div className="col-span-2 font-mono text-zinc-400">{sub.language || 'JS'}</div>
              <div className="col-span-2 font-mono text-zinc-400">{sub.runtime || 0}s</div>
              <div className="col-span-3 text-[11px] text-zinc-500">{formatDate(sub.createdAt)}</div>
              <div className="col-span-2 text-right">
                <button
                  onClick={() => setSelectedSubmission(sub)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 transition-colors"
                >
                  Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/[0.1] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-white capitalize">{selectedSubmission.language} Solution</span>
                {getStatusBadge(selectedSubmission.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(selectedSubmission.code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs">
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={selectedSubmission.language === 'cpp' ? 'cpp' : selectedSubmission.language === 'java' ? 'java' : 'javascript'}
                customStyle={{ margin: 0, padding: '16px', borderRadius: '12px', background: '#09090b' }}
              >
                {selectedSubmission.code || '// No code stored'}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;