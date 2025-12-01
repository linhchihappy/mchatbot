import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileType } from 'lucide-react';
import { ChatMessage, Role } from './types';
import { solveMathProblem } from './services/geminiService';
import { fileToBase64, generateId } from './utils/fileUtils';
import MessageBubble from './components/MessageBubble';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;

    // 1. Prepare User Message
    let fileBase64: string | undefined = undefined;
    let mimeType: string | undefined = undefined;

    if (selectedFile) {
      try {
        fileBase64 = await fileToBase64(selectedFile);
        mimeType = selectedFile.type;
      } catch (err) {
        console.error("File processing error", err);
        alert("Lỗi khi xử lý file. Vui lòng thử lại.");
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: Role.USER,
      text: inputValue,
      image: selectedFile?.type.startsWith('image/') ? fileBase64 : undefined,
      fileName: selectedFile?.name,
      mimeType: mimeType
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    // 2. Call API
    try {
      const resultData = await solveMathProblem(userMessage.text || "", fileBase64, mimeType);
      
      const botMessage: ChatMessage = {
        id: generateId(),
        role: Role.MODEL,
        data: resultData
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: Role.MODEL,
        isError: true,
        text: "Xin lỗi, tôi gặp sự cố khi giải bài toán này. Hãy thử lại hoặc cung cấp hình ảnh rõ hơn."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">
                ĐM Bài tập về nhà
              </h1>
              <p className="text-xs text-slate-500 font-medium">Được thiết kế bởi Chân Đức</p>
            </div>
          </div>
          <div className="hidden sm:flex text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            AI Math Tutor
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-slate-50 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-80 mt-10 sm:mt-0">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 animate-bounce-slow">
                <img src="https://picsum.photos/200/200?random=1" alt="Mascot" className="w-24 h-24 rounded-full object-cover opacity-80" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Chào bạn! Mình có thể giúp gì?</h2>
              <p className="text-slate-500 max-w-md mb-8">
                Gửi câu hỏi hoặc tải lên ảnh bài tập Toán. Mình sẽ giúp bạn ôn lại kiến thức, gợi ý và đưa ra lời giải chi tiết.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                 <button onClick={() => setInputValue("Giải phương trình: $x^2 - 5x + 6 = 0$")} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition text-left">
                    <span className="block font-semibold text-indigo-600 mb-1">Đại số</span>
                    <span className="text-sm text-slate-600">Giải phương trình bậc hai...</span>
                 </button>
                 <button onClick={() => setInputValue("Tính diện tích hình tròn có bán kính R=5cm")} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition text-left">
                    <span className="block font-semibold text-pink-600 mb-1">Hình học</span>
                    <span className="text-sm text-slate-600">Tính chu vi, diện tích...</span>
                 </button>
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 ml-4 animate-pulse">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  <span className="text-sm font-medium">Đang suy nghĩ...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto">
          {selectedFile && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100 w-fit animate-fade-in-up">
              {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
              ) : (
                  <FileType className="w-4 h-4 text-indigo-600" />
              )}
              <span className="text-xs font-medium text-indigo-700 max-w-[200px] truncate">
                {selectedFile.name}
              </span>
              <button onClick={handleClearFile} className="hover:bg-indigo-200 p-1 rounded-full text-indigo-600 transition">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-inner">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                title="Tải ảnh hoặc PDF"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Nhập câu hỏi hoặc tải ảnh bài tập..."
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 text-slate-700 placeholder:text-slate-400 max-h-32 min-h-[44px]"
              rows={1}
            />
            
            <button
              type="submit"
              disabled={isLoading || (!inputValue.trim() && !selectedFile)}
              className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
              AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;