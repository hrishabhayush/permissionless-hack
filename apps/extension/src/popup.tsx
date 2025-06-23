import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface WalletData {
  solanaAddress: string;
  ethereumAddress: string;
}

const Popup: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData>({
    solanaAddress: '',
    ethereumAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load existing wallet data on component mount
  useEffect(() => {
    loadExistingWalletData();
  }, []);

  const loadExistingWalletData = async () => {
    try {
      // Load wallet data from chrome.storage.session
      const result = await chrome.storage.session.get(['requity_solana_wallet', 'requity_ethereum_wallet']);
      
      setWalletData({
        solanaAddress: result.requity_solana_wallet || '',
        ethereumAddress: result.requity_ethereum_wallet || ''
      });
    } catch (error) {
      console.log('Could not load existing wallet data:', error);
    }
  };

  const handleInputChange = (field: keyof WalletData, value: string) => {
    setWalletData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Store wallet addresses in chrome.storage.session
      await chrome.storage.session.set({
        requity_solana_wallet: walletData.solanaAddress,
        requity_ethereum_wallet: walletData.ethereumAddress
      });

      // Also store in target domains session storage if we can access them
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const targetDomains = ['requity.vercel.app', 'stepup.orbiter.website'];
        const currentDomain = targetDomains.find(domain => tab?.url?.includes(domain));
        
        if (tab?.id && currentDomain) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (walletData: WalletData) => {
              try {
                // Store in page's session storage
                sessionStorage.setItem('requity_solana_wallet', walletData.solanaAddress);
                sessionStorage.setItem('requity_ethereum_wallet', walletData.ethereumAddress);
                
                // Dispatch a custom event to notify the page
                window.dispatchEvent(new CustomEvent('requity_wallets_updated', {
                  detail: walletData
                }));
                
                return { success: true };
              } catch (error) {
                return { success: false, error: (error as Error).message };
              }
            },
            args: [walletData]
          });
        }
      } catch (error) {
        console.log('Could not sync to page session storage:', error);
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = walletData.solanaAddress.trim() || walletData.ethereumAddress.trim();

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
            Requity
          </h2>
          <p style={{ margin: '0', fontSize: '14px', opacity: '0.8' }}>
            Connect your wallets to earn rewards
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Solana Wallet Address
            </label>
            <input
              type="text"
              value={walletData.solanaAddress}
              onChange={(e) => handleInputChange('solanaAddress', e.target.value)}
              placeholder="Enter your Solana wallet address"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Ethereum Wallet Address
            </label>
            <input
              type="text"
              value={walletData.ethereumAddress}
              onChange={(e) => handleInputChange('ethereumAddress', e.target.value)}
              placeholder="Enter your Ethereum wallet address"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: isSuccess 
                ? '#10b981' 
                : isFormValid 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(255, 255, 255, 0.3)',
              color: isFormValid ? '#374151' : 'rgba(255, 255, 255, 0.6)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Saving...' : isSuccess ? '✓ Saved!' : 'OK'}
          </button>
        </form>

                 <div style={{
           marginTop: '16px',
           padding: '12px',
           background: 'rgba(255, 255, 255, 0.1)',
           borderRadius: '8px',
           fontSize: '12px',
           opacity: '0.8'
         }}>
           <p style={{ margin: '0 0 4px 0' }}>
             📍 <strong>Storage:</strong> Browser session (survives tab closure)
           </p>
           <p style={{ margin: '0' }}>
             💡 Wallets persist until browser restart
           </p>
         </div>
      </div>
    </div>
  );
};

// Initialize the popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} 