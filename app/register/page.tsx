'use client'

import React, {useEffect} from 'react';
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
      // Redirect to the register page if no wallet is connected
      router.push(`../personal/dashboard?address=${account.address}`);
    }
  }, [account, router]);

  return (
    <div>
      {account ? (
        <p>✅ Connected to: {account.address}. Redirecting to dashboard...</p>
      ) : (
        <p>🔌 Wallet not connected</p>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    fontFamily: 'sans-serif'
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