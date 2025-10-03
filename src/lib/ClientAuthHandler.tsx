'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Clear localStorage BEFORE component mounts if it's a fresh login
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  if (params.get('fresh') === 'true' && window.opener) {
    console.log('🧹 Fresh login detected - clearing old auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

export default function ClientAuthHandler() {
  const router = useRouter();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Signal to parent window that we're ready to receive auth data
    if (window.opener) {
      console.log('📤 Sending READY message to parent window');
      window.opener.postMessage(
        { type: 'READY' },
        'https://videometricsui.salmonrock-70d8a746.eastus.azurecontainerapps.io'
      );
    }

    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://videometricsui.salmonrock-70d8a746.eastus.azurecontainerapps.io') return;

      if (event.data?.type === 'AUTH_MESSAGE') {
        console.log('📥 Received AUTH_MESSAGE:', event.data);
        
        const { token, accessToken, user } = event.data;
        const finalToken = token || accessToken;

        // Check if this is a new token (different from last one)
        const isNewToken = finalToken && finalToken !== lastTokenRef.current;
        
        if (isNewToken) {
          console.log('🆕 New token detected, updating auth data');
          lastTokenRef.current = finalToken;

          // Clear old auth data first
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');

          // Store new auth data
          localStorage.setItem('token', finalToken);
          localStorage.setItem('accessToken', finalToken);
          localStorage.setItem('authToken', finalToken);
          console.log('✅ Token stored:', finalToken);

          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            console.log('✅ User stored:', user);
          }

          // Send confirmation back to parent
          if (event.source && 'postMessage' in event.source) {
            event.source.postMessage(
              { type: 'AUTH_STORED', success: true },
              { targetOrigin: event.origin }
            );
          }

          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('auth-updated', { 
            detail: { token: finalToken, user } 
          }));

          // Force a hard refresh to clear all cache
          setTimeout(() => {
            window.location.href = window.location.pathname;
          }, 100);
        } else if (!finalToken) {
          console.warn('⚠️ No token in AUTH_MESSAGE');
        } else {
          console.log('ℹ️ Same token as before, skipping update');
        }
      }
    };

    window.addEventListener('message', receiveMessage);
    
    return () => {
      console.log('🧹 Cleaning up message listener');
      window.removeEventListener('message', receiveMessage);
    };
  }, [router]);

  return null; 
}
