import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { Users, MessageSquare, Code, Send, LogOut } from 'lucide-react';
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
  const [localCode, setLocalCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCodeSharing, setIsCodeSharing] = useState(false);
  
  const messagesEndRef = useRef(null);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageIdsRef = useRef(new Set()); // Track message IDs to prevent duplicates

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
      
      // Fetch existing messages FIRST
      const messagesRes = await axiosClient.get(`/study-groups/${groupId}/messages?sessionId=${sessionId}`);
      const existingMessages = messagesRes.data.messages || [];
      
      // Store message IDs to prevent duplicates
      messageIdsRef.current = new Set(existingMessages.map(m => m._id));
      setMessages(existingMessages);
      
      // Initialize socket AFTER fetching messages
      socketRef.current = initializeSocket(user._id, user.FirstName);
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

    // Room users
    socket.on('room-users', ({ participants: roomParticipants }) => {
      setParticipants(roomParticipants);
    });

    // User joined
    socket.on('user-joined', ({ userId, username }) => {
      addParticipant({ userId, username });
      toast.success(`${username} joined the session`);
    });

    // User left
    socket.on('user-left', ({ userId, username }) => {
      removeParticipant(userId);
      toast(`${username} left the session`, { icon: '👋' });
    });

    // Receive message - WITH DEDUPLICATION
    socket.on('receive-message', (msg) => {
      // Only add message if we haven't seen this ID before
      if (!messageIdsRef.current.has(msg._id)) {
        messageIdsRef.current.add(msg._id);
        addMessage(msg);
      }
    });

    // Code updates
    socket.on('code-updated', ({ userId, username, code, language }) => {
      if (isCodeSharing) {
        setSharedCode(code);
        setSharedLanguage(language);
      }
    });

    // Problem changed
    socket.on('problem-changed', async ({ problemId, problemTitle }) => {
      toast.success(`Problem changed to: ${problemTitle}`);
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(data.problem || data);
      } catch (error) {
        console.error('Error fetching new problem:', error);
      }
    });

    // User solved problem
    socket.on('user-solved-problem', ({ username, problemTitle }) => {
      toast.success(`🎉 ${username} solved ${problemTitle}!`, { duration: 5000 });
    });

    // Typing indicators
    socket.on('user-typing', ({ username }) => {
      addTypingUser(username);
    });

    socket.on('user-stopped-typing', ({ userId }) => {
      // Remove typing user (we'd need to track userId to username mapping)
    });

    // Errors
    socket.on('error', ({ message }) => {
      toast.error(message);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socketRef.current.emit('send-message', {
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
    setIsCodeSharing(!isCodeSharing);
    if (!isCodeSharing) {
      toast.success('Code sharing enabled');
    } else {
      toast('Code sharing disabled', { icon: '🔒' });
    }
  };

  const handleLeaveSession = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', {
        roomId: `session-${sessionId}`,
        groupId: groupId
      });
    }
    // Clear message IDs
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

  // Deduplicate messages before rendering (extra safety)
  const uniqueMessages = messages.filter((msg, index, self) => 
    index === self.findIndex((m) => m._id === msg._id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{problem?.title}</h1>
          <div className={`badge ${
            problem?.difficulty === 'easy' ? 'badge-success' :
            problem?.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
          }`}>
            {problem?.difficulty}
          </div>
          <div className="badge badge-outline">{problem?.tags}</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users size={16} />
            <span>{participants.length} online</span>
          </div>
          
          <button
            onClick={() => navigate(`/study-groups/${groupId}`)}
            className="btn btn-ghost btn-sm gap-2"
          >
            <LogOut size={16} />
            Leave Session
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/3 border-r border-base-300 overflow-y-auto p-6 bg-base-100">
          <h2 className="text-2xl font-bold mb-4">Problem Description</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{problem?.description}</p>
          </div>

          {problem?.visibleTestCases && problem.visibleTestCases.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">Examples</h3>
              {problem.visibleTestCases.map((tc, i) => (
                <div key={i} className="bg-base-200 p-4 rounded-lg mb-3">
                  <p className="font-semibold mb-2">Example {i + 1}</p>
                  <div className="space-y-1 text-sm font-mono">
                    <div><strong>Input:</strong> {tc.input.join(', ')}</div>
                    <div><strong>Output:</strong> {tc.output.join(', ')}</div>
                    {tc.explanation && <div><strong>Explanation:</strong> {tc.explanation}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-base-100 border-b border-base-300 px-4 py-2 flex items-center justify-between">
            <div className="flex gap-2">
              {['javascript', 'java', 'cpp', 'python'].map((lang) => (
                <button
                  key={lang}
                  className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <label className="label cursor-pointer gap-2">
                <span className="label-text text-sm">Share Code</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={isCodeSharing}
                  onChange={toggleCodeSharing}
                />
              </label>
              <Code size={16} className={isCodeSharing ? 'text-success' : 'text-base-content/50'} />
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={getLanguageForMonaco(selectedLanguage)}
              value={isCodeSharing ? sharedCode : localCode}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        {/* Right Panel - Chat & Participants */}
        <div className="w-80 border-l border-base-300 flex flex-col bg-base-100">
          {/* Participants */}
          <div className="p-4 border-b border-base-300">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Users size={16} />
              Participants ({participants.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {participants.map((p) => (
                <div key={p.userId} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">{p.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-base-300">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare size={16} />
                Chat
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {uniqueMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`${
                    msg.messageType === 'system'
                      ? 'text-center text-sm text-base-content/60 italic'
                      : msg.userId === user._id
                        ? 'chat chat-end'
                        : 'chat chat-start'
                  }`}
                >
                  {msg.messageType !== 'system' && (
                    <>
                      <div className="chat-header text-xs opacity-50 mb-1">
                        {msg.username}
                      </div>
                      <div className="chat-bubble chat-bubble-primary">
                        {msg.message}
                      </div>
                    </>
                  )}
                  {msg.messageType === 'system' && <div>{msg.message}</div>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {typingUsers.length > 0 && (
              <div className="px-4 py-2 text-xs text-base-content/60 italic">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input input-bordered input-sm flex-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm btn-square">
                  <Send size={16} />
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