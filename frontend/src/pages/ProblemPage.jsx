import { useState, useEffect, useRef } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router';
import Editor from '@monaco-editor/react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import Editorial from '../components/EditorialPage';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Play, 
  Send, 
  Clock, 
  Pause, 
  RotateCcw, 
  FileText, 
  Video, 
  History, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Terminal, 
  Zap, 
  Sparkles,
  ChevronDown,
  Maximize2,
  Minimize2,
  Copy,
  Check
} from 'lucide-react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [bottomTab, setBottomTab] = useState('run'); // 'run' or 'submit'
  
  const [videoData, setVideoData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [copiedExampleIndex, setCopiedExampleIndex] = useState(null);
  
  const editorRef = useRef(null);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const problemData = response.data.problem || response.data;
        
        if (!problemData) throw new Error('Problem data not found');
        
        const initialCode = problemData.startCode?.find(sc => sc.Language === langMap[selectedLanguage])?.initialCode || '';
        
        setProblem(problemData);
        setCode(initialCode);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Fetch video data when editorial tab is opened
  useEffect(() => {
    const fetchVideoData = async () => {
      if (activeLeftTab === 'editorial' && !videoData && !videoLoading) {
        setVideoLoading(true);
        try {
          const response = await axiosClient.get(`/video/get/${problemId}`);
          setVideoData(response.data.video);
        } catch (error) {
          console.error('Error fetching video:', error);
          setVideoData(null);
        } finally {
          setVideoLoading(false);
        }
      }
    };

    fetchVideoData();
  }, [activeLeftTab, problemId, videoData, videoLoading]);

  // Update initial code when language changes
  useEffect(() => {
    if (problem && problem.startCode) {
      const initialCode = problem.startCode.find(sc => sc.Language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setBottomDrawerOpen(true);
    setBottomTab('run');
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: error.response?.data?.message || 'Compilation or runtime error occurred'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    setBottomDrawerOpen(true);
    setBottomTab('submit');
    
    try {
      const response = await axiosClient.post(`/submission/submit`, {
        problemId: problemId,
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);

      if (response.data.submission?.status === 'accepted' || response.data.status === 'accepted') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        success: false,
        message: 'Submission failed. Please check your network or try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyExample = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedExampleIndex(idx);
    setTimeout(() => setCopiedExampleIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Initializing workspace...</p>
      </div>
    );
  }

  const diffBadge = 
    problem?.difficulty?.toLowerCase() === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    problem?.difficulty?.toLowerCase() === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
    'text-rose-400 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="h-screen bg-[#09090b] text-white flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Workspace Navigation Bar */}
      <header className="h-14 border-b border-white/[0.08] bg-zinc-950 px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/problems')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Problems</span>
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {problem?.title || 'Code Workspace'}
            </h1>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffBadge}`}>
              {problem?.difficulty}
            </span>
          </div>
        </div>

        {/* Stopwatch & Action controls */}
        <div className="flex items-center gap-3">
          {/* Stopwatch */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-zinc-500 hover:text-white transition-colors"
              title={timerRunning ? "Pause Timer" : "Start Timer"}
            >
              {timerRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="text-zinc-500 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Language Picker */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="appearance-none bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            {running ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run</span>
          </button>

          {/* Submit Code Button */}
          <button
            onClick={handleSubmitCode}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: Description / Editorial / Submissions / AI */}
        <div className="w-full md:w-1/2 h-full flex flex-col border-r border-white/[0.08] bg-zinc-950/60 overflow-hidden">
          
          {/* Left Tab Bar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-white/[0.08] bg-zinc-950 flex-shrink-0">
            {[
              { id: 'description', label: 'Description', icon: FileText },
              { id: 'editorial', label: 'Editorial', icon: Video },
              { id: 'submissions', label: 'Submissions', icon: History },
              { id: 'ai', label: 'AI Tutor', icon: Bot },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeLeftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLeftTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-white/[0.06]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 select-text">
            
            {activeLeftTab === 'description' && problem && (
              <div className="space-y-6 animate-fadeIn">
                {/* Title & tags */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {problem.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diffBadge}`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium capitalize bg-zinc-900 border border-white/[0.06] px-2.5 py-0.5 rounded-md">
                      {problem.tags || 'General'}
                    </span>
                  </div>
                </div>

                {/* Problem Description text */}
                <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap">
                  {problem.description}
                </div>

                {/* Example Test Cases */}
                {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                      Examples
                    </h3>

                    {problem.visibleTestCases.map((example, idx) => (
                      <div 
                        key={idx}
                        className="rounded-2xl bg-zinc-900/70 border border-white/[0.08] p-4 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-400">
                            Example {idx + 1}
                          </span>
                          <button
                            onClick={() => handleCopyExample(Array.isArray(example.input) ? example.input.join(', ') : example.input, idx)}
                            className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                            title="Copy input"
                          >
                            {copiedExampleIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-white/[0.04]">
                            <span className="text-zinc-500 font-sans font-semibold">Input: </span>
                            <span className="text-zinc-200">
                              {Array.isArray(example.input) ? example.input.join(', ') : example.input}
                            </span>
                          </div>

                          <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-white/[0.04]">
                            <span className="text-zinc-500 font-sans font-semibold">Output: </span>
                            <span className="text-emerald-400">
                              {Array.isArray(example.output) ? example.output.join(', ') : example.output}
                            </span>
                          </div>

                          {example.explanation && (
                            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-white/[0.04] text-zinc-400 font-sans">
                              <span className="text-zinc-500 font-semibold">Explanation: </span>
                              <span>{example.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'editorial' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Video Solution & Walkthrough</h3>
                  <p className="text-xs text-zinc-400">
                    Watch the comprehensive breakdown and time/space complexity proof.
                  </p>
                </div>

                {videoLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : videoData ? (
                  <Editorial 
                    secureUrl={videoData.secureUrl}
                    thumbnailUrl={videoData.thumbnailUrl}
                    duration={videoData.duration}
                  />
                ) : (
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/[0.06] text-center space-y-2">
                    <Video className="w-8 h-8 text-zinc-500 mx-auto" />
                    <p className="text-sm font-semibold text-zinc-300">No Video Editorial Available</p>
                    <p className="text-xs text-zinc-500">Video breakdown for this problem has not been uploaded yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div className="animate-fadeIn">
                <SubmissionHistory problemId={problemId} />
              </div>
            )}

            {activeLeftTab === 'ai' && (
              <div className="h-full animate-fadeIn">
                <ChatAi problem={problem} />
              </div>
            )}

          </div>
        </div>

        {/* Right Panel: Monaco Editor & Interactive Testcase Console */}
        <div className="w-full md:w-1/2 h-full flex flex-col bg-zinc-950 overflow-hidden relative">
          
          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'java' ? 'java' : 'javascript'}
              value={code}
              onChange={(v) => setCode(v || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13.5,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                renderLineHighlight: 'all',
                suggestOnTriggerCharacters: true,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>

          {/* Bottom Testcase & Submission Result Drawer */}
          <div className={`border-t border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl transition-all duration-300 flex flex-col ${
            bottomDrawerOpen ? 'h-64' : 'h-10'
          }`}>
            {/* Drawer Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBottomTab('run');
                    setBottomDrawerOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    bottomTab === 'run'
                      ? 'bg-zinc-800 text-white border border-white/[0.06]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Test Results</span>
                </button>

                <button
                  onClick={() => {
                    setBottomTab('submit');
                    setBottomDrawerOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    bottomTab === 'submit'
                      ? 'bg-zinc-800 text-white border border-white/[0.06]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Submission</span>
                </button>
              </div>

              <button
                onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}
                className="text-zinc-500 hover:text-white p-1 rounded transition-colors"
              >
                {bottomDrawerOpen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Drawer Body */}
            {bottomDrawerOpen && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs select-text">
                {bottomTab === 'run' && (
                  runResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {runResult.success ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-sans">
                              <CheckCircle2 className="w-4 h-4" />
                              All test cases passed!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-rose-400 font-bold font-sans">
                              <XCircle className="w-4 h-4" />
                              Test failed
                            </span>
                          )}
                        </div>

                        {runResult.runtime && (
                          <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
                            <span>⚡ Runtime: {runResult.runtime}s</span>
                            <span>💾 Memory: {runResult.memory}KB</span>
                          </div>
                        )}
                      </div>

                      {runResult.errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                          {runResult.errorMessage}
                        </div>
                      )}

                      {runResult.testCases?.map((tc, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-bold text-zinc-400">Test Case #{idx + 1}</span>
                            <span className={tc.passed ? 'text-emerald-400' : 'text-rose-400'}>
                              {tc.passed ? 'Passed ✓' : 'Failed ✗'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 text-zinc-300">
                            <div><span className="text-zinc-500">Input: </span>{tc.input}</div>
                            <div><span className="text-zinc-500">Expected: </span>{tc.expected_output}</div>
                            <div><span className="text-zinc-500">Output: </span>{tc.output}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-500 py-6 text-center">
                      Click <strong className="text-zinc-300">Run</strong> to execute code against visible test cases.
                    </div>
                  )
                )}

                {bottomTab === 'submit' && (
                  submitResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(submitResult.submission?.status === 'accepted' || submitResult.status === 'accepted') ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-sans text-sm">
                              <CheckCircle2 className="w-5 h-5" />
                              Accepted Solution! 🎉
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-rose-400 font-bold font-sans text-sm">
                              <XCircle className="w-5 h-5" />
                              {submitResult.message || 'Submission Rejected'}
                            </span>
                          )}
                        </div>

                        {submitResult.submission?.runtime && (
                          <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
                            <span>⚡ Runtime: {submitResult.submission.runtime}s</span>
                            <span>💾 Memory: {submitResult.submission.memory}KB</span>
                            <span>✓ Passed: {submitResult.submission.testCasesPassed}/{submitResult.submission.testCasesTotal}</span>
                          </div>
                        )}
                      </div>

                      {submitResult.submission?.errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                          {submitResult.submission.errorMessage}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-zinc-500 py-6 text-center">
                      Click <strong className="text-zinc-300">Submit</strong> to evaluate all hidden test cases.
                    </div>
                  )
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProblemPage;