'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    let messageReceived = false;

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

      if (event.data?.type === 'AUTH_MESSAGE' && !messageReceived) {
        messageReceived = true; // Prevent duplicate processing
        console.log('📥 Received AUTH_MESSAGE:', event.data);
        
        const { token, accessToken, user } = event.data;
        const finalToken = token || accessToken;

        if (finalToken) {
          localStorage.setItem('token', finalToken);
          localStorage.setItem('accessToken', finalToken);
          localStorage.setItem('authToken', finalToken);
          console.log('✅ Token stored:', finalToken);
        }

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

        // Refresh Next.js router cache without full reload
        router.refresh();
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