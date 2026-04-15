import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';

/**
 * useSalesPitch — Visual Sales Mapping & Smart Quotation
 *
 * @returns {{
 *   suggest:      (message: string, opts: { clinicId }) => Promise<void>
 *   suggestions:  Array<{ id, name_ko, name_en, category, price_range, description_ko, reason }>
 *   suggesting:   boolean
 *   suggestError: string | null
 *   createQuote:  (opts) => Promise<void>
 *   quoteUrl:     string | null
 *   creating:     boolean
 *   createError:  string | null
 *   resetSales:   () => void
 * }}
 */
export function useSalesPitch() {
  const [suggestions,  setSuggestions]  = useState([]);
  const [suggesting,   setSuggesting]   = useState(false);
  const [suggestError, setSuggestError] = useState(null);

  const [quoteUrl,    setQuoteUrl]    = useState(null);
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState(null);

  const suggest = useCallback(async (message, { clinicId } = {}) => {
    const msg = message?.trim();
    if (!msg || suggesting) return;

    setSuggesting(true);
    setSuggestError(null);
    setSuggestions([]);
    setQuoteUrl(null);
    setCreateError(null);

    try {
      const res = await fetch(`${API_BASE}/api/procedures/suggest`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg, clinicId }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `서버 오류 (HTTP ${res.status})`);
      }
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      const isNetwork = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
      setSuggestError(isNetwork
        ? `서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.`
        : err.message
      );
    } finally {
      setSuggesting(false);
    }
  }, [suggesting]);

  const createQuote = useCallback(async ({
    clinicId, clinicName, patientMessage, patientLanguage, procedures, notes,
  }) => {
    if (!clinicId || !procedures?.length || creating) return;

    setCreating(true);
    setCreateError(null);
    setQuoteUrl(null);

    try {
      const res = await fetch(`${API_BASE}/api/quotes`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          clinicId, clinicName, patientMessage, patientLanguage, procedures, notes,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `서버 오류 (HTTP ${res.status})`);
      }
      const data = await res.json();
      setQuoteUrl(data.url);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }, [creating]);

  const resetSales = useCallback(() => {
    setSuggestions([]);
    setSuggestError(null);
    setQuoteUrl(null);
    setCreateError(null);
  }, []);

  return {
    suggest,
    suggestions,
    suggesting,
    suggestError,
    createQuote,
    quoteUrl,
    creating,
    createError,
    resetSales,
  };
}
