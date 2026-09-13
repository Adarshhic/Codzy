import { useState } from 'react';
import { NavLink } from 'react-router';
import Navbar from '../components/Navbar';
import { 
  Code2, 
  Sparkles, 
  Users, 
  Video, 
  Bot, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Globe2,
  Zap,
  Flame,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('js');

  const codeSnippets = {
    js: `// Two Sum Solution with Hash Map in O(n)
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    cpp: `// Optimized LRU Cache implementation
class LRUCache {
private:
    int capacity;
    list<pair<int, int>> cacheList;
    unordered_map<int, list<pair<int, int>>::iterator> cacheMap;
public:
    LRUCache(int capacity) : capacity(capacity) {}
    int get(int key) {
        if (cacheMap.find(key) == cacheMap.end()) return -1;
        cacheList.splice(cacheList.begin(), cacheList, cacheMap[key]);
        return cacheMap[key]->second;
    }
};`,
    python: `# Valid Palindrome with Two Pointers
def isPalindrome(s: str) -> bool:
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum(): l += 1
        while l < r and not s[r].isalnum(): r -= 1
        if s[l].lower() != s[r].lower(): return False
        l, r = l + 1, r - 1
    return True`
  };

  const features = [
    {
      title: "Real-time Live Coding",
      description: "Collaborate in live study group rooms with synchronous Monaco code editor and shared cursor positions.",
      icon: Users,
      badge: "Synchronous",
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "AI Socratic DSA Tutor",
      description: "Progressive hints, runtime debugging, and complexity analysis powered by Google Gemini AI without spoiling solutions.",
      icon: Bot,
      badge: "Gemini 2.5",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Peer Mock Interviews",
      description: "High-definition video calls via Stream.io alongside interactive coding benchmarks, ratings, and feedback.",
      icon: Video,
      badge: "HD Audio/Video",
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Cloud Video Solutions",
      description: "Watch video tutorials directly embedded for every problem, complete with timestamps and visual explanations.",
      icon: Play,
      badge: "Cloudinary",
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial-gradient">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-cyan-500/15 to-purple-500/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto text-center">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-white/[0.1] text-xs font-semibold text-zinc-300 mb-8 backdrop-blur-md hover:border-indigo-500/40 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen LeetCode with Live Collaboration & AI</span>
            <ArrowRight className="w-3 h-3 text-zinc-500" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Master Data Structures & Algorithms{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Together in Real-Time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Codzy blends competitive programming with collaborative study rooms, live mock video interviews, and an intelligent AI tutor to help you ace your technical interviews.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink
              to="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all"
            >
              <Zap className="w-5 h-5 text-indigo-200" />
              Start Solving Free
            </NavLink>
            <NavLink
              to="/problems"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 font-semibold text-base border border-white/[0.1] hover:border-white/[0.2] transition-all"
            >
              <Code2 className="w-5 h-5 text-zinc-400" />
              Explore Problem Set
            </NavLink>
          </div>

          {/* Social Proof Tags */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Language Execution (JS, C++, Java, Python)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Built-in Stream.io Video Interviews</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Group Progress Sync</span>
            </div>
          </div>
        </div>

        {/* Live Code Preview Mockup */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-white/[0.15] to-transparent shadow-2xl shadow-black/80">
          <div className="rounded-[15px] bg-zinc-950 border border-white/[0.08] overflow-hidden">
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/70 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  codzy-workspace / Solution.js
                </span>
              </div>
              
              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-white/[0.06]">
                {['js', 'cpp', 'python'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium uppercase transition-colors ${
                      activeTab === lang
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Body */}
            <div className="p-6 font-mono text-sm overflow-x-auto text-zinc-300 leading-relaxed bg-zinc-950/90">
              <pre className="text-zinc-300">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>

            {/* Execution Result Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-emerald-500/[0.06] border-t border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400">Accepted (All 45 Test Cases Passed)</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span>Runtime: <strong className="text-zinc-200">52 ms</strong></span>
                <span>Memory: <strong className="text-zinc-200">42.8 MB</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Engineered for Excellence</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to level up your programming prowess
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-3xl p-8 border border-white/[0.08] relative overflow-hidden group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} p-[1px] mb-6 shadow-lg`}>
                  <div className="w-full h-full bg-zinc-950 rounded-[15px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  {feat.badge}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-16">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-tr from-indigo-900/40 via-zinc-900 to-zinc-950 border border-indigo-500/20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="mt-4 text-base text-zinc-400 max-w-xl mx-auto">
            Join thousands of developers solving problems, joining study rooms, and running peer mock interviews.
          </p>
          <div className="mt-8">
            <NavLink
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-base shadow-xl shadow-indigo-500/20 transition-all"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-zinc-300">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>CODZY © 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <NavLink to="/problems" className="hover:text-zinc-300 transition-colors">Problems</NavLink>
            <NavLink to="/study-groups" className="hover:text-zinc-300 transition-colors">Study Groups</NavLink>
            <NavLink to="/interview/dashboard" className="hover:text-zinc-300 transition-colors">Mock Interviews</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}