import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import Editorial from '../components/EditorialPage';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [videoData, setVideoData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const editorRef = useRef(null);
  let {problemId}  = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        console.log('Problem response:', response.data); // Debug log
        
        // Handle different response structures
        const problemData = response.data.problem || response.data;
        
        if (!problemData) {
          throw new Error('Problem data not found');
        }
        
        // Find initial code or set empty string
        const initialCode = problemData.startCode?.find(sc => sc.Language === langMap[selectedLanguage])?.initialCode || '';
        
        setProblem(problemData);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Fetch video data when editorial tab is clicked
  useEffect(() => {
    const fetchVideoData = async () => {
      if (activeLeftTab === 'editorial' && !videoData && !videoLoading) {
        setVideoLoading(true);
        try {
          const response = await axiosClient.get(`/video/get/${problemId}`);
          console.log('Video response:', response.data); // Debug log
          setVideoData(response.data.video);
        } catch (error) {
          console.error('Error fetching video:', error);
          if (error.response?.status === 404) {
            console.log('No video found for this problem');
          }
          setVideoData(null);
        } finally {
          setVideoLoading(false);
        }
      }
    };

    fetchVideoData();
  }, [activeLeftTab, problemId, videoData, videoLoading]);

  useEffect(() => {
    if (problem && problem.startCode) {
      const initialCode = problem.startCode.find(sc => sc.Language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit`, {
        problemId: problemId,
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-linear-to-br from-base-100 to-base-200">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r-2 border-primary/20 shadow-xl">
        {/* Left Tabs */}
        <div className="tabs tabs-boxed bg-base-300 p-2 m-2 rounded-lg shadow-md">
          <button 
            className={`tab transition-all duration-200 ${activeLeftTab === 'description' ? 'tab-active bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'}`}
            onClick={() => setActiveLeftTab('description')}
          >
            📝 Description
          </button>
          <button 
            className={`tab transition-all duration-200 ${activeLeftTab === 'editorial' ? 'tab-active bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'}`}
            onClick={() => setActiveLeftTab('editorial')}
          >
            🎥 Editorial
          </button>
          <button 
            className={`tab transition-all duration-200 ${activeLeftTab === 'submissions' ? 'tab-active bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'}`}
            onClick={() => setActiveLeftTab('submissions')}
          >
            📜 Submissions
          </button>
          <button 
            className={`tab transition-all duration-200 ${activeLeftTab === 'ai' ? 'tab-active bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'}`}
            onClick={() => setActiveLeftTab('ai')}
          >
            🤖 AI Help
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-base-100/50 backdrop-blur-sm">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-4 mb-6 p-4 bg-linear-to-r from-primary/10 to-secondary/10 rounded-xl shadow-sm">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {problem.title}
                    </h1>
                    <div className={`badge badge-lg ${getDifficultyColor(problem.difficulty)} font-semibold`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </div>
                    <div className="badge badge-lg badge-primary font-semibold">{problem.tags}</div>
                  </div>

                  <div className="prose max-w-none bg-base-100 p-6 rounded-xl shadow-md border border-base-300">
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">📚</span>
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases?.map((example, index) => (
                        <div key={index} className="bg-linear-to-br from-base-200 to-base-300 p-5 rounded-xl shadow-lg border border-primary/20 hover:border-primary/40 transition-all duration-200">
                          <h4 className="font-bold mb-3 text-primary flex items-center gap-2">
                            <span className="badge badge-primary badge-sm">{index + 1}</span>
                            Example {index + 1}
                          </h4>
                          <div className="space-y-2 text-sm font-mono bg-base-100 p-4 rounded-lg">
                            <div className="flex gap-2"><strong className="text-info">Input:</strong> <span className="text-base-content/80">{example.input.join(', ')}</span></div>
                            <div className="flex gap-2"><strong className="text-success">Output:</strong> <span className="text-base-content/80">{example.output.join(', ')}</span></div>
                            <div className="flex gap-2"><strong className="text-warning">Explanation:</strong> <span className="text-base-content/80">{example.explanation}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-2xl">🎥</span>
                    Video Editorial
                  </h2>

                  {videoLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : videoData ? (
                    <div className="space-y-6">
                      <Editorial 
                        secureUrl={videoData.secureUrl}
                        thumbnailUrl={videoData.thumbnailUrl}
                        duration={videoData.duration}
                      />
                      <div className="alert alert-success shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="font-bold">Video Editorial Available</h3>
                          <div className="text-sm">
                            Watch the complete solution explanation above
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-warning shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h3 className="font-bold">No Video Editorial Available</h3>
                        <div className="text-sm">
                          The video editorial for this problem hasn't been uploaded yet. Check back later!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="animate-fade-in">
                  <SubmissionHistory problemId={problemId} />
                </div>
              )}

              {activeLeftTab === 'ai' && (
                <div className="animate-fade-in">
                  <ChatAi problem={problem} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Same as before, keeping it unchanged */}
      <div className="w-1/2 flex flex-col shadow-2xl">
        <div className="tabs tabs-boxed bg-base-300 p-2 m-2 rounded-lg shadow-md">
          <button 
            className={`tab transition-all duration-200 ${activeRightTab === 'code' ? 'tab-active bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'}`}
            onClick={() => setActiveRightTab('code')}
          >
            💻 Code
          </button>
          <button 
            className={`tab transition-all duration-200 ${activeRightTab === 'testcase' ? 'tab-active bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'}`}
            onClick={() => setActiveRightTab('testcase')}
          >
            🧪 Testcase
          </button>
          <button 
            className={`tab transition-all duration-200 ${activeRightTab === 'result' ? 'tab-active bg-primary text-primary-content shadow-lg' : 'hover:bg-base-200'}`}
            onClick={() => setActiveRightTab('result')}
          >
            📊 Result
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b-2 border-primary/20 bg-linear-to-r from-base-200 to-base-300">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm transition-all duration-200 ${selectedLanguage === lang ? 'btn-primary shadow-lg scale-105' : 'btn-ghost hover:btn-outline hover:btn-primary'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? '⚡ C++' : lang === 'javascript' ? '🟨 JavaScript' : '☕ Java'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              <div className="p-4 border-t-2 border-primary/20 bg-linear-to-r from-base-200 to-base-300 flex justify-between shadow-inner">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-sm hover:btn-info transition-all duration-200"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    🖥️ Console
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    className={`btn btn-outline btn-primary btn-sm hover:scale-105 transition-all duration-200 ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {!loading && '▶️'} Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {!loading && '🚀'} Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto bg-base-100/50 backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <span className="text-2xl">🧪</span>
                Test Results
              </h3>
              {runResult ? (
                <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} shadow-xl border-2 ${runResult.success ? 'border-success' : 'border-error'}`}>
                  <div className="w-full">
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <span className="text-2xl">✅</span>
                          All test cases passed!
                        </h4>
                        <div className="flex gap-6 mt-3 text-sm">
                          <p className="badge badge-lg badge-success gap-2">⚡ Runtime: {runResult.runtime} sec</p>
                          <p className="badge badge-lg badge-success gap-2">💾 Memory: {runResult.memory} KB</p>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-4 rounded-xl shadow-md border-2 border-success/30 hover:border-success/60 transition-all duration-200">
                              <div className="font-mono text-xs space-y-2">
                                <div className="flex gap-2"><strong className="text-info">Input:</strong> <span>{tc.input}</span></div>
                                <div className="flex gap-2"><strong className="text-warning">Expected:</strong> <span>{tc.expected_output}</span></div>
                                <div className="flex gap-2"><strong className="text-success">Output:</strong> <span>{tc.output}</span></div>
                                <div className="badge badge-success gap-2">✓ Passed</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <span className="text-2xl">❌</span>
                          Test Failed
                        </h4>
                        {runResult.errorMessage && (
                          <div className="mt-2 p-3 bg-error/20 rounded">
                            <p className="text-sm">{runResult.errorMessage}</p>
                          </div>
                        )}
                        <div className="mt-6 space-y-3">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-4 rounded-xl shadow-md border-2 border-error/30">
                              <div className="font-mono text-xs space-y-2">
                                <div className="flex gap-2"><strong className="text-info">Input:</strong> <span>{tc.input}</span></div>
                                <div className="flex gap-2"><strong className="text-warning">Expected:</strong> <span>{tc.expected_output}</span></div>
                                <div className="flex gap-2"><strong className="text-error">Output:</strong> <span>{tc.output}</span></div>
                                <div className={`badge gap-2 ${tc.passed ? 'badge-success' : 'badge-error'}`}>
                                  {tc.passed ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="alert alert-info shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>Click "Run" to test your code with the example test cases.</span>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto bg-base-100/50 backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Submission Result
              </h3>
              {submitResult ? (
                <div className={`alert ${submitResult.submission?.status === 'accepted' ? 'alert-success' : 'alert-error'} shadow-xl border-2 ${submitResult.submission?.status === 'accepted' ? 'border-success' : 'border-error'}`}>
                  <div className="w-full">
                    {submitResult.submission?.status === 'accepted' ? (
                      <div>
                        <h4 className="font-bold text-2xl flex items-center gap-3 mb-4">
                          <span className="text-4xl">🎉</span>
                          Accepted!
                        </h4>
                        <div className="grid grid-cols-1 gap-3 mt-4">
                          <div className="stats shadow-lg bg-success/20">
                            <div className="stat">
                              <div className="stat-title">Test Cases</div>
                              <div className="stat-value text-success">{submitResult.submission.testCasesPassed}/{submitResult.submission.testCasesTotal}</div>
                              <div className="stat-desc">All tests passed ✓</div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="badge badge-lg badge-success gap-2 p-4">
                              ⚡ Runtime: {submitResult.submission.runtime} sec
                            </div>
                            <div className="badge badge-lg badge-success gap-2 p-4">
                              💾 Memory: {submitResult.submission.memory} KB
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-2xl flex items-center gap-3 mb-4">
                          <span className="text-4xl">❌</span>
                          {submitResult.message || 'Failed'}
                        </h4>
                        {submitResult.submission?.errorMessage && (
                          <div className="mt-2 p-3 bg-error/20 rounded">
                            <p className="text-sm">{submitResult.submission.errorMessage}</p>
                          </div>
                        )}
                        <div className="stats shadow-lg bg-error/20 mt-4">
                          <div className="stat">
                            <div className="stat-title">Test Cases</div>
                            <div className="stat-value text-error">{submitResult.submission?.testCasesPassed}/{submitResult.submission?.testCasesTotal}</div>
                            <div className="stat-desc">Failed - Try again!</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="alert alert-info shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>Click "Submit" to submit your solution for evaluation.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;