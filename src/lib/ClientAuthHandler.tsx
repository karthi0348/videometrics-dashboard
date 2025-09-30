'use client';

import { useEffect } from 'react';

export default function ClientAuthHandler() {
  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://videometricsui.salmonrock-70d8a746.eastus.azurecontainerapps.io/') return;

      if (event.data?.type === 'AUTH_MESSAGE') {
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

        event.source?.postMessage(
          { type: 'AUTH_STORED', success: true },
          event.origin
        );
      }
    };

    window.addEventListener('message', receiveMessage);
    return () => window.removeEventListener('message', receiveMessage);
  }, []);

  return null; 
}
