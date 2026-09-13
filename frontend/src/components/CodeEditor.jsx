import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Users, Code2, Globe, Sparkles, Check, 
  Terminal, Shield, Wifi, WifiOff 
} from 'lucide-react';
import io from 'socket.io-client';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { value: 'python', label: 'Python', monacoLang: 'python' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'c', label: 'C', monacoLang: 'c' },
];

const THEME_OPTIONS = [
  { value: 'vs-dark', label: 'Dark Mode' },
  { value: 'light', label: 'Light Mode' },
];

const CodeEditor = ({
  code,
  onChange,
  language,
  onLanguageChange,
  sessionId,
  socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000',
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
      setIsConnected(true);
      socket.emit('join-interview', sessionId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('joined-interview', ({ activeUsers }) => {
      setActiveUsers(activeUsers || 1);
    });

    socket.on('active-users', ({ count }) => {
      setActiveUsers(count || 1);
    });

    socket.on('code-update', ({ code: newCode, language: newLanguage }) => {
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
    <div className="h-full flex flex-col bg-[#1e1e1e] text-zinc-100 overflow-hidden select-none">
      {showControls && (
        <div className="bg-zinc-950/90 border-b border-white/[0.08] px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5">
              <Code2 size={14} className="text-indigo-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChangeLocal(e.target.value)}
                disabled={readOnly}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white border border-zinc-800 text-xs font-medium focus:outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-zinc-900">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
              <span>Font:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-zinc-900 text-white border border-zinc-800 text-xs focus:outline-none cursor-pointer"
              >
                {[12, 13, 14, 15, 16, 18].map((size) => (
                  <option key={size} value={size} className="bg-zinc-900">
                    {size}px
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {enableCollaboration && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                <Users size={13} className="text-indigo-400" />
                <span>{activeUsers} peer{activeUsers !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 relative overflow-hidden">
        <Editor
          height={height}
          language={getMonacoLanguage(language)}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: fontSize,
            lineHeight: 22,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            readOnly: readOnly,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>

      {showControls && (
        <div className="bg-zinc-950/90 px-4 py-1.5 flex items-center justify-between text-[11px] text-zinc-500 border-t border-white/[0.08] font-mono shrink-0">
          <div className="flex items-center gap-4">
            <span>Ln: {code ? code.split('\n').length : 1}</span>
            <span>Ch: {code ? code.length : 0}</span>
            <span>UTF-8</span>
          </div>
          <div>
            {enableCollaboration && (
              <span className={`inline-flex items-center gap-1 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isConnected ? 'Real-Time Sync' : 'Reconnecting...'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;