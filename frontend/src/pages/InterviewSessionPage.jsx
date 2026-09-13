import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { StreamVideo, StreamCall } from '@stream-io/video-react-sdk';
import { 
  Radio, Video, PhoneOff, UserCheck, ArrowLeft, 
  Info, Shield, AlertTriangle, Code2
} from 'lucide-react';
import { getInterviewSessionById, joinInterviewSession, endInterviewSession, getStreamToken } from '../api/interview';
import { initializeStreamClients } from '../lib/stream';
import CodeEditor from '../components/CodeEditor';
import VideoCallUI from '../components/VideoCallUI';
import ChatPanel from '../components/ChatPanel';
import toast from 'react-hot-toast';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [call, setCall] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [streamAvailable, setStreamAvailable] = useState(false);

  useEffect(() => {
    if (user) {
      initializeSession();
    }
  }, [id, user]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionResponse = await getInterviewSessionById(id);
      setSession(sessionResponse.session);

      // Try to initialize Stream (video/chat)
      try {
        const tokenResponse = await getStreamToken();
        const token = tokenResponse.token;
        const userId = tokenResponse.userId || user._id || user.id;

        const { videoClient, chatClient } = await initializeStreamClients(
          userId.toString(), 
          user.FirstName || user.firstName || 'User',
          token
        );
        
        setVideoClient(videoClient);
        setChatClient(chatClient);

        const videoCall = videoClient.call('default', sessionResponse.session.callId);
        
        try {
          await videoCall.join({ create: true });
          setCall(videoCall);
          setStreamAvailable(true);
        } catch (joinError) {
          console.warn('Could not join video call:', joinError.message);
          setStreamAvailable(false);
        }
      } catch (streamError) {
        console.warn('Stream.io not available:', streamError.message);
        setStreamAvailable(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing session:', error);
      setError(error.message || 'Failed to initialize session');
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      const response = await joinInterviewSession(id);
      setSession(response.session);
      toast.success('Joined session as candidate');
      window.location.reload();
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error(error.response?.data?.message || 'Failed to join session');
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end this interview?')) return;

    try {
      await endInterviewSession(id, {
        codeSnapshot: code,
        language: language,
        notes: '',
        rating: null,
      });
      
      if (call) {
        try {
          await call.leave();
        } catch (e) {
          console.warn('Error leaving call:', e);
        }
      }
      if (chatClient) {
        try {
          await chatClient.disconnectUser();
        } catch (e) {
          console.warn('Error disconnecting chat:', e);
        }
      }
      
      toast.success('Interview session ended');
      navigate('/interview/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error(error.response?.data?.message || 'Failed to end session');
    }
  };

  const isInterviewer = session && user && (
    session.interviewer?._id === user._id || 
    session.interviewer?._id === user.id ||
    session.interviewer?.id === user._id ||
    session.interviewer?.id === user.id
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
          <p className="text-zinc-500 text-sm font-medium">Connecting to interview workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-rose-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Workspace Error</h2>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/interview/dashboard')}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-sm text-zinc-400 mb-6">This interview session may have expired or ended.</p>
          <button 
            onClick={() => navigate('/interview/dashboard')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-white antialiased overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-zinc-950/80 border-b border-white/[0.08] backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/interview/dashboard')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1 text-xs"
            title="Return to Interview Arena"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Arena</span>
          </button>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h1 className="font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md">
              {session.problem?.title || 'Mock Interview Session'}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getDifficultyBadge(session.difficulty)}`}>
              {session.difficulty?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Status Tag */}
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span>Interviewer: <strong className="text-zinc-200">{session.interviewer?.name || session.interviewer?.FirstName || 'Host'}</strong></span>
            <span>•</span>
            <span>Candidate: <strong className="text-zinc-200">{session.candidate?.name || session.candidate?.FirstName || 'Waiting...'}</strong></span>
          </div>

          {!session.candidate && !isInterviewer && (
            <button 
              onClick={handleJoinSession}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <UserCheck size={14} />
              <span>Join as Candidate</span>
            </button>
          )}

          {isInterviewer && (
            <button 
              onClick={handleEndSession}
              className="px-4 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <PhoneOff size={14} />
              <span>End Interview</span>
            </button>
          )}

          <button 
            onClick={() => navigate('/interview/dashboard')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-all"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Code Only Notice */}
      {!streamAvailable && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300 shrink-0">
          <div className="flex items-center gap-2">
            <Info size={14} className="shrink-0 text-amber-400" />
            <span>
              <strong>Code Sync Mode:</strong> Video and audio streams are currently unavailable in this environment. Real-time collaborative code editor is active.
            </span>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor (Half or Full Width) */}
        <div className={`${streamAvailable ? 'w-1/2' : 'w-full'} h-full border-r border-white/[0.08]`}>
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            sessionId={id}
            socketUrl={import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'}
            enableCollaboration={true}
            showControls={true}
            readOnly={false}
          />
        </div>

        {/* Video Call & Chat Pane (Only if Stream active) */}
        {streamAvailable && (
          <div className="w-1/2 flex flex-col bg-zinc-950">
            {/* Video Call Box */}
            <div className="h-2/3 border-b border-white/[0.08] relative bg-zinc-950 overflow-hidden">
              {videoClient && call ? (
                <StreamVideo client={videoClient}>
                  <StreamCall call={call}>
                    <VideoCallUI />
                  </StreamCall>
                </StreamVideo>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                    <Video size={20} className="text-zinc-600" />
                  </div>
                  <p>Connecting video stream...</p>
                </div>
              )}
            </div>

            {/* Chat Box */}
            <div className="h-1/3 bg-zinc-950/60 overflow-hidden">
              {chatClient && session.callId ? (
                <ChatPanel 
                  chatClient={chatClient} 
                  channelId={session.callId} 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  <p>Connecting room chat...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSessionPage;