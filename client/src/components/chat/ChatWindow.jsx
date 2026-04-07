import { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreHorizontal, RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ReplyArea from './ReplyArea';
import ChannelBadge from './ChannelBadge';

const CHANNEL_LABEL = {
  instagram: 'Instagram DM',
  kakao: 'KakaoTalk',
  whatsapp: 'WhatsApp',
};

export default function ChatWindow({ conv, onConvUpdate }) {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState(conv.messages);

  // Sync messages when conversation changes
  useEffect(() => {
    setMessages(conv.messages);
  }, [conv.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageSent = (newMsg) => {
    const updated = [...messages, newMsg];
    setMessages(updated);
    onConvUpdate?.(conv.id, { messages: updated, status: 'replied' });
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-slate-50">
      {/* Chat header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full ${conv.patient.color} flex items-center justify-center text-sm font-semibold`}>
              {conv.patient.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              <ChannelBadge channel={conv.channel} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">{conv.patient.name}</h3>
              <span className="text-base">{conv.patient.flag}</span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {conv.patient.langName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-slate-400">{CHANNEL_LABEL[conv.channel]}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-navy-600 font-medium">{conv.procedureName}</span>
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors" title="통화">
            <Phone size={15} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors" title="영상통화">
            <Video size={15} />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors" title="더보기">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 flex flex-col gap-4">
        {/* Date separator */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">오늘</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            patient={conv.patient}
            channel={conv.channel}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply area */}
      <ReplyArea conv={conv} onMessageSent={handleMessageSent} />
    </div>
  );
}
