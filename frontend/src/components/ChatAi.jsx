import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Code, Lightbulb, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        {
            role: 'model',
            parts: [{ text: `👋 **Hello! I'm your DSA Assistant**\n\nI'm here to help you solve: **${problem?.title || 'this problem'}**\n\nI can help you with:\n• 💡 Hints and guidance\n• 🐛 Debugging your code\n• ✅ Complete solutions\n• ⏱️ Complexity analysis\n• 🧪 Test cases\n\nWhat would you like help with?` }],
            timestamp: new Date()
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const messageValue = watch("message");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;

        const userMessage = {
            role: 'user',
            parts: [{ text: data.message }],
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            // Include the new user message in the API call
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
                parts: [{ text: "⚠️ **Error**\n\nI encountered an error processing your request. Please try again." }],
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
            // Remove markdown formatting for cleaner copy
            const cleanText = text.replace(/```[\w]*\n/g, '').replace(/```/g, '').replace(/\*\*/g, '');
            await navigator.clipboard.writeText(cleanText);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const quickPrompts = [
        { icon: Lightbulb, text: "Give me a hint", color: "text-yellow-500" },
        { icon: Code, text: "Show me the solution", color: "text-blue-500" },
        { icon: AlertCircle, text: "Explain the complexity", color: "text-purple-500" }
    ];

    const handleQuickPrompt = (promptText) => {
        handleSubmit(() => onSubmit({ message: promptText }))();
    };

    return (
        <div className="flex flex-col h-full bg-base-100 rounded-lg shadow-xl border border-base-300">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <div>
                        <h3 className="font-semibold text-sm">DSA AI Assistant</h3>
                        <p className="text-xs text-base-content/60">Powered by Gemini</p>
                    </div>
                    {isLoading && (
                        <div className="ml-auto flex items-center gap-2 text-xs text-primary">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === "user" 
                                ? "bg-primary text-primary-content" 
                                : "bg-secondary text-secondary-content"
                        }`}>
                            {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <div className={`group relative rounded-2xl px-4 py-3 ${
                                msg.role === "user"
                                    ? "bg-primary text-primary-content ml-auto"
                                    : msg.isError
                                        ? "bg-error/10 text-error border border-error/20"
                                        : "bg-base-200 text-base-content"
                            }`}>
                                {msg.role === "model" ? (
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <div className="relative group/code">
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                className="rounded-lg text-sm my-2"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                            <button
                                                                onClick={() => handleCopy(String(children), `code-${index}`)}
                                                                className="absolute top-2 right-2 p-1.5 rounded bg-base-100/80 hover:bg-base-100 opacity-0 group-hover/code:opacity-100 transition-opacity"
                                                                title="Copy code"
                                                            >
                                                                {copiedIndex === `code-${index}` ? (
                                                                    <Check size={14} className="text-success" />
                                                                ) : (
                                                                    <Copy size={14} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <code className="bg-base-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                p({ children }) {
                                                    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                                                },
                                                ul({ children }) {
                                                    return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>;
                                                },
                                                ol({ children }) {
                                                    return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
                                                },
                                                h1({ children }) {
                                                    return <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>;
                                                },
                                                h2({ children }) {
                                                    return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
                                                },
                                                h3({ children }) {
                                                    return <h3 className="text-base font-bold mb-1 mt-2">{children}</h3>;
                                                },
                                                blockquote({ children }) {
                                                    return <blockquote className="border-l-4 border-primary pl-4 italic my-2">{children}</blockquote>;
                                                },
                                                table({ children }) {
                                                    return (
                                                        <div className="overflow-x-auto my-2">
                                                            <table className="table table-sm table-zebra">{children}</table>
                                                        </div>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.parts[0].text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {msg.parts[0].text}
                                    </p>
                                )}

                                {/* Copy button for messages */}
                                {msg.role === "model" && !msg.isError && (
                                    <button
                                        onClick={() => handleCopy(msg.parts[0].text, index)}
                                        className="absolute top-2 right-2 p-1.5 rounded bg-base-300/80 hover:bg-base-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy message"
                                    >
                                        {copiedIndex === index ? (
                                            <Check size={14} className="text-success" />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Timestamp */}
                            <div className={`text-xs text-base-content/50 mt-1 px-2 ${
                                msg.role === "user" ? "text-right" : "text-left"
                            }`}>
                                {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                            <Bot size={18} />
                        </div>
                        <div className="bg-base-200 rounded-2xl px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts - Show only when no messages or conversation is starting */}
            {messages.length <= 1 && !isLoading && (
                <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickPrompt(prompt.text)}
                                className="btn btn-sm btn-outline gap-2 hover:scale-105 transition-transform"
                            >
                                <prompt.icon size={16} className={prompt.color} />
                                <span className="text-xs">{prompt.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-4 bg-base-100 border-t border-base-300 rounded-b-lg"
            >
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            placeholder="Ask me anything about this problem... (Press Enter to send, Shift+Enter for new line)"
                            className={`textarea textarea-bordered w-full resize-none pr-10 ${
                                errors.message ? 'textarea-error' : ''
                            }`}
                            rows="1"
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(onSubmit)();
                                }
                            }}
                            {...register("message", {
                                required: "Message is required",
                                minLength: { value: 1, message: "Message too short" },
                                validate: value => value.trim().length > 0 || "Message cannot be empty"
                            })}
                            disabled={isLoading}
                        />
                        {messageValue && messageValue.length > 0 && (
                            <span className="absolute bottom-2 right-2 text-xs text-base-content/50">
                                {messageValue.length}
                            </span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className={`btn btn-primary ${isLoading ? 'btn-disabled' : ''}`}
                        disabled={isLoading || errors.message || !messageValue?.trim()}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
                {errors.message && (
                    <p className="text-error text-xs mt-1 ml-1">{errors.message.message}</p>
                )}
            </form>
        </div>
    );
}

export default ChatAi;