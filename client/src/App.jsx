import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import ChatList from './components/chat/ChatList';
import ChatWindow from './components/chat/ChatWindow';
import AftercareTab from './components/aftercare/AftercareTab';
import StatsTab from './components/stats/StatsTab';
import { conversations as initialConversations } from './data/mockData';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState(initialConversations[0].id);

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const handleConvUpdate = (convId, updates) => {
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, ...updates } : c)
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="flex flex-1 min-w-0 overflow-hidden">

        {/* ── 상담 관리 ── */}
        {activeTab === 'chat' && (
          <>
            <ChatList
              conversations={conversations}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
            />

            {selectedConv ? (
              <ChatWindow
                key={selectedConv.id}
                conv={selectedConv}
                onConvUpdate={handleConvUpdate}
              />
            ) : (
              <EmptyState />
            )}
          </>
        )}

        {/* ── 애프터케어 ── */}
        {activeTab === 'aftercare' && (
          <AftercareTab />
        )}

        {/* ── 통계 ── */}
        {activeTab === 'stats' && (
          <StatsTab />
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <MessageSquare size={28} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-slate-500">상담을 선택하세요</p>
      <p className="text-xs text-slate-400">왼쪽 목록에서 환자 상담을 선택하면 대화 내용이 표시됩니다</p>
    </div>
  );
}
