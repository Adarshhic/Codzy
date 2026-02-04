import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Download, Upload, Users } from 'lucide-react';
import io from 'socket.io-client';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { value: 'python', label: 'Python', monacoLang: 'python' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'c', label: 'C', monacoLang: 'c' },
];

const THEME_OPTIONS = [
  { value: 'vs-dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

const CodeEditor = ({
  code,
  onChange,
  language,
  onLanguageChange,
  sessionId,
  socketUrl = 'http://localhost:5000',
  readOnly = false,
  showControls = true,
  height = '100%',
  enableCollaboration = true,
}) => {
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);
  const isUpdatingFromSocket = useRef(false);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!enableCollaboration || !sessionId) return;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected for interview:', sessionId);
      setIsConnected(true);
      socket.emit('join-interview', sessionId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('joined-interview', ({ activeUsers }) => {
      console.log('Joined interview, active users:', activeUsers);
      setActiveUsers(activeUsers);
    });

    socket.on('active-users', ({ count }) => {
      setActiveUsers(count);
    });

    socket.on('code-update', ({ code: newCode, language: newLanguage, userId }) => {
      console.log('Received code update from:', userId);
      
      isUpdatingFromSocket.current = true;
      
      if (newCode !== undefined && newCode !== code) {
        onChange(newCode);
      }
      
      if (newLanguage && newLanguage !== language) {
        onLanguageChange(newLanguage);
      }
      
      setTimeout(() => {
        isUpdatingFromSocket.current = false;
      }, 100);
    });

    socket.on('language-change', ({ language: newLanguage }) => {
      if (newLanguage !== language) {
        onLanguageChange(newLanguage);
      }
    });

    return () => {
      if (socket) {
        socket.emit('leave-interview', sessionId);
        socket.disconnect();
      }
    };
  }, [sessionId, enableCollaboration, socketUrl]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (newCode) => {
    if (!newCode && newCode !== '') return;
    
    onChange(newCode);
    
    if (enableCollaboration && socketRef.current && !isUpdatingFromSocket.current) {
      socketRef.current.emit('code-change', {
        sessionId,
        code: newCode,
        language,
      });
    }
  };

  const handleLanguageChangeLocal = (newLanguage) => {
    onLanguageChange(newLanguage);
    
    if (enableCollaboration && socketRef.current) {
      socketRef.current.emit('language-change', {
        sessionId,
        language: newLanguage,
      });
    }
  };

  const getMonacoLanguage = (lang) => {
    const option = LANGUAGE_OPTIONS.find(opt => opt.value === lang);
    return option?.monacoLang || 'javascript';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {showControls && (
        <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm font-medium">Language:</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChangeLocal(e.target.value)}
                disabled={readOnly}
                className="px-3 py-1.5 rounded bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-white text-sm font-medium">Theme:</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-3 py-1.5 rounded bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {THEME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-white text-sm font-medium">Font:</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="10"
                max="30"
                className="w-16 px-2 py-1.5 rounded bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {enableCollaboration && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-700 border border-gray-600">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <Users size={16} className="text-white" />
                <span className="text-white text-sm font-medium">{activeUsers}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <Editor
          height={height}
          language={getMonacoLanguage(language)}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            readOnly: readOnly,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>

      {showControls && (
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-700">
          <div className="flex items-center gap-4">
            <span>Lines: {code.split('\n').length}</span>
            <span>Characters: {code.length}</span>
            {enableCollaboration && (
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? '● Live Collaboration' : '● Disconnected'}
              </span>
            )}
          </div>
          {readOnly && (
            <span className="text-yellow-400">Read-only mode</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;