// Theme configuration and manager for Codzy

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Zinc',
    description: 'Linear-inspired dark aesthetic with Indigo & Violet accents',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    bg: '#09090b',
    card: '#18181b',
    border: 'rgba(255, 255, 255, 0.08)',
    previewGradient: 'from-indigo-500 via-purple-500 to-cyan-400'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Vibrant Cyan and Neon Pink over deep obsidian',
    primary: '#06b6d4',
    secondary: '#ec4899',
    accent: '#facc15',
    bg: '#05070e',
    card: '#0c101c',
    border: 'rgba(6, 182, 212, 0.2)',
    previewGradient: 'from-cyan-400 via-pink-500 to-yellow-400'
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    description: 'Clean Hacker Green and Mint over obsidian',
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#84cc16',
    bg: '#060d09',
    card: '#0c1710',
    border: 'rgba(16, 185, 129, 0.2)',
    previewGradient: 'from-emerald-400 via-teal-500 to-lime-400'
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    description: 'Warm Amber and Crimson Red over dark slate',
    primary: '#f59e0b',
    secondary: '#f43f5e',
    accent: '#fb923c',
    bg: '#0c0a09',
    card: '#1c1614',
    border: 'rgba(245, 158, 11, 0.2)',
    previewGradient: 'from-amber-400 via-orange-500 to-rose-500'
  },
  {
    id: 'tokyo',
    name: 'Tokyo Violet',
    description: 'Deep Royal Navy with Electric Violet & Sky Blue',
    primary: '#8b5cf6',
    secondary: '#38bdf8',
    accent: '#d946ef',
    bg: '#080914',
    card: '#101226',
    border: 'rgba(139, 92, 246, 0.2)',
    previewGradient: 'from-violet-400 via-fuchsia-500 to-sky-400'
  },
  {
    id: 'oled',
    name: 'Obsidian OLED',
    description: 'True pitch black with refined Silver & White glow',
    primary: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#71717a',
    bg: '#000000',
    card: '#0d0d0d',
    border: 'rgba(255, 255, 255, 0.12)',
    previewGradient: 'from-zinc-100 via-zinc-400 to-zinc-600'
  }
];

export const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'midnight';
  return localStorage.getItem('codzy_theme') || 'midnight';
};

export const applyTheme = (themeId) => {
  if (typeof window === 'undefined') return;
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  document.documentElement.setAttribute('data-theme', theme.id);
  localStorage.setItem('codzy_theme', theme.id);
};
