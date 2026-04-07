import { useState, useCallback } from 'react';

/**
 * SSE 스트리밍 POST 요청을 처리하는 훅
 */
export function useStreamApi() {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamPost = useCallback(async (url, body, { onChunk, onDone, onError } = {}) => {
    setIsStreaming(true);
    let result = '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onDone?.(result);
            setIsStreaming(false);
            return result;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.delta?.text || '';
            if (text) {
              result += text;
              onChunk?.(text, result);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
      onError?.(err);
    } finally {
      setIsStreaming(false);
    }

    onDone?.(result);
    return result;
  }, []);

  /**
   * 비스트리밍 POST (translate-reply 등)
   */
  const post = useCallback(async (url, body) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }, []);

  return { streamPost, post, isStreaming };
}
