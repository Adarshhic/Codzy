import { create } from 'zustand';

const useStudyGroupStore = create((set, get) => ({
  // Groups
  groups: [],
  currentGroup: null,
  
  // Session
  activeSession: null,
  participants: [],
  
  // Messages
  messages: [],
  
  // Real-time state
  isConnected: false,
  onlineUsers: [],
  typingUsers: [],
  
  // Code collaboration
  sharedCode: '',
  sharedLanguage: 'javascript',
  
  // Actions
  setGroups: (groups) => set({ groups }),
  
  setCurrentGroup: (group) => set({ currentGroup: group }),
  
  setActiveSession: (session) => set({ activeSession: session }),
  
  setParticipants: (participants) => set({ participants }),
  
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),
  
  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.userId !== userId)
  })),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setIsConnected: (isConnected) => set({ isConnected }),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  addTypingUser: (username) => set((state) => ({
    typingUsers: [...new Set([...state.typingUsers, username])]
  })),
  
  removeTypingUser: (username) => set((state) => ({
    typingUsers: state.typingUsers.filter(u => u !== username)
  })),
  
  setSharedCode: (code) => set({ sharedCode: code }),
  
  setSharedLanguage: (language) => set({ sharedLanguage: language }),
  
  reset: () => set({
    currentGroup: null,
    activeSession: null,
    participants: [],
    messages: [],
    isConnected: false,
    onlineUsers: [],
    typingUsers: [],
    sharedCode: '',
    sharedLanguage: 'javascript'
  })
}));

export default useStudyGroupStore;