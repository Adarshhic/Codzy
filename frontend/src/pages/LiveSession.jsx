import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { 
  Users, MessageSquare, Code, Send, LogOut, Radio, 
  Sparkles, CheckCircle2, ChevronRight, Share2, 
  Terminal, ArrowLeft, Lock, Unlock, Zap, FileCode2
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { initializeSocket, getSocket, disconnectSocket } from '../utils/socket';
import useStudyGroupStore from '../store/studyGroupStore';
import toast from 'react-hot-toast';

function LiveSession() {
  const { groupId, sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const {
    activeSession,
    setActiveSession,
    participants,
    setParticipants,
    addParticipant,
    removeParticipant,
    messages,
    setMessages,
    addMessage,
    sharedCode,
    setSharedCode,
    sharedLanguage,
    setSharedLanguage,
    typingUsers,
    addTypingUser,
    removeTypingUser,
    reset
  } = useStudyGroupStore();

  const [problem, setProblem] = useState(null);
  const [localCode, setLocalCode] = useState('// Write your solution here\n\nfunction solution() {\n  \n}');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCodeSharing, setIsCodeSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'testcases'
  
  const messagesEndRef = useRef(null);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const messageIdsRef = useRef(new Set());

  useEffect(() => {
    initializeSessionAndSocket();
    
    return () => {
      handleLeaveSession();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSessionAndSocket = async () => {
    try {
      // Fetch session details
      const { data } = await axiosClient.get(`/study-groups/${groupId}/session/active`);
      
      if (!data.session || data.session._id !== sessionId) {
        toast.error('Session not found or inactive');
        navigate(`/study-groups/${groupId}`);
        return;
      }

      setActiveSession(data.session);
      setProblem(data.session.problemId);
      
      // Set starter code if available
      if (data.session.problemId?.startCode && data.session.problemId.startCode.length > 0) {
        const jsStart = data.session.problemId.startCode.find(s => s.language?.toLowerCase() === 'javascript');
        if (jsStart?.initialCode) {
          setLocalCode(jsStart.initialCode);
        }
      }

      // Fetch existing messages FIRST
      const messagesRes = await axiosClient.get(`/study-groups/${groupId}/messages?sessionId=${sessionId}`);
      const existingMessages = messagesRes.data.messages || [];
      
      messageIdsRef.current = new Set(existingMessages.map(m => m._id));
      setMessages(existingMessages);
      
      // Initialize socket AFTER fetching messages
      socketRef.current = initializeSocket(user._id || user.id, user.FirstName || 'Anonymous');
      setupSocketListeners();
      
      // Join the room
      socketRef.current.emit('join-room', {
        roomId: `session-${sessionId}`,
        groupId: groupId,
        sessionId: sessionId
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to join session');
      navigate(`/study-groups/${groupId}`);
    }
  };

  const setupSocketListeners = () => {
    const socket = socketRef.current;

    socket.on('room-users', ({ participants: roomParticipants }) => {
      setParticipants(roomParticipants);
    });

    socket.on('user-joined', ({ userId, username }) => {
      addParticipant({ userId, username });
      toast.success(`${username} joined room`);
    });

    socket.on('user-left', ({ userId, username }) => {
      removeParticipant(userId);
      toast(`${username} left room`, { icon: '👋' });
    });

    socket.on('receive-message', (msg) => {
      if (!messageIdsRef.current.has(msg._id)) {
        messageIdsRef.current.add(msg._id);
        addMessage(msg);
      }
    });

    socket.on('code-updated', ({ userId, username, code, language }) => {
      if (isCodeSharing) {
        setSharedCode(code);
        setSharedLanguage(language);
      }
    });

    socket.on('problem-changed', async ({ problemId, problemTitle }) => {
      toast.success(`Problem changed: ${problemTitle}`);
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(data.problem || data);
      } catch (error) {
        console.error('Error fetching new problem:', error);
      }
    });

    socket.on('user-solved-problem', ({ username, problemTitle }) => {
      toast.success(`🎉 ${username} solved ${problemTitle}!`, { duration: 5000 });
    });

    socket.on('user-typing', ({ username }) => {
      addTypingUser(username);
    });

    socket.on('error', ({ message }) => {
      toast.error(message);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socketRef.current?.emit('send-message', {
      roomId: `session-${sessionId}`,
      groupId: groupId,
      sessionId: sessionId,
      message: message.trim(),
      messageType: 'text'
    });

    setMessage('');
  };

  const handleCodeChange = (value) => {
    setLocalCode(value || '');
    
    if (isCodeSharing && socketRef.current) {
      socketRef.current.emit('code-change', {
        roomId: `session-${sessionId}`,
        code: value || '',
        language: selectedLanguage
      });
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (isCodeSharing && socketRef.current) {
      socketRef.current.emit('code-change', {
        roomId: `session-${sessionId}`,
        code: localCode,
        language: lang
      });
    }
  };

  const toggleCodeSharing = () => {
    const nextState = !isCodeSharing;
    setIsCodeSharing(nextState);
    if (nextState) {
      toast.success('Live code broadcasting enabled');
      if (socketRef.current) {
        socketRef.current.emit('code-change', {
          roomId: `session-${sessionId}`,
          code: localCode,
          language: selectedLanguage
        });
      }
    } else {
      toast('Broadcast disabled — local edit mode', { icon: '🔒' });
    }
  };

  const handleLeaveSession = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', {
        roomId: `session-${sessionId}`,
        groupId: groupId
      });
    }
    messageIdsRef.current.clear();
    reset();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLanguageForMonaco = (lang) => {
    const map = {
      javascript: 'javascript',
      java: 'java',
      cpp: 'cpp',
      python: 'python'
    };
    return map[lang] || 'javascript';
  };

  const uniqueMessages = messages.filter((msg, index, self) => 
    index === self.findIndex((m) => m._id === msg._id)
  );

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

  if (loading) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Connecting to live study room...</p>
        </div>
      </div>
    );
  }

  const currentUserId = user?._id || user?.id;

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-zinc-100 antialiased overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-zinc-950/80 border-b border-white/[0.08] backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/study-groups/${groupId}`)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1 text-xs"
            title="Return to group"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Group</span>
          </button>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h1 className="font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md">
              {problem?.title || 'Live Coding Session'}
            </h1>
            {problem?.difficulty && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getDifficultyBadge(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Participants Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 font-medium">
            <Users size={14} className="text-indigo-400" />
            <span>{participants.length}</span>
            <span className="text-zinc-500 hidden sm:inline">online</span>
          </div>

          {/* Share Code Toggle */}
          <button
            onClick={toggleCodeSharing}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              isCodeSharing 
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/20' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isCodeSharing ? (
              <>
                <Share2 size={14} className="text-indigo-400 animate-pulse" />
                <span>Broadcasting</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Local Only</span>
              </>
            )}
          </button>

          {/* Leave Button */}
          <button
            onClick={() => navigate(`/study-groups/${groupId}`)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Problem Description & Cases */}
        <div className="w-1/3 min-w-[320px] max-w-[480px] bg-zinc-950/60 border-r border-white/[0.08] flex flex-col overflow-hidden">
          {/* Tab Header */}
          <div className="h-10 px-4 border-b border-white/[0.08] bg-zinc-950/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'description'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('testcases')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'testcases'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Examples ({problem?.visibleTestCases?.length || 0})
              </button>
            </div>
            {problem?.tags && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                {problem.tags}
              </span>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
            {activeTab === 'description' ? (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Problem Statement</h2>
                <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                  {problem?.description || 'No description provided.'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Example Test Cases</h2>
                {problem?.visibleTestCases && problem.visibleTestCases.length > 0 ? (
                  problem.visibleTestCases.map((tc, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                        <span>Example {i + 1}</span>
                      </div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80">
                          <span className="text-zinc-500">Input: </span>
                          <span className="text-indigo-300">{Array.isArray(tc.input) ? tc.input.join(', ') : tc.input}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80">
                          <span className="text-zinc-500">Output: </span>
                          <span className="text-emerald-400">{Array.isArray(tc.output) ? tc.output.join(', ') : tc.output}</span>
                        </div>
                        {tc.explanation && (
                          <div className="text-zinc-400 font-sans text-xs pt-1">
                            <span className="font-semibold text-zinc-500">Explanation: </span>
                            {tc.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">No example test cases available for this challenge.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Collaborative Monaco Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] border-r border-white/[0.08] overflow-hidden">
          {/* Editor Language / Status Toolbar */}
          <div className="h-10 bg-zinc-950/90 border-b border-white/[0.08] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <FileCode2 size={14} className="text-indigo-400" />
              {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedLanguage === lang
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {isCodeSharing ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[11px]">
                  <Share2 size={11} /> Syncing
                </span>
              ) : (
                <span className="text-zinc-500 text-[11px] font-mono">Local Draft</span>
              )}
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={getLanguageForMonaco(selectedLanguage)}
              value={isCodeSharing ? sharedCode : localCode}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>
        </div>

        {/* Right Column: Participants & Real-time Room Chat */}
        <div className="w-80 min-w-[280px] bg-zinc-950/90 flex flex-col overflow-hidden">
          {/* Participants Section */}
          <div className="p-3 border-b border-white/[0.08] bg-zinc-950/60 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-indigo-400" />
                Active Peers ({participants.length})
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {participants.map((p) => (
                <span 
                  key={p.userId}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {p.username}
                </span>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/40">
            <div className="px-4 py-2 border-b border-white/[0.08] flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MessageSquare size={13} className="text-indigo-400" /> Room Chat
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {uniqueMessages.map((msg) => {
                const isMe = msg.userId === currentUserId;
                const isSystem = msg.messageType === 'system';

                if (isSystem) {
                  return (
                    <div key={msg._id} className="text-center py-1 text-[11px] text-zinc-500 font-medium italic">
                      {msg.message}
                    </div>
                  );
                }

                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-semibold text-zinc-500 mb-1 px-1">
                      {isMe ? 'You' : msg.username}
                    </span>
                    <div 
                      className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-500/10' 
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {typingUsers.length > 0 && (
              <div className="px-4 py-1.5 text-[11px] text-zinc-500 italic bg-zinc-950/60 border-t border-zinc-900">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.08] bg-zinc-950 shrink-0">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500 rounded-2xl p-1 px-3 transition-colors">
                <input
                  type="text"
                  placeholder="Type message..."
                  className="bg-transparent border-none text-xs text-white placeholder-zinc-500 flex-1 focus:outline-none py-1.5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!message.trim()}
                  className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveSession;