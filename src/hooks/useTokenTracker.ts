import { useState, useEffect, useCallback } from 'react';
import type { TokenUsage, TokenStats } from '../types';

// DeepSeek pricing (as of 2024)
const DEEPSEEK_PRICING = {
  input: 0.00014, // $0.00014 per 1K tokens
  output: 0.00028, // $0.00028 per 1K tokens
};

const STORAGE_KEY = 'deepseek_token_usage';

export function useTokenTracker() {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    totalTokens: 0,
    totalCost: 0,
    requests: 0,
    lastUpdated: new Date().toISOString(),
  });

  // Load token usage from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTokenUsage(parsed);
      }
    } catch (error) {
      console.error('Failed to load token usage from localStorage:', error);
    }
  }, []);

  // Save token usage to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenUsage));
    } catch (error) {
      console.error('Failed to save token usage to localStorage:', error);
    }
  }, [tokenUsage]);

  const addTokenUsage = useCallback((stats: TokenStats) => {
    setTokenUsage(prev => ({
      totalTokens: prev.totalTokens + stats.totalTokens,
      totalCost: prev.totalCost + stats.cost,
      requests: prev.requests + 1,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const resetTokenUsage = useCallback(() => {
    setTokenUsage({
      totalTokens: 0,
      totalCost: 0,
      requests: 0,
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  const calculateCost = useCallback((inputTokens: number, outputTokens: number): number => {
    const inputCost = (inputTokens / 1000) * DEEPSEEK_PRICING.input;
    const outputCost = (outputTokens / 1000) * DEEPSEEK_PRICING.output;
    return inputCost + outputCost;
  }, []);

  const formatCost = useCallback((cost: number): string => {
    if (cost < 0.001) {
      return `$${(cost * 1000).toFixed(2)}m`; // Show in millicents
    } else if (cost < 1) {
      return `$${(cost * 100).toFixed(2)}c`; // Show in cents
    } else {
      return `$${cost.toFixed(2)}`;
    }
  }, []);

  const formatTokens = useCallback((tokens: number): string => {
    if (tokens < 1000) {
      return tokens.toString();
    } else if (tokens < 1000000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    } else {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
  }, []);

  return {
    tokenUsage,
    addTokenUsage,
    resetTokenUsage,
    calculateCost,
    formatCost,
    formatTokens,
  };
}
