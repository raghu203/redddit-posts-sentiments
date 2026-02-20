'use client';

import { useState } from 'react';
import { Search, Send, User, ChevronLeft, MoreHorizontal, Phone, MessageSquare, Info } from 'lucide-react';

// Mock Data
const initialConversations = [
    { id: 1, name: 'r/technology', lastMsg: "I saw that post about AI and...", time: '2m ago', unread: 2, sentiment: 'Neutral', posts: '4.2k' },
    { id: 2, name: 'r/science', lastMsg: "Does this study mean that...", time: '1h ago', unread: 0, sentiment: 'Positive', posts: '1.5k' },
    { id: 3, name: 'r/dataisbeautiful', lastMsg: "The colors in your chart are...", time: '3h ago', unread: 0, sentiment: 'Positive', posts: '890' },
    { id: 4, name: 'r/gaming', lastMsg: "Did anyone see the new trailer?", time: '5h ago', unread: 0, sentiment: 'Negative', posts: '12k' },
    { id: 5, name: 'r/space', lastMsg: "The launch was successful!", time: '1d ago', unread: 0, sentiment: 'Positive', posts: '3.1k' },
];

const mockMessages: { [key: number]: any[] } = {
    1: [
        { id: 1, user: 'u/TechGuru', text: "Hey, what do you think about the new LLM update?", time: '10:05 AM', type: 'received', sentiment: 'Neutral' },
        { id: 2, user: 'System', text: "It's quite impressive, though some users reported latency.", time: '10:06 AM', type: 'sent', sentiment: 'Neutral' },
        { id: 3, user: 'u/CodeMaster', text: "Actually, it's amazing! Best tool I've used. The efficiency is through the roof.", time: '10:10 AM', type: 'received', sentiment: 'Positive' },
        { id: 4, user: 'u/GrumpyDev', text: "I hate the new pricing. Too expensive for solo developers. Totally unacceptable path.", time: '10:15 AM', type: 'received', sentiment: 'Negative' },
        { id: 5, user: 'u/TechGuru', text: "I saw that post about AI and it seems like they might adjust it soon.", time: '2m ago', type: 'received', sentiment: 'Neutral' },
    ],
    2: [
        { id: 1, user: 'u/SciGuy', text: "Does this study mean that gravity is just a suggestion?", time: 'Yesterday', type: 'received', sentiment: 'Positive' },
    ]
};

const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
        case 'Positive': return '#16a34a';
        case 'Negative': return '#ef4444';
        default: return '#64748b';
    }
};

const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
        case 'Positive': return '#dcfce7';
        case 'Negative': return '#fee2e2';
        default: return '#f1f5f9';
    }
};

export default function MessagesPage() {
    const [activeChat, setActiveChat] = useState(initialConversations[0]);
    const [messages, setMessages] = useState(mockMessages[1] || []);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        const newMessage = {
            id: messages.length + 1,
            user: 'You',
            text: inputValue,
            time: 'Just now',
            type: 'sent',
            sentiment: 'Neutral'
        };
        setMessages([...messages, newMessage]);
        setInputValue('');
    };

    return (
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 0px)', // Full height
            background: 'white',
            overflow: 'hidden'
        }}>
            {/* Conversation List Sidebar */}
            <div style={{
                width: '320px',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                background: '#fcfdfe'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--foreground)' }}>Messages</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 36px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                fontSize: '13px',
                                outline: 'none',
                                background: 'white'
                            }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {initialConversations.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => {
                                setActiveChat(chat);
                                setMessages(mockMessages[chat.id] || []);
                            }}
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                background: activeChat.id === chat.id ? 'var(--primary-light)' : 'transparent',
                                borderLeft: activeChat.id === chat.id ? '3px solid var(--primary)' : '3px solid transparent',
                                borderBottom: '1px solid #f8f9fa',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                color: 'var(--primary)',
                                fontSize: '12px'
                            }}>
                                {chat.name.slice(2, 4).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--foreground)' }}>{chat.name}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{chat.time}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {chat.lastMsg}
                                </div>
                            </div>
                            {chat.unread > 0 && (
                                <div style={{ background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                {/* Chat Header */}
                <div style={{
                    padding: '14px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={18} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--foreground)' }}>{activeChat.name}</div>
                            <div style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                                {activeChat.posts} members online
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
                        <Phone size={18} style={{ cursor: 'pointer' }} />
                        <Info size={18} style={{ cursor: 'pointer' }} />
                        <MoreHorizontal size={18} style={{ cursor: 'pointer' }} />
                    </div>
                </div>

                {/* Messages Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.type === 'sent' ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                alignSelf: msg.type === 'sent' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                {msg.type === 'received' && (
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={12} color="white" />
                                    </div>
                                )}
                                <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>{msg.type === 'sent' ? 'You' : msg.user}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{msg.time}</span>
                                {msg.sentiment && (
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: '700',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        background: getSentimentBg(msg.sentiment),
                                        color: getSentimentColor(msg.sentiment),
                                        textTransform: 'uppercase'
                                    }}>
                                        {msg.sentiment}
                                    </span>
                                )}
                            </div>
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: msg.type === 'sent' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                background: msg.type === 'sent' ? 'var(--primary)' : 'white',
                                color: msg.type === 'sent' ? 'white' : 'var(--foreground)',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                border: msg.type === 'sent' ? 'none' : '1px solid #e2e8f0'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'white' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#f1f5f9',
                        padding: '8px 16px',
                        borderRadius: '12px'
                    }}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '13.5px',
                                padding: '6px 0'
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'var(--primary)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.1s ease',
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Send size={16} color="white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
