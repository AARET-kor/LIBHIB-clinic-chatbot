import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';
import ClipboardPanel from './ClipboardPanel';

export default function SidePanel() {
  const { isAuthenticated, authReady } = useAuth();

  if (!authReady) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#FAF6F3', gap: 12,
      }}>
        <div style={{ fontSize: 24, animation: 'spin 1.4s linear infinite', color: '#A47764' }}>✦</div>
        <p style={{ fontSize: 11, color: '#B09080', letterSpacing: '0.08em', fontFamily: "'Inter', system-ui, sans-serif" }}>TikiDoc 로딩 중...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return isAuthenticated ? <ClipboardPanel /> : <LoginForm />;
}
