'use client';

import React, { useEffect, useState } from 'react';
import { 
  WalletProvider, 
  ConnectButton, 
  useCurrentAccount, 
  SuiClientProvider,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import '@mysten/dapp-kit/dist/index.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ArrowLeft, Wallet, Shield, Zap } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import ZkLoginHandler from '@/components/ZkLoginHandler';

const queryClient = new QueryClient();

const WalletInfo: React.FC = () => {
  const account = useCurrentAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account?.address) {
      setIsLoading(true);
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
            setTimeout(() => {
              router.push('/personal/dashboard');
            }, 2000);
          } else {
            console.error('Save failed:', data.error);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('API call failed:', error);
          setIsLoading(false);
        });
    }
  }, [account, router]);

  if (account && isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
        </div>
        <p className="text-white text-lg font-medium">Creating your account...</p>
        <p className="text-white/80 text-sm mt-2">Connected to: {account.address.slice(0, 8)}...{account.address.slice(-8)}</p>
      </div>
    );
  }

  if (account && !isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">✓</span>
        </div>
        <p className="text-white text-lg font-medium">Account Created Successfully!</p>
        <p className="text-white/80 text-sm mt-2">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return null;
};

const RegistrationPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [authMethod, setAuthMethod] = useState<'wallet' | 'google' | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // NOTE: Removed auto-redirect for authenticated users to allow account switching
  // Users can now register with different accounts even if they have an existing session

  const handleGoogleSignupSuccess = (address: string) => {
    console.log('🎉 Google signup successful!', { address })
    setSignupError(null)
    
    // Note: Manual redirect is now handled by the GoogleSignInButton component
    // No automatic redirect needed here
  }

  const handleGoogleSignupError = (error: string) => {
    console.error('❌ Google signup failed:', error)
    setSignupError(error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-lg' : 'bg-white/95 backdrop-blur-md'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-slate-800 text-lg">FUTUROPAL</span>
            </Link>

            {/* Back Button */}
            <Link href="/" className="flex items-center space-x-2 text-slate-700 hover:text-blue-600 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            {/* Language Selector */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-700">EN</span>
              <ChevronDown className="w-4 h-4 text-slate-700" />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Registration Section */}
      <section className="pt-20 pb-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-400/20 rounded-full animate-ping"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Registration Content */}
            <div className="text-white">
              <div className="text-orange-300 font-semibold text-sm uppercase tracking-wider mb-4">
                JOIN THE FUTURE OF LEARNING
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Create Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  FuturoPal
                </span>
                <br />
                Account
              </h1>
              <p className="text-lg leading-relaxed mb-8 text-white/90 max-w-xl">
                Connect your wallet to start your personalized learning journey. Earn NFT points, customize your digital room, and unlock unlimited educational possibilities.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: <Wallet className="w-5 h-5" />, text: "Secure wallet integration" },
                  { icon: <Shield className="w-5 h-5" />, text: "Your data stays private" },
                  { icon: <Zap className="w-5 h-5" />, text: "Instant setup, no hassle" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 text-white/90">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Authentication Card */}
            <div className="flex justify-center">
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Get Started</h2>
                  <p className="text-slate-600">Choose how you'd like to create your account</p>
                </div>

                {/* Authentication Options */}
                {!authMethod && (
                  <div className="space-y-4">
                    {/* Wallet Connection Option */}
                    <button
                      onClick={() => setAuthMethod('wallet')}
                      className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-6 py-3 font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Wallet className="w-5 h-5" />
                      <span>Connect Wallet</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <div className="px-3 text-gray-500 text-sm">or</div>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Google OAuth Option */}
                    <button
                      onClick={() => setAuthMethod('google')}
                      className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}

                {/* Wallet Authentication Flow */}
                {authMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">Connect Wallet</h3>
                      <button
                        onClick={() => setAuthMethod(null)}
                        className="text-sm text-slate-600 hover:text-slate-800"
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="wallet-connect-container">
                      <ConnectButton />
                    </div>
                    <WalletInfo />
                  </div>
                )}

                {/* Google Authentication Flow */}
                {authMethod === 'google' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">Google Sign-In</h3>
                      <button
                        onClick={() => setAuthMethod(null)}
                        className="text-sm text-slate-600 hover:text-slate-800"
                      >
                        ← Back
                      </button>
                    </div>
                    <GoogleSignInButton
                      onSuccess={handleGoogleSignupSuccess}
                      onError={handleGoogleSignupError}
                      disableAutoRedirect={true}
                      showLoginButton={true}
                    />
                    {signupError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{signupError}</p>
                      </div>
                    )}
                    <ZkLoginHandler />
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">
            Why Join FuturoPal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎓",
                title: "Personalized Learning",
                description: "AI-powered lessons tailored to your learning style and pace"
              },
              {
                icon: "🏆",
                title: "Earn Rewards",
                description: "Get NFT points for every quiz completed and milestone reached"
              },
              {
                icon: "🏠",
                title: "Digital Creativity",
                description: "Design and customize your own virtual learning space"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-300">
            All rights reserved FUTUROPAL Built with ❤️ during the Hackathon
          </p>
        </div>
      </footer>

      {/* Custom Styles for Wallet Connect Button */}
      <style jsx global>{`
        .wallet-connect-container [data-dapp-kit="connectButton"] {
          width: 100% !important;
          justify-content: center !important;
        }
        
        .wallet-connect-container [data-dapp-kit="connectButton"] button {
          width: 100% !important;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          border: none !important;
          padding: 16px 24px !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }
        
        .wallet-connect-container [data-dapp-kit="connectButton"] button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider 
          networks={{ devnet: { url: getFullnodeUrl('devnet') }}}
          defaultNetwork="devnet"
        >
          <WalletProvider>
            <RegistrationPage />
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default App;