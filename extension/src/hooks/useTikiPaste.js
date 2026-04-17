import { useState, useCallback } from 'react';

// Production: app.tikidoc.xyz / 로컬 개발: .env.local에서 VITE_API_BASE_URL 변경
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://app.tikidoc.xyz';

/**
 * useTikiPaste — /api/tiki-paste 호출 훅
 *
 * @returns {{
 *   generate: (message: string, opts?: { clinicId?: string, clinicName?: string }) => Promise<void>,
 *   result: { detected_language: string, intent: string, options: { kind, firm, booking } } | null,
 *   loading: boolean,
 *   error: string | null,
 *   reset: () => void,
 * }}
 */
export function useTikiPaste() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const generate = useCallback(async (message, { clinicId, clinicName } = {}) => {
    const msg = message?.trim();
    if (!msg || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/tiki-paste`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message: msg,
          ...(clinicId   && { clinicId }),
          ...(clinicName && { clinicName }),
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `서버 오류 (HTTP ${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      const isNetwork = err.message.includes('Failed to fetch')
        || err.message.includes('NetworkError')
        || err.message.includes('net::ERR');
      console.error('[TikiPaste] fetch 오류:', err.message, '\n  URL:', `${API_BASE}/api/tiki-paste`);
      if (isNetwork) {
        setError(`서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.\n대상: ${API_BASE}`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { generate, result, loading, error, reset };
}
