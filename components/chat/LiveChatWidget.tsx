'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  sender: 'agent' | 'user'
  text: string
  timestamp: Date
}

const OXBLOOD = '#6B2737'
const DARK_BLUE = '#1B2A4A'

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: DARK_BLUE }}
      >
        SDP
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1"
        style={{ background: DARK_BLUE }}
      >
        <span className="w-2 h-2 rounded-full bg-white opacity-60 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-white opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-white opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export function LiveChatWidget() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "👋 Hello! Welcome to SourceDeliveryPro support. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const refNum = Math.floor(100000 + Math.random() * 900000)
      const replyMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: `Thank you for contacting SourceDeliveryPro! An agent will be with you shortly. For immediate assistance, call us at (618) 368 1268. You can also track your package at /tracking. Reference: CHAT-${refNum}`,
        timestamp: new Date(),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, replyMsg])
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
        style={{ width: 380, height: 500, background: '#f8f9fb' }}
        role="dialog"
        aria-label="Live Chat"
      >
        {/* Header */}
        <div
          className="flex flex-col px-4 pt-4 pb-3 flex-shrink-0"
          style={{ background: DARK_BLUE }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: OXBLOOD }}
                >
                  SDP
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">SourceDeliveryPro Support</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-green-400 text-xs font-medium">Agent Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/50 text-xs mt-2">Avg response time: &lt; 2 minutes</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ background: '#f0f2f5' }}>
          {messages.map((msg) =>
            msg.sender === 'agent' ? (
              <div key={msg.id} className="flex items-end gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: DARK_BLUE }}
                >
                  SDP
                </div>
                <div className="flex flex-col items-start max-w-[75%]">
                  <div
                    className="px-4 py-2.5 rounded-2xl rounded-bl-none text-white text-sm leading-relaxed"
                    style={{ background: DARK_BLUE }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 ml-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-col items-end mb-3">
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-br-none text-white text-sm leading-relaxed max-w-[75%]"
                  style={{ background: OXBLOOD }}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 mr-1">{formatTime(msg.timestamp)}</span>
              </div>
            )
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-200 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-offset-1 transition"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-40 flex-shrink-0"
            style={{ background: OXBLOOD }}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ background: OXBLOOD }}
        aria-label={isOpen ? 'Close chat' : 'Open live chat'}
      >
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white" />
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
    </>
  )
}
