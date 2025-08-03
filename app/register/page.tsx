'use client';

import React, { useEffect } from 'react';
import { 
  WalletProvider, 
  ConnectButton, 
  useCurrentAccount, 
  SuiClientProvider,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';
import { useRouter } from 'next/navigation';

const queryClient = new QueryClient();

const WalletInfo: React.FC = () => {
  const account = useCurrentAccount();
  const router = useRouter();

  useEffect(() => {
    if (account?.address) {
      // Save user to Firestore via API
      fetch('/api/saveUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account.address }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Redirect to dashboard after successful save
            router.push(`/personal/dashboard?address=${account.address}`);
          } else {
            console.error('Save failed:', data.error);
          }
        })
        .catch((error) => console.error('API call failed:', error));

      // Note: Redirect is inside the fetch callback to ensure save completes
    }
  }, [account, router]);

  return (
    <div>
      {account ? (
        <p>✅ Connected to: {account.address}. Saving and redirecting...</p>
      ) : (
        <p>🔌 Wallet not connected</p>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    fontFamily: 'sans-serif',
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider 
        networks={{ devnet: { url: getFullnodeUrl('devnet') }}}
        defaultNetwork="devnet"
      >
        <WalletProvider>
          <div style={containerStyle}>
            <h1>Wallet Connection</h1>
            <ConnectButton />
            <WalletInfo />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export default App;