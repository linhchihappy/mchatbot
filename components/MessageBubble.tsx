import React, { useState } from 'react';
import { ChatMessage, Role } from '../types';
import MathRenderer from './MathRenderer';
import { BookOpen, Lightbulb, Calculator, User, Bot, FileText } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [activeTab, setActiveTab] = useState<'theory' | 'hint' | 'solution'>('theory');

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-fade-in">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-lg">
          <div className="flex items-center gap-2 mb-2 border-b border-white/20 pb-2">
            <User className="w-4 h-4" />
            <span className="font-semibold text-sm">Học sinh</span>
          </div>
          
          {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/30">
              <img src={`data:${message.mimeType};base64,${message.image}`} alt="Uploaded content" className="max-h-60 object-contain w-full bg-black/20" />
            </div>
          )}
          
          {message.fileName && !message.image && (
             <div className="flex items-center gap-2 bg-white/10 p-2 rounded mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm truncate">{message.fileName}</span>
             </div>
          )}

          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  // Model Response
  return (
    <div className="flex justify-start mb-8 animate-fade-in">
      <div className="flex flex-col max-w-[95%] md:max-w-[85%] lg:max-w-[75%]">
        <div className="flex items-center gap-2 mb-2 ml-1 text-indigo-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-base">ĐM Bài tập về nhà</span>
          <span className="text-xs text-slate-400 font-normal">by Chân Đức</span>
        </div>

        {message.isError ? (
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl rounded-tl-sm">
                <p>Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.</p>
             </div>
        ) : (
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-xl overflow-hidden flex flex-col">
              {/* Tabs Header */}
              <div className="flex border-b border-slate-100 bg-slate-50">
                <button
                  onClick={() => setActiveTab('theory')}
                  className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'theory'
                      ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">1. Kiến thức</span>
                  <span className="sm:hidden">Lý thuyết</span>
                </button>
                <button
                  onClick={() => setActiveTab('hint')}
                  className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'hint'
                      ? 'border-pink-500 text-pink-700 bg-pink-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">2. Hướng dẫn</span>
                  <span className="sm:hidden">Gợi ý</span>
                </button>
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'solution'
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">3. Lời giải</span>
                  <span className="sm:hidden">Chi tiết</span>
                </button>
              </div>

              {/* Content Area */}
              <div className="p-5 md:p-6 bg-white min-h-[200px]">
                 {message.data && (
                    <>
                        <div className={activeTab === 'theory' ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-indigo-800 mb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Kiến thức liên quan
                            </h3>
                            <MathRenderer content={message.data.theory} />
                        </div>
                        <div className={activeTab === 'hint' ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-pink-700 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Hướng dẫn giải nhanh
                            </h3>
                            <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                                <MathRenderer content={message.data.hint} />
                            </div>
                        </div>
                        <div className={activeTab === 'solution' ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
                                <Calculator className="w-5 h-5" />
                                Lời giải chi tiết
                            </h3>
                             <div className="pl-4 border-l-4 border-emerald-100">
                                <MathRenderer content={message.data.solution} />
                            </div>
                        </div>
                    </>
                 )}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;