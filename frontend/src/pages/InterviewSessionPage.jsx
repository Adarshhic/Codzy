import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { StreamVideo, StreamCall } from '@stream-io/video-react-sdk';
import { getInterviewSessionById, joinInterviewSession, endInterviewSession, getStreamToken } from '../api/interview';
import { initializeStreamClients } from '../lib/stream';
import CodeEditor from '../components/CodeEditor';
import VideoCallUI from '../components/VideoCallUI';
import ChatPanel from '../components/ChatPanel';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); // Get user from Redux
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [call, setCall] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    if (user) {
      initializeSession();
    }
  }, [id, user]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session details
      const sessionResponse = await getInterviewSessionById(id);
      console.log('Session loaded:', sessionResponse.session);
      setSession(sessionResponse.session);

      // Get Stream token
      const tokenResponse = await getStreamToken();
      const token = tokenResponse.token;
      const userId = tokenResponse.userId || user._id || user.id;

      console.log('Initializing Stream with userId:', userId);

      // Initialize Stream clients
      const { videoClient, chatClient } = await initializeStreamClients(
        userId.toString(), 
        user.FirstName || user.firstName || 'User',
        token
      );
      
      setVideoClient(videoClient);
      setChatClient(chatClient);

      // Join the video call
      const videoCall = videoClient.call('default', sessionResponse.session.callId);
      await videoCall.join({ create: false }); // Don't create, just join
      setCall(videoCall);

      console.log('Successfully joined video call');
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
      console.log('Joined session as candidate');
    } catch (error) {
      console.error('Error joining session:', error);
      alert(error.response?.data?.message || 'Failed to join session');
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
      
      // Cleanup
      if (call) {
        await call.leave();
      }
      if (chatClient) {
        await chatClient.disconnectUser();
      }
      
      navigate('/interview/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      alert(error.response?.data?.message || 'Failed to end session');
    }
  };

  const isInterviewer = session && user && session.interviewer?._id === user._id;
  const isCandidate = session && user && session.candidate?._id === user._id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center bg-red-500/10 border border-red-500 rounded-lg p-8 max-w-md">
          <h2 className="text-red-500 text-2xl font-bold mb-4">Error</h2>
          <p className="text-white mb-6">{error}</p>
          <button 
            onClick={() => navigate('/interview/dashboard')}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Session not found</h2>
          <button 
            onClick={() => navigate('/interview/dashboard')}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live Interview</span>
          </div>
          <div className="h-8 w-px bg-gray-600"></div>
          <div>
            <h1 className="text-xl font-bold">{session.problem?.title || 'Interview Session'}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>Interviewer: {session.interviewer?.name || session.interviewer?.FirstName || 'Unknown'}</span>
              <span>•</span>
              <span>Candidate: {session.candidate?.name || session.candidate?.FirstName || 'Waiting...'}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                session.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                session.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {session.difficulty?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!session.candidate && !isInterviewer && (
            <button 
              onClick={handleJoinSession}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Join as Candidate
            </button>
          )}
          {isInterviewer && (
            <button 
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              End Interview
            </button>
          )}
          <button 
            onClick={() => navigate('/interview/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="w-1/2 border-r border-gray-700">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            sessionId={id}
            socketUrl={import.meta.env.VITE_API_URL || 'http://localhost:5000'}
            enableCollaboration={true}
            showControls={true}
            readOnly={false}
          />
        </div>

        {/* Right Panel - Video & Chat */}
        <div className="w-1/2 flex flex-col bg-gray-800">
          {/* Video Call */}
          <div className="h-2/3 border-b border-gray-700">
            {videoClient && call ? (
              <StreamVideo client={videoClient}>
                <StreamCall call={call}>
                  <VideoCallUI />
                </StreamCall>
              </StreamVideo>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p>Initializing video...</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="h-1/3">
            {chatClient && session.callId ? (
              <ChatPanel 
                chatClient={chatClient} 
                channelId={session.callId} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-900">
                <p>Loading chat...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionPage;