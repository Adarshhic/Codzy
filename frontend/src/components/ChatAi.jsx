import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Code, Lightbulb, AlertCircle, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        {
            role: 'model',
            parts: [{ text: `👋 **Hello! I'm your AI DSA Tutor**\n\nI'm ready to help you solve **${problem?.title || 'this problem'}** without spoiling the optimal intuition.\n\nAsk me for hints, edge-cases, or asymptotic complexity explanations!` }],
            timestamp: new Date()
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const { register, handleSubmit, reset, watch } = useForm();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const messageValue = watch("message");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const onSubmit = async (data) => {
        if (!data.message?.trim()) return;

        const userMessage = {
            role: 'user',
            parts: [{ text: data.message.trim() }],
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            const updatedMessages = [...messages, userMessage];

            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }],
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "⚠️ **Error connecting to AI tutor**\n\nPlease verify your network or try again in a few moments." }],
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleCopy = async (text, index) => {
        try {
            const cleanText = text.replace(/```[\w]*\n/g, '').replace(/```/g, '').replace(/\*\*/g, '');
            await navigator.clipboard.writeText(cleanText);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const quickPrompts = [
        { icon: Lightbulb, text: "Give me a hint", color: "text-amber-400" },
        { icon: Code, text: "Explain optimal approach", color: "text-indigo-400" },
        { icon: AlertCircle, text: "What are the edge cases?", color: "text-purple-400" }
    ];

    const handleQuickPrompt = (promptText) => {
        onSubmit({ message: promptText });
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-white/[0.08] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900/80 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xs text-white">Gemini AI Tutor</h3>
                        <p className="text-[10px] text-zinc-400">Contextual Problem Assistant</p>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[11px]">Reasoning...</span>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            msg.role === "user" 
                                ? "bg-indigo-600 text-white" 
                                : "bg-zinc-800 text-indigo-400 border border-white/[0.08]"
                        }`}>
                            {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                        </div>

                        {/* Bubble */}
                        <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <div className={`relative rounded-2xl p-3.5 text-xs leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-indigo-600 text-white ml-auto"
                                    : msg.isError
                                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                                        : "bg-zinc-900/90 text-zinc-200 border border-white/[0.06]"
                            }`}>
                                {msg.role === "model" ? (
                                    <div className="prose prose-invert prose-xs max-w-none space-y-2">
                                        <ReactMarkdown
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <div className="relative group/code my-2 rounded-xl overflow-hidden border border-white/[0.08]">
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                customStyle={{ margin: 0, padding: '12px', fontSize: '11px', background: '#09090b' }}
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                            <button
                                                                onClick={() => handleCopy(String(children), `code-${index}`)}
                                                                className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                                                                title="Copy code"
                                                            >
                                                                {copiedIndex === `code-${index}` ? (
                                                                    <Check size={12} className="text-emerald-400" />
                                                                ) : (
                                                                    <Copy size={12} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <code className="bg-zinc-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                p({ children }) {
                                                    return <p className="mb-1.5 last:mb-0 leading-relaxed text-zinc-300">{children}</p>;
                                                },
                                                ul({ children }) {
                                                    return <ul className="list-disc pl-4 mb-2 space-y-1 text-zinc-300">{children}</ul>;
                                                }
                                            }}
                                        >
                                            {msg.parts[0].text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap break-words">{msg.parts[0].text}</p>
                                )}
                            </div>

                            <span className={`block text-[10px] text-zinc-500 mt-1 px-1 ${
                                msg.role === "user" ? "text-right" : "text-left"
                            }`}>
                                {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-indigo-400">
                            <Bot size={14} />
                        </div>
                        <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && !isLoading && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickPrompt(prompt.text)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-[11px] text-zinc-300 transition-all"
                        >
                            <prompt.icon size={12} className={prompt.color} />
                            <span>{prompt.text}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-3 border-t border-white/[0.08] bg-zinc-900/60">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask AI tutor for hints, edge-cases..."
                        className="flex-1 bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        {...register("message")}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !messageValue?.trim()}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;